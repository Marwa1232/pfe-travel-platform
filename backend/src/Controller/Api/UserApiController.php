<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\OrganizerProfile;
use App\Service\JwtService;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/user')]
class UserApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private NotificationService $notificationService,
        private JwtService $jwtService,
        private RequestStack $requestStack,
        private UserPasswordHasherInterface $passwordHasher
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

    #[Route('/profile', name: 'api_user_profile', methods: ['GET'])]
    public function getProfile(): JsonResponse
    {
        $user = $this->getCurrentUserFromToken();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'first_name' => $user->getFirstName(),
            'last_name' => $user->getLastName(),
            'phone' => $user->getPhone(),
            'country' => $user->getCountry(),
            'preferred_language' => $user->getPreferredLanguage(),
            'preferred_currency' => $user->getPreferredCurrency(),
            'roles' => $user->getRoles(),
'status_organizer' => $user->getStatusOrganizer(),
                'interests' => $user->getInterests() ?? [],
                'created_at' => $user->getCreatedAt()?->format('Y-m-d H:i:s'),
            ]);
    }

    #[Route('/profile-photo', name: 'api_user_profile_photo', methods: ['POST'])]
    public function uploadProfilePhoto(Request $request): JsonResponse
    {
        $user = $this->getCurrentUserFromToken();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $file = $request->files->get('photo');
        if (!$file) {
            return $this->json(['error' => 'No photo file provided'], Response::HTTP_BAD_REQUEST);
        }

        $uploadDir = dirname(__DIR__, 3) . '/public/uploads/photoprofil';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
            return $this->json(['error' => 'Invalid file type. Allowed: jpg, jpeg, png, gif, webp'], Response::HTTP_BAD_REQUEST);
        }

        $filename = 'profile_' . $user->getId() . '_' . uniqid() . '.' . $extension;
        $destinationPath = $uploadDir . '/' . $filename;

        $fileContent = file_get_contents($file->getPathname());
        if (file_put_contents($destinationPath, $fileContent) === false) {
            return $this->json(['error' => 'Failed to save photo'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $photoUrl = '/uploads/photoprofil/' . $filename;
        $user->setProfilePhotoUrl($photoUrl);
        $this->em->flush();

        return $this->json([
            'message' => 'Profile photo uploaded successfully',
            'profile_photo_url' => $photoUrl,
        ]);
    }

    #[Route('/organizer-request', name: 'api_organizer_request', methods: ['POST'])]
    public function requestOrganizer(Request $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser($request);
            if (!$user) {
                return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
            }


            if ($user->getStatusOrganizer() === 'PENDING') {
                return $this->json(['error' => 'You already have a pending request'], Response::HTTP_CONFLICT);
            }

            // Support both JSON and FormData
            $contentType = $request->headers->get('Content-Type', '');
            error_log('Content-Type: ' . $contentType);
            
            if (strpos($contentType, 'application/json') !== false) {
                $data = json_decode($request->getContent(), true);
            } else {
                $data = $request->request->all();
            }
            
            error_log('Request data: ' . json_encode($data));
            error_log('Files count: ' . $request->files->count());

            // Validate required fields
            $requiredFields = ['agency_name', 'description', 'experience'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return $this->json(['error' => "Field '$field' is required"], Response::HTTP_BAD_REQUEST);
                }
            }

            // Update user status to PENDING
            $user->setStatusOrganizer('PENDING');

            // Create organizer profile with the request data
            $organizerProfile = new OrganizerProfile();
            $organizerProfile->setUser($user);
            $organizerProfile->setAgencyName($data['agency_name']);
            $organizerProfile->setDescription($data['description']);
            $organizerProfile->setExperience($data['experience']);
            $organizerProfile->setLicenseNumber($data['license_number'] ?? null);
            $organizerProfile->setCountry($data['country'] ?? 'Tunisia');
            $organizerProfile->setAddress($data['address'] ?? null);
            $organizerProfile->setWebsite($data['website'] ?? null);
            $organizerProfile->setFacebook($data['facebook'] ?? null);
            $organizerProfile->setInstagram($data['instagram'] ?? null);
            $organizerProfile->setStatus('PENDING');

            error_log('Creating organizer profile for user: ' . $user->getId());
            
            // Save organizer first, then handle documents separately
            $this->em->persist($organizerProfile);
            $this->em->persist($user);
            $this->em->flush();

            // Notify admins about new organizer request
            $this->notificationService->notifyOrganizerRequest($user);

            // Handle document uploads AFTER save
            $responseData = [
                'message' => 'Organizer request submitted successfully. Your request will be reviewed by an administrator within 24 hours.',
                'status_organizer' => 'PENDING',
                'organizer_id' => $organizerProfile->getId()
            ];
            
            try {
                $documentPaths = [];
                
                if ($request->files->count() > 0) {
                    $uploadDir = dirname(__DIR__, 3) . '/public/uploads/documents';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0777, true);
                    }
                    
                    foreach ($request->files as $key => $file) {
                        if (strpos($key, 'document_') === 0 && $file) {
                            try {
                                // Sanitize filename
                                $originalFilename = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
                                $extension = strtolower($file->getClientOriginalExtension());
                                $newFilename = $originalFilename . '_' . uniqid() . '.' . $extension;
                                $destinationPath = $uploadDir . '/' . $newFilename;
                                
                                $fileContent = file_get_contents($file->getPathname());
                                if (file_put_contents($destinationPath, $fileContent) !== false) {
                                    $documentPaths[] = '/uploads/documents/' . $newFilename;
                                }
                            } catch (\Throwable $e) {
                                // Skip failed files
                            }
                        }
                    }
                }
                
                if (!empty($documentPaths)) {
                    $organizerProfile->setDocuments($documentPaths);
                    $this->em->flush();
                }
            } catch (\Throwable $e) {
                // Continue even if upload fails
            }
            
            return $this->json($responseData);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/bookings/upcoming', name: 'api_user_upcoming_bookings', methods: ['GET'])]
    public function getUpcomingBookings(): JsonResponse
    {
        $user = $this->getCurrentUserFromToken();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $bookings = $user->getBookings();
        $upcomingBookings = [];
        $pastBookings = [];
        $now = new \DateTime();

        foreach ($bookings as $booking) {
            $bookingData = [
                'id' => $booking->getId(),
                'status' => $booking->getStatus(),
                'total_price' => $booking->getTotalPrice(),
                'currency' => $booking->getCurrency(),
                'created_at' => $booking->getCreatedAt()?->format('Y-m-d H:i:s'),
                'trip' => $booking->getTrip() ? [
                    'id' => $booking->getTrip()->getId(),
                    'title' => $booking->getTrip()->getTitle(),
                    'destination' => (($d = $booking->getTrip()->getDestinations()->first()) !== false ? $d->getName() : '') ?? '',
                    'duration_days' => $booking->getTrip()->getDurationDays(),
                    'cover_image' => $booking->getTrip()?->getCoverImage()?->getUrl() ?? '',
                ] : null,
            ];

            // Check if trip session exists
            if ($booking->getTripSession()) {
                $bookingData['trip_session'] = [
                    'id' => $booking->getTripSession()->getId(),
                    'start_date' => $booking->getTripSession()->getStartDate()?->format('Y-m-d'),
                    'end_date' => $booking->getTripSession()->getEndDate()?->format('Y-m-d'),
                ];
            }

            if ($booking->getTripSession() && $booking->getTripSession()->getStartDate() > $now) {
                $upcomingBookings[] = $bookingData;
            } else {
                $pastBookings[] = $bookingData;
            }
        }

        return $this->json([
            'upcoming' => $upcomingBookings,
            'past' => $pastBookings,
        ]);
    }

    #[Route('/profile', name: 'api_user_update_profile', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getCurrentUserFromToken();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['first_name'])) {
            $user->setFirstName($data['first_name']);
        }
        if (isset($data['last_name'])) {
            $user->setLastName($data['last_name']);
        }
        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }
        if (isset($data['country'])) {
            $user->setCountry($data['country']);
        }
        if (isset($data['preferred_language'])) {
            $user->setPreferredLanguage($data['preferred_language']);
        }
        if (isset($data['preferred_currency'])) {
            $user->setPreferredCurrency($data['preferred_currency']);
        }
            if (isset($data['profile_photo_url'])) {
                        $user->setProfilePhotoUrl($data['profile_photo_url']);
                    }
                    if (isset($data['interests'])) {
                        $user->setInterests($data['interests']);
                    }

                    $user->setUpdatedAt(new \DateTimeImmutable());
                    $this->em->flush();

            return $this->json([
                        'message' => 'Profile updated successfully',
                        'first_name' => $user->getFirstName(),
                        'last_name' => $user->getLastName(),
                        'phone' => $user->getPhone(),
                        'country' => $user->getCountry(),
                        'preferred_language' => $user->getPreferredLanguage(),
                        'preferred_currency' => $user->getPreferredCurrency(),
                        'profile_photo_url' => $user->getProfilePhotoUrl(),
                        'interests' => $user->getInterests(),
                    ]);
                }

    #[Route('/change-password', name: 'api_user_change_password', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        $user = $this->getCurrentUserFromToken();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        
        $currentPassword = $data['current_password'] ?? '';
        $newPassword = $data['new_password'] ?? '';
        $confirmPassword = $data['confirm_password'] ?? '';

        if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
            return $this->json(['error' => 'All password fields are required'], Response::HTTP_BAD_REQUEST);
        }

        if ($newPassword !== $confirmPassword) {
            return $this->json(['error' => 'New passwords do not match'], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($newPassword) < 6) {
            return $this->json(['error' => 'Password must be at least 6 characters'], Response::HTTP_BAD_REQUEST);
        }

        if (!$this->passwordHasher->isPasswordValid($user, $currentPassword)) {
            return $this->json(['error' => 'Current password is incorrect'], Response::HTTP_UNAUTHORIZED);
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);
        $user->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json(['message' => 'Password changed successfully']);
    }

    #[Route('/preferences', name: 'api_user_preferences', methods: ['PUT'])]
    public function updatePreferences(Request $request): JsonResponse
    {
        $user = $this->getCurrentUserFromToken();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['interests'])) {
            $user->setInterests($data['interests']);
        }

        $user->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json([
            'message' => 'Preferences updated successfully',
            'interests' => $user->getInterests(),
        ]);
    }

    #[Route('/social-links', name: 'api_user_social_links', methods: ['PUT'])]
    public function updateSocialLinks(Request $request): JsonResponse
    {
        $user = $this->getCurrentUserFromToken();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $organizerProfile = $user->getOrganizerProfile();
        if (!$organizerProfile instanceof OrganizerProfile) {
            return $this->json(['error' => 'Organizer profile not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['facebook'])) {
            $organizerProfile->setFacebook($data['facebook']);
        }
        if (isset($data['instagram'])) {
            $organizerProfile->setInstagram($data['instagram']);
        }
        if (isset($data['website'])) {
            $organizerProfile->setWebsite($data['website']);
        }
        // linkedin and x are stored in the user entity preferences as json

        $this->em->flush();

        return $this->json([
            'message' => 'Social links updated successfully',
            'facebook' => $organizerProfile->getFacebook(),
            'instagram' => $organizerProfile->getInstagram(),
            'website' => $organizerProfile->getWebsite(),
        ]);
    }

    #[Route('/account', name: 'api_user_delete_account', methods: ['DELETE'])]
    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $this->getCurrentUserFromToken();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        $password = $data['password'] ?? '';

        if (empty($password)) {
            return $this->json(['error' => 'Password is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            return $this->json(['error' => 'Incorrect password'], Response::HTTP_UNAUTHORIZED);
        }

        // Soft delete - deactivate account
        $user->setIsActive(false);
        $user->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json(['message' => 'Account deactivated successfully']);
    }

    #[Route('/account/disable', name: 'api_user_disable_account', methods: ['POST'])]
    public function disableAccount(Request $request): JsonResponse
    {
        $user = $this->getCurrentUserFromToken();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $organizerProfile = $user->getOrganizerProfile();
        if (!$organizerProfile instanceof OrganizerProfile) {
            return $this->json(['error' => 'Organizer profile not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $password = $data['password'] ?? '';

        if (empty($password)) {
            return $this->json(['error' => 'Password is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            return $this->json(['error' => 'Incorrect password'], Response::HTTP_UNAUTHORIZED);
        }

        // Disable organizer profile
        $organizerProfile->setStatus('DISABLED');
        $user->setStatusOrganizer('DISABLED');
        $user->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json(['message' => 'Agency account disabled successfully']);
    }
}