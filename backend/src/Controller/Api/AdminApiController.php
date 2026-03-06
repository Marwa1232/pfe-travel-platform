<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\OrganizerProfile;
use App\Entity\Booking;
use App\Entity\Trip;
use App\Entity\Category;
use App\Entity\Destination;
use App\Entity\Payment;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/admin')]
class AdminApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private JwtService $jwtService
    ) {}

    private function getAuthenticatedUser(Request $request): ?User
    {
        $token = $request->headers->get('Authorization');
        
        if (!$token || !str_starts_with($token, 'Bearer ')) {
            return null;
        }
        
        $token = substr($token, 7);
        $payload = $this->jwtService->decodeToken($token);
        
        if (!$payload || !isset($payload['email'])) {
            return null;
        }
        
        return $this->em->getRepository(User::class)->findOneBy(['email' => $payload['email']]);
    }

    private function isAdmin(Request $request): bool
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return false;
        }
        
        $roles = $user->getRoles();
        return in_array('ROLE_ADMIN', $roles);
    }

    private function requireAdmin(Request $request): JsonResponse|true
    {
        if (!$this->isAdmin($request)) {
            return $this->json(['error' => 'Access denied. Admin only.'], Response::HTTP_FORBIDDEN);
        }
        return true;
    }

    #[Route('/stats', name: 'api_admin_stats', methods: ['GET'])]
    public function getStats(Request $request): JsonResponse
    {
        $authCheck = $this->requireAdmin($request);
        if ($authCheck instanceof JsonResponse) {
            return $authCheck;
        }

        // Count users (excluding organizers and admins)
        $users = $this->em->getRepository(User::class)->findAll();
        $regularUsers = array_filter($users, function($user) {
            $roles = $user->getRoles();
            return !in_array('ROLE_ORGANIZER', $roles) && !in_array('ROLE_ADMIN', $roles);
        });

        // Count organizers
        $organizers = $this->em->getRepository(OrganizerProfile::class)->findAll();
        
        // Count trips
        $trips = $this->em->getRepository(Trip::class)->findAll();
        
        // Calculate revenue (from completed payments)
        $bookings = $this->em->getRepository(Booking::class)->findAll();
        $revenue = 0;
        $completedBookings = 0;
        $pendingBookings = 0;
        $cancelledBookings = 0;
        foreach ($bookings as $booking) {
            if ($booking->getStatus() === 'CONFIRMED' || $booking->getStatus() === 'COMPLETED') {
                $revenue += (float) $booking->getTotalPrice();
                $completedBookings++;
            } elseif ($booking->getStatus() === 'PENDING' || $booking->getStatus() === 'PENDING_PAYMENT') {
                $pendingBookings++;
            } elseif ($booking->getStatus() === 'CANCELLED') {
                $cancelledBookings++;
            }
        }

        // Count pending organizers
        $pendingOrganizers = array_filter($organizers, function($org) {
            return $org->getStatus() === 'PENDING';
        });

        // Calculate conversion rate (bookings / users)
        $totalUsers = count($regularUsers);
        $conversionRate = $totalUsers > 0 ? round(($completedBookings / $totalUsers) * 100, 2) : 0;

        return $this->json([
            'totalUsers' => $totalUsers,
            'totalOrganizers' => count($organizers),
            'totalTrips' => count($trips),
            'totalRevenue' => $revenue,
            'pendingOrganizers' => count($pendingOrganizers),
            'completedBookings' => $completedBookings,
            'pendingBookings' => $pendingBookings,
            'cancelledBookings' => $cancelledBookings,
            'conversionRate' => $conversionRate,
        ]);
    }

    #[Route('/stats/detailed', name: 'api_admin_stats_detailed', methods: ['GET'])]
    public function getDetailedStats(Request $request): JsonResponse
    {
        $authCheck = $this->requireAdmin($request);
        if ($authCheck instanceof JsonResponse) {
            return $authCheck;
        }

        // User stats by month (last 6 months)
        $users = $this->em->getRepository(User::class)->findAll();
        $monthlyUsers = [];
        $now = new \DateTime();
        for ($i = 5; $i >= 0; $i--) {
            $month = (clone $now)->modify("-{$i} months");
            $monthKey = $month->format('Y-m');
            $count = 0;
            foreach ($users as $user) {
                $created = $user->getCreatedAt();
                if ($created && $created->format('Y-m') === $monthKey) {
                    $count++;
                }
            }
            $monthlyUsers[] = ['month' => $monthKey, 'count' => $count];
        }

        // Booking stats by month
        $bookings = $this->em->getRepository(Booking::class)->findAll();
        $monthlyBookings = [];
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = (clone $now)->modify("-{$i} months");
            $monthKey = $month->format('Y-m');
            $count = 0;
            $revenue = 0;
            foreach ($bookings as $booking) {
                $created = $booking->getCreatedAt();
                if ($created && $created->format('Y-m') === $monthKey && 
                    ($booking->getStatus() === 'CONFIRMED' || $booking->getStatus() === 'COMPLETED')) {
                    $count++;
                    $revenue += (float) $booking->getTotalPrice();
                }
            }
            $monthlyBookings[] = ['month' => $monthKey, 'count' => $count];
            $monthlyRevenue[] = ['month' => $monthKey, 'revenue' => $revenue];
        }

        // Trip stats by category
        $trips = $this->em->getRepository(Trip::class)->findAll();
        $categories = $this->em->getRepository(Category::class)->findAll();
        $tripsByCategory = [];
        foreach ($categories as $category) {
            $count = 0;
            foreach ($trips as $trip) {
                // Trip uses ManyToMany categories collection
                $tripCategories = $trip->getCategories();
                if ($tripCategories) {
                    foreach ($tripCategories as $tripCat) {
                        if ($tripCat->getId() === $category->getId()) {
                            $count++;
                            break;
                        }
                    }
                }
            }
            $tripsByCategory[] = [
                'category' => $category->getName(),
                'count' => $count
            ];
        }

        // Top destinations
        $destinations = $this->em->getRepository(Destination::class)->findAll();
        $topDestinations = [];
        foreach ($destinations as $destination) {
            $tripCount = 0;
            foreach ($trips as $trip) {
                // Trip uses ManyToMany destinations collection
                $tripDestinations = $trip->getDestinations();
                if ($tripDestinations) {
                    foreach ($tripDestinations as $tripDest) {
                        if ($tripDest->getId() === $destination->getId()) {
                            $tripCount++;
                            break;
                        }
                    }
                }
            }
            if ($tripCount > 0) {
                $topDestinations[] = [
                    'destination' => $destination->getName(),
                    'country' => $destination->getCountry(),
                    'tripCount' => $tripCount
                ];
            }
        }
        usort($topDestinations, function($a, $b) { return $b['tripCount'] - $a['tripCount']; });
        $topDestinations = array_slice($topDestinations, 0, 5);

        // Top organizers by bookings
        $organizers = $this->em->getRepository(OrganizerProfile::class)->findAll();
        $organizerBookings = [];
        foreach ($organizers as $organizer) {
            $user = $organizer->getUser();
            if (!$user) continue;
            $bookingCount = 0;
            $organizerRevenue = 0;
            foreach ($bookings as $booking) {
                $trip = $booking->getTrip();
                if ($trip && $trip->getOrganizer() && $trip->getOrganizer()->getId() === $organizer->getId()) {
                    if ($booking->getStatus() === 'CONFIRMED' || $booking->getStatus() === 'COMPLETED') {
                        $bookingCount++;
                        $organizerRevenue += (float) $booking->getTotalPrice();
                    }
                }
            }
            if ($bookingCount > 0) {
                $organizerBookings[] = [
                    'organizer' => $organizer->getAgencyName(),
                    'bookings' => $bookingCount,
                    'revenue' => $organizerRevenue
                ];
            }
        }
        usort($organizerBookings, function($a, $b) { return $b['bookings'] - $a['bookings']; });
        $topOrganizers = array_slice($organizerBookings, 0, 5);

        return $this->json([
            'monthlyUsers' => $monthlyUsers,
            'monthlyBookings' => $monthlyBookings,
            'monthlyRevenue' => $monthlyRevenue,
            'tripsByCategory' => $tripsByCategory,
            'topDestinations' => $topDestinations,
            'topOrganizers' => $topOrganizers,
        ]);
    }

    #[Route('/financial', name: 'api_admin_financial', methods: ['GET'])]
    public function getFinancialStats(Request $request): JsonResponse
    {
        $authCheck = $this->requireAdmin($request);
        if ($authCheck instanceof JsonResponse) {
            return $authCheck;
        }

        $bookings = $this->em->getRepository(Booking::class)->findAll();
        $organizers = $this->em->getRepository(OrganizerProfile::class)->findAll();
        
        $totalRevenue = 0;
        $commissionRate = 0.10; // 10% commission
        $totalCommission = 0;
        $pendingPayouts = 0;
        $completedPayouts = 0;
        
        $organizerRevenues = [];
        foreach ($organizers as $organizer) {
            $organizerRevenues[$organizer->getId()] = 0;
        }
        
        foreach ($bookings as $booking) {
            if ($booking->getStatus() === 'CONFIRMED' || $booking->getStatus() === 'COMPLETED') {
                $price = (float) $booking->getTotalPrice();
                $totalRevenue += $price;
                $commission = $price * $commissionRate;
                $totalCommission += $commission;
                
                $trip = $booking->getTrip();
                if ($trip && $trip->getOrganizer()) {
                    $orgId = $trip->getOrganizer()->getId();
                    if (isset($organizerRevenues[$orgId])) {
                        $organizerRevenues[$orgId] += ($price - $commission);
                    }
                }
            }
        }

        return $this->json([
            'totalRevenue' => $totalRevenue,
            'totalCommission' => $totalCommission,
            'commissionRate' => $commissionRate * 100,
            'platformRevenue' => $totalCommission,
            'organizerPayouts' => array_sum($organizerRevenues),
            'pendingPayouts' => $pendingPayouts,
            'completedPayouts' => $completedPayouts,
        ]);
    }

    #[Route('/system/health', name: 'api_admin_system_health', methods: ['GET'])]
    public function getSystemHealth(Request $request): JsonResponse
    {
        $authCheck = $this->requireAdmin($request);
        if ($authCheck instanceof JsonResponse) {
            return $authCheck;
        }

        // Database check
        try {
            $connection = $this->em->getConnection();
            $connection->executeQuery('SELECT 1');
            $dbStatus = 'healthy';
        } catch (\Exception $e) {
            $dbStatus = 'error';
        }

        // Count entities
        $userCount = $this->em->getRepository(User::class)->count([]);
        $tripCount = $this->em->getRepository(Trip::class)->count([]);
        $bookingCount = $this->em->getRepository(Booking::class)->count([]);
        $organizerCount = $this->em->getRepository(OrganizerProfile::class)->count([]);

        // Check for pending items
        $pendingOrganizers = $this->em->getRepository(OrganizerProfile::class)->findBy(['status' => 'PENDING']);
        $pendingBookings = $this->em->getRepository(Booking::class)->findBy(['status' => 'PENDING']);

        return $this->json([
            'database' => $dbStatus,
            'status' => $dbStatus === 'healthy' ? 'operational' : 'degraded',
            'counts' => [
                'users' => $userCount,
                'trips' => $tripCount,
                'bookings' => $bookingCount,
                'organizers' => $organizerCount,
            ],
            'pending' => [
                'organizers' => count($pendingOrganizers),
                'bookings' => count($pendingBookings),
            ],
            'timestamp' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/users', name: 'api_admin_users', methods: ['GET'])]
    public function getUsers(Request $request): JsonResponse
    {
        $authCheck = $this->requireAdmin($request);
        if ($authCheck instanceof JsonResponse) {
            return $authCheck;
        }

        $users = $this->em->getRepository(User::class)->findAll();
        
        $result = [];
        foreach ($users as $user) {
            $roles = $user->getRoles();
            
            // Only show regular users (not organizers and admins)
            if (in_array('ROLE_ADMIN', $roles)) {
                continue;
            }
            
            $result[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'first_name' => $user->getFirstName(),
                'last_name' => $user->getLastName(),
                'country' => $user->getCountry(),
                'phone' => $user->getPhone(),
                'is_active' => $user->isActive(),
                'roles' => $roles,
                'created_at' => $user->getCreatedAt()?->format('Y-m-d H:i:s'),
            ];
        }

        return $this->json($result);
    }

    #[Route('/users/{id}/status', name: 'api_admin_users_status', methods: ['PUT'])]
    public function updateUserStatus(Request $request, int $id): JsonResponse
    {
        $authCheck = $this->requireAdmin($request);
        if ($authCheck instanceof JsonResponse) {
            return $authCheck;
        }

        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $isActive = $data['is_active'] ?? true;
        
        $user->setIsActive($isActive);
        $this->em->flush();

        return $this->json(['message' => 'User status updated', 'is_active' => $user->isActive()]);
    }

    #[Route('/organizers', name: 'api_admin_organizers', methods: ['GET'])]
    public function getOrganizers(Request $request): JsonResponse
    {
        $authCheck = $this->requireAdmin($request);
        if ($authCheck instanceof JsonResponse) {
            return $authCheck;
        }

        $organizers = $this->em->getRepository(OrganizerProfile::class)->findAll();
        
        $result = [];
        foreach ($organizers as $organizer) {
            $user = $organizer->getUser();
            $result[] = [
                'id' => $organizer->getId(),
                'agency_name' => $organizer->getAgencyName(),
                'license_number' => $organizer->getLicenseNumber(),
                'address' => $organizer->getAddress(),
                'country' => $organizer->getCountry(),
                'status' => $organizer->getStatus(),
                'description' => $organizer->getDescription(),
                'user' => $user ? [
                    'id' => $user->getId(),
                    'first_name' => $user->getFirstName(),
                    'last_name' => $user->getLastName(),
                    'email' => $user->getEmail(),
                    'phone' => $user->getPhone(),
                    'is_active' => $user->isActive(),
                ] : null,
            ];
        }

        return $this->json($result);
    }

    #[Route('/organizers/{id}/approve', name: 'api_admin_organizers_approve', methods: ['PUT'])]
    public function approveOrganizer(Request $request, int $id): JsonResponse
    {
        $authCheck = $this->requireAdmin($request);
        if ($authCheck instanceof JsonResponse) {
            return $authCheck;
        }

        $organizer = $this->em->getRepository(OrganizerProfile::class)->find($id);
        if (!$organizer) {
            return $this->json(['error' => 'Organizer not found'], Response::HTTP_NOT_FOUND);
        }

        $organizer->setStatus('APPROVED');
        $this->em->flush();

        return $this->json(['message' => 'Organizer approved', 'status' => 'APPROVED']);
    }

    #[Route('/organizers/{id}/block', name: 'api_admin_organizers_block', methods: ['PUT'])]
    public function blockOrganizer(Request $request, int $id): JsonResponse
    {
        $authCheck = $this->requireAdmin($request);
        if ($authCheck instanceof JsonResponse) {
            return $authCheck;
        }

        $organizer = $this->em->getRepository(OrganizerProfile::class)->find($id);
        if (!$organizer) {
            return $this->json(['error' => 'Organizer not found'], Response::HTTP_NOT_FOUND);
        }

        $organizer->setStatus('BLOCKED');
        
        // Also deactivate the user
        $user = $organizer->getUser();
        if ($user) {
            $user->setIsActive(false);
        }
        
        $this->em->flush();

        return $this->json(['message' => 'Organizer blocked', 'status' => 'BLOCKED']);
    }

    #[Route('/categories', name: 'api_admin_categories', methods: ['GET', 'POST'])]
    public function manageCategories(Request $request): JsonResponse
    {
        $authCheck = $this->requireAdmin($request);
        if ($authCheck instanceof JsonResponse) {
            return $authCheck;
        }

        if ($request->isMethod('POST')) {
            $data = json_decode($request->getContent(), true);
            
            $category = new Category();
            $category->setName($data['name']);
            $category->setDescription($data['description'] ?? '');
            $category->setCreatedAt(new \DateTimeImmutable());
            
            $this->em->persist($category);
            $this->em->flush();

            return $this->json(['message' => 'Category created', 'id' => $category->getId()], Response::HTTP_CREATED);
        }

        $categories = $this->em->getRepository(Category::class)->findAll();
        $result = [];
        foreach ($categories as $category) {
            $result[] = [
                'id' => $category->getId(),
                'name' => $category->getName(),
                'description' => $category->getDescription(),
            ];
        }

        return $this->json($result);
    }

    #[Route('/destinations', name: 'api_admin_destinations', methods: ['GET', 'POST'])]
    public function manageDestinations(Request $request): JsonResponse
    {
        $authCheck = $this->requireAdmin($request);
        if ($authCheck instanceof JsonResponse) {
            return $authCheck;
        }

        if ($request->isMethod('POST')) {
            $data = json_decode($request->getContent(), true);
            
            $destination = new Destination();
            $destination->setName($data['name']);
            $destination->setCountry($data['country']);
            $destination->setRegion($data['region'] ?? '');
            $destination->setCreatedAt(new \DateTimeImmutable());
            
            $this->em->persist($destination);
            $this->em->flush();

            return $this->json(['message' => 'Destination created', 'id' => $destination->getId()], Response::HTTP_CREATED);
        }

        $destinations = $this->em->getRepository(Destination::class)->findAll();
        $result = [];
        foreach ($destinations as $destination) {
            $result[] = [
                'id' => $destination->getId(),
                'name' => $destination->getName(),
                'country' => $destination->getCountry(),
                'region' => $destination->getRegion(),
            ];
        }

        return $this->json($result);
    }
}
