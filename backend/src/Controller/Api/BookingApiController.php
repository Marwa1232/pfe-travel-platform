<?php

namespace App\Controller\Api;

use App\Entity\Booking;
use App\Entity\User;
use App\Entity\Notification;
use App\Service\CancellationPolicyService;
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
        private NotificationService $notificationService
    ) {}

    #[Route('/{id}/cancel-options', name: 'api_bookings_cancel_options', methods: ['GET'])]
    public function getCancelOptions(int $id): JsonResponse
    {
        $booking = $this->bookingRepo->find($id);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], Response::HTTP_NOT_FOUND);
        }

        $trip = $booking->getTrip();
        $policy = $trip->getCancellationPolicy();
        
        if (!$policy) {
            return $this->json(['error' => 'No cancellation policy found'], Response::HTTP_NOT_FOUND);
        }

        $tripSession = $booking->getTripSession();
        if (!$tripSession || !$tripSession->getStartDate()) {
            return $this->json(['error' => 'Trip session not found'], Response::HTTP_NOT_FOUND);
        }

        $now = new \DateTime();
        $tripDate = $tripSession->getStartDate();
        $daysBefore = (int)floor(($tripDate->getTimestamp() - $now->getTimestamp()) / (86400));

        $totalPrice = (float) $booking->getTotalPrice();
        $options = $this->policyService->getCancelOptions($policy, $daysBefore, $totalPrice);

        return $this->json($options);
    }

    #[Route('/{id}/cancel', name: 'api_bookings_cancel', methods: ['POST'])]
    public function cancel(Request $request, int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $booking = $this->bookingRepo->find($id);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], Response::HTTP_NOT_FOUND);
        }

        if ($booking->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        $choice = $data['choice'] ?? 'refund';

        if (!in_array($choice, ['refund', 'voucher', 'rebooking'])) {
            return $this->json(['error' => 'Invalid choice'], Response::HTTP_BAD_REQUEST);
        }

        $trip = $booking->getTrip();
        $policy = $trip->getCancellationPolicy();

        if (!$policy) {
            return $this->json(['error' => 'No cancellation policy found'], Response::HTTP_NOT_FOUND);
        }

        $tripSession = $booking->getTripSession();
        $now = new \DateTime();
        $daysBefore = $tripSession && $tripSession->getStartDate() 
            ? (int)floor(($tripSession->getStartDate()->getTimestamp() - $now->getTimestamp()) / (86400))
            : 0;

        $totalPrice = (float) $booking->getTotalPrice();
        $cancelOptions = $this->policyService->getCancelOptions($policy, $daysBefore, $totalPrice);

        if ($choice === 'voucher' && !$policy->isAllowVoucher()) {
            return $this->json(['error' => 'Voucher option not allowed'], Response::HTTP_BAD_REQUEST);
        }

        if ($choice === 'rebooking' && !$policy->isAllowRebooking()) {
            return $this->json(['error' => 'Rebooking option not allowed'], Response::HTTP_BAD_REQUEST);
        }

        $booking->setStatus('CANCELLED');
        $booking->setCancellationReason($choice);
        $booking->setUpdatedAt(new \DateTimeImmutable());

        $this->em->flush();

        $this->notificationService->create(
            $user,
            'Annulation confirmée',
            'Votre réservation pour "' . $trip->getTitle() . '" a été annulée. Votre choix: ' . $choice,
            'cancel'
        );

        return $this->json([
            'message' => 'Booking cancelled successfully',
            'choice' => $choice,
            'refundAmount' => $cancelOptions['refundAmount'] ?? 0,
        ]);
    }
}
