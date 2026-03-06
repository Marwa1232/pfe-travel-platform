<?php

namespace App\Controller\Api;

use App\Entity\Booking;
use App\Entity\OrganizerProfile;
use App\Entity\Trip;
use App\Entity\User;
use App\Repository\BookingRepository;
use App\Repository\TripRepository;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/organizer')]
class OrganizerApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private BookingRepository $bookingRepo,
        private TripRepository $tripRepo,
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

    #[Route('/stats', name: 'api_organizer_stats', methods: ['GET'])]
    public function getStats(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        
        // Get organizer profile
        $organizerProfile = $this->em->getRepository(OrganizerProfile::class)->findOneBy(['user' => $user]);
        
        if (!$organizerProfile) {
            return $this->json(['error' => 'Organizer profile not found'], Response::HTTP_NOT_FOUND);
        }
        
        // Get trips for this organizer
        $trips = $this->tripRepo->findBy(['organizer' => $organizerProfile]);
        $tripIds = array_map(fn($t) => $t->getId(), $trips);
        
        // Get bookings for these trips
        $bookings = empty($tripIds) ? [] : $this->bookingRepo->findBy(['trip' => $tripIds]);
        
        $totalRevenue = 0;
        $confirmedBookings = 0;
        $pendingBookings = 0;
        
        foreach ($bookings as $booking) {
            if ($booking->getStatus() === 'CONFIRMED') {
                $totalRevenue += (float)$booking->getTotalPrice();
                $confirmedBookings++;
            } elseif ($booking->getStatus() === 'PENDING') {
                $pendingBookings++;
            }
        }
        
        return $this->json([
            'total_trips' => count($trips),
            'total_bookings' => count($bookings),
            'confirmed_bookings' => $confirmedBookings,
            'pending_bookings' => $pendingBookings,
            'total_revenue' => $totalRevenue,
        ]);
    }

    #[Route('/bookings', name: 'api_organizer_bookings', methods: ['GET'])]
    public function getBookings(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        
        // Get organizer profile
        $organizerProfile = $this->em->getRepository(OrganizerProfile::class)->findOneBy(['user' => $user]);
        
        if (!$organizerProfile) {
            return $this->json(['error' => 'Organizer profile not found'], Response::HTTP_NOT_FOUND);
        }
        
        // Get trips for this organizer
        $trips = $this->tripRepo->findBy(['organizer' => $organizerProfile]);
        $tripIds = array_map(fn($t) => $t->getId(), $trips);
        
        // Get query parameters
        $tripId = $request->query->get('trip_id');
        $status = $request->query->get('status');
        
        $criteria = [];
        if (!empty($tripIds)) {
            $criteria['trip'] = $tripIds;
        }
        if (!empty($tripId)) {
            $criteria['trip'] = $tripId;
        }
        if (!empty($status)) {
            $criteria['status'] = $status;
        }
        
        $bookings = empty($criteria) ? [] : $this->bookingRepo->findBy($criteria, ['created_at' => 'DESC']);
        
        $result = [];
        foreach ($bookings as $booking) {
            $result[] = [
                'id' => $booking->getId(),
                'trip_id' => $booking->getTrip()->getId(),
                'trip_title' => $booking->getTrip()->getTitle(),
                'user' => [
                    'id' => $booking->getUser()->getId(),
                    'first_name' => $booking->getUser()->getFirstName(),
                    'last_name' => $booking->getUser()->getLastName(),
                    'email' => $booking->getUser()->getEmail(),
                ],
                'num_travelers' => $booking->getNumTravelers(),
                'total_price' => $booking->getTotalPrice(),
                'currency' => $booking->getCurrency(),
                'status' => $booking->getStatus(),
                'created_at' => $booking->getCreatedAt()?->format('Y-m-d H:i:s'),
            ];
        }
        
        return $this->json($result);
    }

    #[Route('/trips', name: 'api_organizer_trips', methods: ['GET'])]
    public function getTrips(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        
        // Get organizer profile
        $organizerProfile = $this->em->getRepository(OrganizerProfile::class)->findOneBy(['user' => $user]);
        
        if (!$organizerProfile) {
            return $this->json(['error' => 'Organizer profile not found'], Response::HTTP_NOT_FOUND);
        }
        
        $trips = $this->tripRepo->findBy(['organizer' => $organizerProfile], ['created_at' => 'DESC']);
        
        return $this->json($trips, Response::HTTP_OK, [], ['groups' => 'trip:read']);
    }
}
