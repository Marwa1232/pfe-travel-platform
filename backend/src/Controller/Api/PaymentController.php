<?php

namespace App\Controller\Api;

use App\Entity\Payment;
use App\Entity\User;
use App\Repository\BookingRepository;
use App\Repository\PaymentRepository;
use App\Service\CancellationPolicyService;
use App\Service\JwtService;
use App\Service\LoyaltyService;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\StripeClient;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/payments')]
class PaymentController extends AbstractController
{
    private StripeClient $stripe;

    public function __construct(
        private EntityManagerInterface $em,
        private BookingRepository $bookingRepo,
        private PaymentRepository $paymentRepo,
        private CancellationPolicyService $policyService,
        private NotificationService $notificationService,
        private JwtService $jwtService,
        private LoyaltyService $loyaltyService,
        private string $stripeSecretKey,
        private string $stripeWebhookSecret,
    ) {
        $this->stripe = new StripeClient($this->stripeSecretKey);
    }

    // ── Auth helper ─────────────────────────────────────
    private function getAuthUser(Request $request): ?User
    {
        $user = $this->getUser();
        if ($user instanceof User) return $user;

        $authHeader = $request->headers->get('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            try {
                $payload = $this->jwtService->decodeToken(substr($authHeader, 7));
                if ($payload && isset($payload['id'])) {
                    return $this->em->getRepository(User::class)->find($payload['id']);
                }
            } catch (\Exception $e) {}
        }
        return null;
    }

    // ── Calcul remboursement en centimes ────────────────────
    private function computeRefundCents(Payment $payment): int
    {
        $booking    = $payment->getBooking();
        $totalPrice = (float) $payment->getAmount();
        $policy     = $booking->getTrip()->getCancellationPolicy();

        $session    = $booking->getTripSession();
        $daysBefore = 0;
        if ($session?->getStartDate()) {
            $diff       = $session->getStartDate()->getTimestamp() - (new \DateTime())->getTimestamp();
            $daysBefore = max(0, (int) floor($diff / 86400));
        }

        if ($policy) {
            $opts    = $this->policyService->getCancelOptions($policy, $daysBefore, $totalPrice);
            $percent = $opts['refundPercent'];
        } else {
            $percent = match(true) {
                $daysBefore > 30 => 100,
                $daysBefore > 15 => 70,
                $daysBefore > 7  => 40,
                default          => 0,
            };
        }

        return (int) round($totalPrice * ($percent / 100) * 100);
    }

    // ════════════════════════════════════════════════════════
    //  1. Créer PaymentIntent
    //     POST /api/payments/create-intent/{bookingId}
    // ════════════════════════════════════════════════════════
    #[Route('/create-intent/{bookingId}', methods: ['POST'])]
    public function createIntent(int $bookingId, Request $request): JsonResponse
    {
        $user = $this->getAuthUser($request);
        if (!$user) return $this->json(['error' => 'Unauthorized'], 401);

        $booking = $this->bookingRepo->find($bookingId);
        if (!$booking) return $this->json(['error' => 'Booking not found'], 404);
        if ($booking->getUser()->getId() !== $user->getId()) return $this->json(['error' => 'Forbidden'], 403);

        // 1. Vérifier si déjà payé
        $existingPaid = $this->paymentRepo->findOneBy([
            'booking' => $booking,
            'status'  => 'SUCCEEDED',
        ]);
        if ($existingPaid) return $this->json(['error' => 'Already paid'], 400);

        // 2. Réutiliser l'intent existant si PENDING
        $existingPayment = $this->paymentRepo->findOneBy(['booking' => $booking]);
        if ($existingPayment?->getStripePaymentIntentId() && $existingPayment?->getStatus() === 'PENDING') {
            $intent = $this->stripe->paymentIntents->retrieve(
                $existingPayment->getStripePaymentIntentId()
            );
            return $this->json([
                'client_secret'     => $intent->client_secret,
                'payment_intent_id' => $intent->id,
                'amount'            => $intent->amount,
                'currency'          => $intent->currency,
            ]);
        }

        // 3. Créer un nouveau PaymentIntent
        $amountCents = (int) round((float) $booking->getTotalPrice() * 100);

        $intent = $this->stripe->paymentIntents->create([
            'amount'                    => $amountCents,
            'currency'                  => 'eur',
            'description'               => 'TripBooking - ' . $booking->getTrip()?->getTitle(),
            'automatic_payment_methods' => ['enabled' => true],
            'metadata'                  => [
                'booking_id' => $booking->getId(),
                'user_id'    => $user->getId(),
                'trip_id'    => $booking->getTrip()?->getId(),
            ],
        ]);

        // Créer ou mettre à jour le Payment en base
        $payment = $this->paymentRepo->findOneBy(['booking' => $booking]) ?? new Payment();
        $payment->setBooking($booking);
        $payment->setStripePaymentIntentId($intent->id);
        $payment->setAmount((string) $booking->getTotalPrice());
        $payment->setCurrency('EUR');
        $payment->setMethod('STRIPE');
        $payment->setStatus('PENDING');
        $payment->setTransactionRef($intent->id);
        $payment->setCreatedAt(new \DateTimeImmutable());

        $this->em->persist($payment);
        $this->em->flush();

        return $this->json([
            'client_secret'     => $intent->client_secret,
            'payment_intent_id' => $intent->id,
            'amount'            => $amountCents,
            'currency'          => 'eur',
        ]);
    }

    // ════════════════════════════════════════════════════════
    //  2. Rembourser
    //     POST /api/payments/refund/{bookingId}
    // ════════════════════════════════════════════════════════
    #[Route('/refund/{bookingId}', methods: ['POST'])]
    public function refund(int $bookingId, Request $request): JsonResponse
    {
        $user = $this->getAuthUser($request);
        if (!$user) return $this->json(['error' => 'Unauthorized'], 401);

        $booking = $this->bookingRepo->find($bookingId);
        if (!$booking) return $this->json(['error' => 'Booking not found'], 404);
        if ($booking->getUser()->getId() !== $user->getId()) return $this->json(['error' => 'Forbidden'], 403);

        $payment = $this->paymentRepo->findOneBy([
            'booking' => $booking,
            'status'  => 'SUCCEEDED',
        ]);
        if (!$payment) return $this->json(['error' => 'No successful payment found'], 400);

        if (!$payment->getstripe_payment_intent_id()) {
            return $this->json(['error' => 'No Stripe PaymentIntent found'], 400);
        }

        $refundCents = $this->computeRefundCents($payment);

        // Aucun remboursement applicable
        if ($refundCents <= 0) {
            $booking->setStatus('CANCELLED');
            $booking->setCancellationReason('refund');
            $booking->setUpdatedAt(new \DateTimeImmutable());
            $payment->setStatus('REFUNDED');
            $this->em->flush();

            return $this->json([
                'status'        => 'cancelled_no_refund',
                'refund_amount' => 0,
                'message'       => 'Booking cancelled. No refund per cancellation policy.',
            ]);
        }

        // Créer le remboursement sur Stripe
        try {
            $refund = $this->stripe->refunds->create([
                'payment_intent' => $payment->getstripe_payment_intent_id(),
                'amount'         => $refundCents,
                'reason'         => 'requested_by_customer',
                'metadata'       => ['booking_id' => $booking->getId()],
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Stripe refund failed: ' . $e->getMessage()], 500);
        }

        $refundAmount = $refundCents / 100;

        $payment->setRefundId($refund->id);
        $payment->setRefundAmount((string) $refundAmount);
        $payment->setStatus('REFUNDED');

        $booking->setStatus('CANCELLED');
        $booking->setCancellationReason('refund');
        $booking->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        $this->notificationService->create(
            $user,
            'Remboursement initié 💳',
            sprintf(
                'Un remboursement de %.2f EUR pour "%s" a été initié. Délai: 5-10 jours ouvrables.',
                $refundAmount,
                $booking->getTrip()?->getTitle()
            ),
            'refund'
        );

        return $this->json([
            'status'        => 'refunded',
            'refund_id'     => $refund->id,
            'refund_amount' => $refundAmount,
            'currency'      => 'eur',
        ]);
    }

    // ════════════════════════════════════════════════════════
    //  3. Webhook Stripe (pas de JWT !)
    //     POST /api/payments/webhook
    // ════════════════════════════════════════════════════════
    #[Route('/webhook', methods: ['POST'])]
    public function webhook(Request $request): Response
    {
        $payload   = $request->getContent();
        $sigHeader = $request->headers->get('Stripe-Signature');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                $this->stripeWebhookSecret
            );
        } catch (SignatureVerificationException $e) {
            error_log('Stripe webhook invalid signature: ' . $e->getMessage());
            return new Response('Invalid signature', 400);
        } catch (\Exception $e) {
            error_log('Stripe webhook error: ' . $e->getMessage());
            return new Response('Error: ' . $e->getMessage(), 400);
        }

        error_log('[Stripe Webhook] Event: ' . $event->type);

        match ($event->type) {
            'payment_intent.succeeded'      => $this->wh_paymentSucceeded($event->data->object),
            'payment_intent.payment_failed' => $this->wh_paymentFailed($event->data->object),
            'charge.refunded'               => $this->wh_chargeRefunded($event->data->object),
            'charge.dispute.created'        => $this->wh_disputeCreated($event->data->object),
            'charge.dispute.updated'        => $this->wh_disputeUpdated($event->data->object),
            'charge.dispute.closed'         => $this->wh_disputeClosed($event->data->object),
            default                         => null,
        };

        return new Response('OK', 200);
    }

    // ── Webhook handlers ────────────────────────────────────
    private function wh_paymentSucceeded(object $intent): void
    {
        $payment = $this->paymentRepo->findOneBy([
            'stripe_payment_intent_id' => $intent->id,
        ]);
        if (!$payment) {
            error_log("Payment not found: " . $intent->id);
            return;
        }
    
        $payment->setStatus('SUCCEEDED');
        $payment->setPaidAt(new \DateTime());
        $payment->getBooking()->setStatus('CONFIRMED');
        $this->em->flush();
        error_log('[Webhook] Payment succeeded BEFORE loyalty: ' . $intent->id);
    
        // ── Fidélité ──
        try {
            $booking = $payment->getBooking();
            $user    = $booking->getUser();
            error_log('[Loyalty] Trying earnPoints for user #' . $user->getId());
            $points  = $this->loyaltyService->earnPoints($user, $booking);
            error_log('[Loyalty] +' . $points . ' points pour user #' . $user->getId());
    
            $this->notificationService->create(
                $user,
                'Points fidélité gagnés 🎯',
                sprintf('Vous avez gagné %d points pour "%s".', $points, $booking->getTrip()?->getTitle()),
                'loyalty'
            );
        } catch (\Throwable $e) {
            error_log('[Loyalty] ERREUR: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
        }
    
        error_log('[Webhook] Payment succeeded DONE: ' . $intent->id);
    }

    private function wh_paymentFailed(object $intent): void
    {
        $payment = $this->paymentRepo->findOneBy([
            'stripe_payment_intent_id' => $intent->id,
        ]);
        if (!$payment) return;

        $payment->setStatus('FAILED');
        $this->em->flush();
        error_log('[Webhook] Payment failed: ' . $intent->id);
    }

    private function wh_chargeRefunded(object $charge): void
    {
        $intentId = $charge->payment_intent ?? null;
        if (!$intentId) return;

        $payment = $this->paymentRepo->findOneBy([
            'stripe_payment_intent_id' => $intentId,
        ]);
        if (!$payment) return;

        $payment->setStatus('REFUNDED');
        $payment->getBooking()->setStatus('CANCELLED');
        $this->em->flush();
        error_log('[Webhook] Charge refunded: ' . $intentId);
    }

    private function wh_disputeCreated(object $dispute): void
    {
        $intentId = $dispute->payment_intent ?? null;
        if (!$intentId) return;

        $payment = $this->paymentRepo->findOneBy([
            'stripe_payment_intent_id' => $intentId,
        ]);
        if (!$payment) return;

        $payment->setDisputeId($dispute->id);
        $payment->setDisputeStatus('needs_response');
        $this->em->flush();
        error_log('[Webhook] ⚠️  Dispute created: ' . $dispute->id);
    }

    private function wh_disputeUpdated(object $dispute): void
    {
        $payment = $this->paymentRepo->findOneBy([
            'dispute_id' => $dispute->id,  // snake_case car propriété $dispute_id dans l'entité
        ]);
        if (!$payment) return;

        $payment->setDisputeStatus($dispute->status);
        $this->em->flush();
        error_log('[Webhook] Dispute updated: ' . $dispute->id . ' → ' . $dispute->status);
    }

    private function wh_disputeClosed(object $dispute): void
    {
        $payment = $this->paymentRepo->findOneBy([
            'dispute_id' => $dispute->id,  // snake_case car propriété $dispute_id dans l'entité
        ]);
        if (!$payment) return;

        if ($dispute->status === 'won') {
            $payment->setDisputeStatus('closed_won');
            $payment->setStatus('SUCCEEDED');
            error_log('[Webhook] Dispute WON: ' . $dispute->id);
        } elseif ($dispute->status === 'lost') {
            $payment->setDisputeStatus('closed_lost');
            $payment->setStatus('DISPUTE_LOST');
            $payment->getBooking()->setStatus('CANCELLED');
            error_log('[Webhook] Dispute LOST: ' . $dispute->id);
        } else {
            $payment->setDisputeStatus('closed_' . $dispute->status);
        }

        $this->em->flush();
    }
}