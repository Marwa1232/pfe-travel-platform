<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Entity\Payment;
use App\Entity\Trip;
use App\Entity\TripSession;
use App\Entity\User;
use App\Repository\BookingRepository;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/bookings')]
class BookingController extends AbstractController
{
    public function __construct(
        private BookingRepository $bookingRepo,
        private EntityManagerInterface $em,
        private JwtService $jwtService
    ) {}

    private function getCurrentUser(Request $request): ?User
    {
        $authHeader = $request->headers->get('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }
        
        $token = substr($authHeader, 7);
        $payload = $this->jwtService->decodeToken($token);
        
        if (!$payload || !isset($payload['id'])) {
            return null;
        }
        
        return $this->em->getRepository(User::class)->find($payload['id']);
    }

    #[Route('', name: 'api_bookings_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser($request);
            
            if (!$user) {
                return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
            }
            
            $data = json_decode($request->getContent(), true);
            error_log('Booking create data: ' . json_encode($data));

            $trip = $this->em->getRepository(Trip::class)->find($data['trip_id'] ?? 0);
            $session = $this->em->getRepository(TripSession::class)->find($data['trip_session_id'] ?? 0);

            if (!$trip || !$session) {
                return $this->json(['error' => 'Trip or session not found'], Response::HTTP_NOT_FOUND);
            }

            // Vérifier la disponibilité
            $existingBookings = $this->bookingRepo->countConfirmedForSession($session->getId());
            $available = $session->getMaxCapacity() - $existingBookings;

            if ($available < ($data['num_travelers'] ?? 1)) {
                return $this->json(['error' => 'Not enough available seats'], Response::HTTP_BAD_REQUEST);
            }

            // Déterminer le statut selon le méthode de paiement
            $paymentMethod = $data['payment_method'] ?? 'CASH';
            
            // Si paiement par carte bancaire, confirmer automatiquement
            // Si paiement espèces, status = PENDING (organisateur doit confirmer)
            $bookingStatus = in_array($paymentMethod, ['CARD', 'BANK_TRANSFER', 'STRIPE']) ? 'CONFIRMED' : 'PENDING';
            $paymentStatus = in_array($paymentMethod, ['CARD', 'BANK_TRANSFER', 'STRIPE']) ? 'PAID' : 'PENDING';

            // Créer la réservation
            $booking = new Booking();
            $booking->setUser($user);
            $booking->setTrip($trip);
            $booking->setTripSession($session);
            $booking->setNumTravelers($data['num_travelers'] ?? 1);
            $booking->setTotalPrice((string)($trip->getBasePrice() * $booking->getNumTravelers()));
            $booking->setCurrency($trip->getCurrency());
            $booking->setStatus($bookingStatus);

            // Créer le paiement
            $payment = new Payment();
            $payment->setBooking($booking);
            $payment->setAmount($booking->getTotalPrice());
            $payment->setCurrency($booking->getCurrency());
            $payment->setMethod($paymentMethod);
            $payment->setStatus($paymentStatus);

            $booking->setPayment($payment);

            $this->em->persist($booking);
            $this->em->persist($payment);
            $this->em->flush();

            return $this->json($booking, Response::HTTP_CREATED, [], ['groups' => 'booking:read']);
        } catch (\Throwable $e) {
            error_log('Booking error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            return $this->json(['error' => 'Booking failed: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/me', name: 'api_bookings_my', methods: ['GET'])]
    public function myBookings(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        
        $bookings = $this->bookingRepo->findBy(['user' => $user], ['created_at' => 'DESC']);

        return $this->json($bookings, Response::HTTP_OK, [], ['groups' => 'booking:read']);
    }

    #[Route('/{id}', name: 'api_bookings_show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id, Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        
        $booking = $this->bookingRepo->find($id);

        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que l'utilisateur est le propriétaire
        if ($booking->getUser()->getId() !== $user->getId() && !in_array('ROLE_ADMIN', $user->getRoles())) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        return $this->json($booking, Response::HTTP_OK, [], ['groups' => 'booking:read']);
    }

    #[Route('/{id}/confirm', name: 'api_bookings_confirm', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function confirm(int $id, Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        
        $booking = $this->bookingRepo->find($id);

        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que l'utilisateur est l'organisateur du voyage
        $trip = $booking->getTrip();
        if ($trip->getOrganizer()->getUser()->getId() !== $user->getId() && !in_array('ROLE_ADMIN', $user->getRoles())) {
            return $this->json(['error' => 'Access denied - only trip organizer can confirm'], Response::HTTP_FORBIDDEN);
        }

        // Confirmer la réservation
        $booking->setStatus('CONFIRMED');
        
        // Mettre à jour le paiement si nécessaire
        $payment = $booking->getPayment();
        if ($payment && $payment->getStatus() === 'PENDING') {
            $payment->setStatus('PAID');
        }

        $this->em->flush();

        return $this->json($booking, Response::HTTP_OK, [], ['groups' => 'booking:read']);
    }

    #[Route('/{id}', name: 'api_bookings_delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id, Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        
        $booking = $this->bookingRepo->find($id);

        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que l'utilisateur est le propriétaire ou l'organisateur
        $isOwner = $booking->getUser()->getId() === $user->getId();
        $isOrganizer = $booking->getTrip()->getOrganizer()->getUser()->getId() === $user->getId();
        $isAdmin = in_array('ROLE_ADMIN', $user->getRoles());

        if (!$isOwner && !$isOrganizer && !$isAdmin) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $this->em->remove($booking);
        $this->em->flush();

        return $this->json(['message' => 'Booking deleted'], Response::HTTP_OK);
    }
}
