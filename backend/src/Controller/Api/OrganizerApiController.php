<?php

namespace App\Controller\Api;

use App\Entity\Booking;
use App\Entity\OrganizerProfile;
use App\Entity\Payment;
use App\Entity\Trip;
use App\Entity\User;
use App\Repository\BookingRepository;
use App\Repository\TripRepository;
use App\Service\JwtService;
use App\Service\LoyaltyService;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\RequestStack;

#[Route('/api/organizer')]
class OrganizerApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private BookingRepository $bookingRepo,
        private TripRepository $tripRepo,
        private JwtService $jwtService,
        private LoyaltyService $loyaltyService,
        private NotificationService $notificationService,
        private RequestStack $requestStack
    ) {}

    private function JWTgetToken(): ?string
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) return null;
        
        $authHeader = $request->headers->get('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }
        
        return substr($authHeader, 7);
    }

    private function getCurrentUserFromToken(): ?User
    {
        $token = $this->JWTgetToken();
        if (!$token) return null;
        
        $payload = $this->jwtService->decodeToken($token);
        if (!$payload || !isset($payload['id'])) {
            return null;
        }
        
        return $this->em->getRepository(User::class)->find($payload['id']);
    }

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
            error_log('STATS: No user found');
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        
        error_log('STATS: User ID: ' . $user->getId() . ', Email: ' . $user->getEmail());
        
        $organizerProfile = $this->em->getRepository(OrganizerProfile::class)->findOneBy(['user' => $user]);
        
        if (!$organizerProfile) {
            error_log('STATS: No organizer profile for user');
        } else {
            error_log('STATS: Organizer profile ID: ' . $organizerProfile->getId());
        }
        
        if (!$organizerProfile) {
            return $this->json(['error' => 'Organizer profile not found'], Response::HTTP_NOT_FOUND);
        }
        
        $trips = $this->tripRepo->findBy(['organizer' => $organizerProfile]);
        error_log('STATS: Found ' . count($trips) . ' trips for organizer');
        $tripIds = array_map(fn($t) => $t->getId(), $trips);
        error_log('STATS: Trip IDs: ' . implode(', ', $tripIds));
        
        $bookings = empty($tripIds) ? [] : $this->bookingRepo->findBy(['trip' => $tripIds]);
        error_log('STATS: Found ' . count($bookings) . ' bookings for these trips');
        
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
        
        $monthlyRevenue = [];
        $monthlyBookings = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = new \DateTime();
            $month->modify("-$i months");
            $monthStr = $month->format('Y-m');
            $monthLabel = $month->format('M');
            
            $mRev = 0;
            $mBook = 0;
            foreach ($bookings as $booking) {
                $created = $booking->getCreatedAt();
                if ($created && $created->format('Y-m') === $monthStr) {
                    $mBook++;
                    if ($booking->getStatus() === 'CONFIRMED') {
                        $mRev += (float)$booking->getTotalPrice();
                    }
                }
            }
            $monthlyRevenue[] = ['month' => $monthLabel, 'rev' => $mRev, 'prev' => 0];
            $monthlyBookings[] = ['month' => $monthLabel, 'bookings' => $mBook];
        }
        
        $statusBreakdown = [
            ['name' => 'Confirmées', 'value' => $confirmedBookings, 'color' => '#0EA5A0'],
            ['name' => 'En attente', 'value' => $pendingBookings, 'color' => '#D97706'],
            ['name' => 'Annulées', 'value' => 0, 'color' => '#DC2626'],
        ];
        
        $weeklyData = [];
        $days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
        for ($i = 6; $i >= 0; $i--) {
            $date = new \DateTime();
            $date->modify("-$i days");
            $dateStr = $date->format('Y-m-d');
            
            $dayBookings = 0;
            foreach ($bookings as $booking) {
                $created = $booking->getCreatedAt();
                if ($created && $created->format('Y-m-d') === $dateStr) {
                    $dayBookings++;
                }
            }
            $weeklyData[] = ['d' => $days[6 - $i], 'v' => $dayBookings];
        }
        
        return $this->json([
            'total_trips' => count($trips),
            'total_bookings' => count($bookings),
            'confirmed_bookings' => $confirmedBookings,
            'pending_bookings' => $pendingBookings,
            'total_revenue' => $totalRevenue,
            'monthly_revenue' => $monthlyRevenue,
            'monthly_bookings' => $monthlyBookings,
            'status_breakdown' => $statusBreakdown,
            'weekly_data' => $weeklyData,
        ]);
    }

    #[Route('/bookings', name: 'api_organizer_bookings', methods: ['GET'])]
    public function getBookings(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        
        $organizerProfile = $this->em->getRepository(OrganizerProfile::class)->findOneBy(['user' => $user]);
        
        if (!$organizerProfile) {
            return $this->json(['error' => 'Organizer profile not found'], Response::HTTP_NOT_FOUND);
        }
        
        $trips = $this->tripRepo->findBy(['organizer' => $organizerProfile]);
        $tripIds = array_map(fn($t) => $t->getId(), $trips);
        
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
                    'first_name' => $booking->getUser()->getFirstName() ?? '',
                    'last_name' => $booking->getUser()->getLastName() ?? '',
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

    #[Route('/bookings/{id}/confirm-cash', methods: ['POST'])]
    public function confirmCashPayment(int $id, Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $organizerProfile = $this->em->getRepository(OrganizerProfile::class)
            ->findOneBy(['user' => $user]);
        if (!$organizerProfile) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        $booking = $this->bookingRepo->find($id);
        if (!$booking) {
            return $this->json(['error' => 'Not found'], 404);
        }

        if ($booking->getTrip()->getOrganizer()->getId() !== $organizerProfile->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        if ($booking->getStatus() !== 'PENDING') {
            return $this->json(['error' => 'Booking not in PENDING state'], 400);
        }

        $booking->setStatus('CONFIRMED');
        $booking->setUpdatedAt(new \DateTimeImmutable());

        $payment = $booking->getPayment();
        if (!$payment) {
            $payment = new Payment();
            $payment->setBooking($booking);
            $this->em->persist($payment);
        }
        $payment->setAmount($booking->getTotalPrice());
        $payment->setCurrency($booking->getCurrency());
        $payment->setMethod('CASH');
        $payment->setStatus('SUCCEEDED');
        $payment->setPaidAt(new \DateTime());

        // Commission plateforme — persiste au moment de la confirmation (immuable)
        $platformFee = round((float) $booking->getTotalPrice() * 0.10, 2);
        $payment->setPlatformFee((string) $platformFee);

        $points = $this->loyaltyService->earnPoints($booking->getUser(), $booking);

        $this->em->flush();

        $this->notificationService->notifyBookingConfirmed($booking);
        if ($points > 0) {
            $this->notificationService->create(
                $booking->getUser(),
                'Points fidélité gagnés',
                sprintf('Vous avez gagné %d points pour "%s".', $points, $booking->getTrip()->getTitle()),
                'loyalty'
            );
        }

        return $this->json([
            'message' => 'Booking confirmed',
            'booking_id' => $booking->getId(),
            'loyalty_points_earned' => $points,
        ]);
    }

    #[Route('/trips', name: 'api_organizer_trips', methods: ['GET'])]
    public function getTrips(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        
        $organizerProfile = $this->em->getRepository(OrganizerProfile::class)->findOneBy(['user' => $user]);
        
        if (!$organizerProfile) {
            return $this->json(['error' => 'Organizer profile not found'], Response::HTTP_NOT_FOUND);
        }
        
        $trips = $this->tripRepo->findBy(['organizer' => $organizerProfile], ['created_at' => 'DESC']);
        
        return $this->json($trips, Response::HTTP_OK, [], ['groups' => 'trip:read']);
    }

    #[Route('/profile', name: 'api_organizer_update_profile', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getCurrentUserFromToken();
        
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        
        $organizerProfile = $user->getOrganizerProfile();
        if (!$organizerProfile) {
            return $this->json(['error' => 'Organizer profile not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['agency_name'])) {
            $organizerProfile->setAgencyName($data['agency_name']);
        }
        if (isset($data['license_number'])) {
            $organizerProfile->setLicenseNumber($data['license_number']);
        }
        if (isset($data['address'])) {
            $organizerProfile->setAddress($data['address']);
        }
        if (isset($data['country'])) {
            $organizerProfile->setCountry($data['country']);
        }
        if (isset($data['description'])) {
            $organizerProfile->setDescription($data['description']);
        }
        if (isset($data['experience'])) {
            $organizerProfile->setExperience($data['experience']);
        }
        if (isset($data['website'])) {
            $organizerProfile->setWebsite($data['website']);
        }
        if (isset($data['facebook'])) {
            $organizerProfile->setFacebook($data['facebook']);
        }
        if (isset($data['instagram'])) {
            $organizerProfile->setInstagram($data['instagram']);
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Organizer profile updated successfully',
            'agency_name' => $organizerProfile->getAgencyName(),
            'license_number' => $organizerProfile->getLicenseNumber(),
            'address' => $organizerProfile->getAddress(),
            'country' => $organizerProfile->getCountry(),
            'description' => $organizerProfile->getDescription(),
            'experience' => $organizerProfile->getExperience(),
            'website' => $organizerProfile->getWebsite(),
            'facebook' => $organizerProfile->getFacebook(),
            'instagram' => $organizerProfile->getInstagram(),
        ]);
    }
}