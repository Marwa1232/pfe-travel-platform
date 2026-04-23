<?php

namespace App\Controller\Api;

use App\Entity\Booking;
use App\Entity\User;
use App\Service\CancellationPolicyService;
use App\Service\JwtService;
use App\Service\NotificationService;
use App\Repository\BookingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/bookings')]
class BookingApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private BookingRepository $bookingRepo,
        private CancellationPolicyService $policyService,
        private NotificationService $notificationService,
        private JwtService $jwtService
    ) {}

    private function getAuthenticatedUser(Request $request): ?User
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
            } catch (\Exception $e) {
                error_log('JWT decode error: ' . $e->getMessage());
            }
        }
        return null;
    }

    private function getDaysBeforeDeparture(Booking $booking): int
    {
        $session = $booking->getTripSession();
        if (!$session?->getStartDate()) return 0;

        $now  = new \DateTime();
        $diff = $session->getStartDate()->getTimestamp() - $now->getTimestamp();
        return max(0, (int) floor($diff / 86400));
    }

    private function getDefaultCancelOptions(float $totalPrice, int $daysBefore): array
    {
        $percent = match(true) {
            $daysBefore > 30 => 100,
            $daysBefore > 15 => 70,
            $daysBefore > 7  => 40,
            default          => 0,
        };
        return [
            'refundAmount'  => round($totalPrice * ($percent / 100), 2),
            'refundPercent' => $percent,
            'options'       => ['refund'],
        ];
    }

    #[Route('/{id}/cancel-options', name: 'api_bookings_cancel_options', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getCancelOptions(int $id, Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);

        $booking = $this->bookingRepo->find($id);
        if (!$booking) return $this->json(['error' => 'Booking not found'], Response::HTTP_NOT_FOUND);
        if ($booking->getUser()->getId() !== $user->getId()) return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);

        if ($booking->getStatus() === 'CANCELLED') {
            return $this->json(['error' => 'Booking already cancelled'], Response::HTTP_BAD_REQUEST);
        }

        $totalPrice  = (float) $booking->getTotalPrice();
        $daysBefore  = $this->getDaysBeforeDeparture($booking);
        $policy      = $booking->getTrip()->getCancellationPolicy();

        $options = $policy
            ? $this->policyService->getCancelOptions($policy, $daysBefore, $totalPrice)
            : $this->getDefaultCancelOptions($totalPrice, $daysBefore);

        return $this->json([
            'refundAmount'   => $options['refundAmount'],
            'refundPercent'  => $options['refundPercent'],
            'options'        => $options['options'],
            'daysBefore'     => $daysBefore,
            'totalPrice'     => $totalPrice,
            'allowVoucher'   => $policy?->isAllowVoucher() ?? false,
            'allowRebooking' => $policy?->isAllowRebooking() ?? false,
        ]);
    }

    #[Route('/{id}/cancel', name: 'api_bookings_cancel', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function cancel(Request $request, int $id): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        if (!$user) return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);

        $booking = $this->bookingRepo->find($id);
        if (!$booking) return $this->json(['error' => 'Booking not found'], Response::HTTP_NOT_FOUND);
        if ($booking->getUser()->getId() !== $user->getId()) return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);

        if ($booking->getStatus() === 'CANCELLED') {
            return $this->json(['error' => 'Already cancelled'], Response::HTTP_BAD_REQUEST);
        }

        $data   = json_decode($request->getContent(), true);
        $choice = $data['choice'] ?? 'refund';

        if (!in_array($choice, ['refund', 'voucher', 'rebooking'])) {
            return $this->json(['error' => 'Invalid choice. Use: refund, voucher, rebooking'], Response::HTTP_BAD_REQUEST);
        }

        $trip        = $booking->getTrip();
        $policy      = $trip->getCancellationPolicy();
        $totalPrice  = (float) $booking->getTotalPrice();
        $daysBefore  = $this->getDaysBeforeDeparture($booking);

        $cancelOptions = $policy
            ? $this->policyService->getCancelOptions($policy, $daysBefore, $totalPrice)
            : $this->getDefaultCancelOptions($totalPrice, $daysBefore);

        if ($choice === 'voucher' && !($policy?->isAllowVoucher() ?? false)) {
            return $this->json(['error' => 'Voucher option not available for this trip'], Response::HTTP_BAD_REQUEST);
        }
        if ($choice === 'rebooking' && !($policy?->isAllowRebooking() ?? false)) {
            return $this->json(['error' => 'Rebooking option not available for this trip'], Response::HTTP_BAD_REQUEST);
        }

        $booking->setStatus('CANCELLED');
        $booking->setCancellationReason($choice);
        $booking->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        $msgMap = [
            'refund'    => 'Votre remboursement sera traité sous 5-10 jours ouvrables.',
            'voucher'   => 'Un voucher vous sera envoyé par email.',
            'rebooking' => 'Vous pouvez rebooker gratuitement un autre voyage.',
        ];
        $this->notificationService->create(
            $user,
            'Réservation annulée',
            'Votre réservation "' . $trip->getTitle() . '" a été annulée. ' . ($msgMap[$choice] ?? ''),
            'cancel'
        );

        return $this->json([
            'message'      => 'Booking cancelled successfully',
            'choice'       => $choice,
            'refundAmount' => $cancelOptions['refundAmount'] ?? 0,
            'bookingId'    => $booking->getId(),
            'status'       => 'CANCELLED',
        ]);
    }
}