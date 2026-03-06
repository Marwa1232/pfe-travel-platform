<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\OrganizerProfile;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/user')]
class UserApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('/profile', name: 'api_user_profile', methods: ['GET'])]
    public function getProfile(): JsonResponse
    {
        $user = $this->getUser();
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

    #[Route('/profile', name: 'api_user_profile_update', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();
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
        if (isset($data['interests'])) {
            $user->setInterests($data['interests']);
        }

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['error' => (string) $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->getId(),
                'first_name' => $user->getFirstName(),
                'last_name' => $user->getLastName(),
                'phone' => $user->getPhone(),
                'country' => $user->getCountry(),
                'interests' => $user->getInterests() ?? [],
            ]
        ]);
    }

    #[Route('/organizer-request', name: 'api_organizer_request', methods: ['POST'])]
    public function requestOrganizer(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if already an organizer or has pending request
        if ($user->getStatusOrganizer() === 'approved') {
            return $this->json(['error' => 'You are already an organizer'], Response::HTTP_CONFLICT);
        }

        if ($user->getStatusOrganizer() === 'pending') {
            return $this->json(['error' => 'You already have a pending request'], Response::HTTP_CONFLICT);
        }

        $data = json_decode($request->getContent(), true);

        // Validate required fields
        $requiredFields = ['agency_name', 'description', 'experience'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return $this->json(['error' => "Field '$field' is required"], Response::HTTP_BAD_REQUEST);
            }
        }

        // Update user status to pending
        $user->setStatusOrganizer('pending');

        // Create organizer profile with the request data
        $organizerProfile = new OrganizerProfile();
        $organizerProfile->setUser($user);
        $organizerProfile->setAgencyName($data['agency_name']);
        $organizerProfile->setDescription($data['description']);
        $organizerProfile->setExperience($data['experience']);
        $organizerProfile->setWebsite($data['website'] ?? null);
        $organizerProfile->setFacebook($data['facebook'] ?? null);
        $organizerProfile->setInstagram($data['instagram'] ?? null);
        $organizerProfile->setStatus('pending');

        $this->em->persist($organizerProfile);
        $this->em->flush();

        return $this->json([
            'message' => 'Organizer request submitted successfully. Your request will be reviewed by an administrator within 24 hours.',
            'status_organizer' => 'pending'
        ]);
    }

    #[Route('/bookings/upcoming', name: 'api_user_upcoming_bookings', methods: ['GET'])]
    public function getUpcomingBookings(): JsonResponse
    {
        $user = $this->getUser();
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
                    'destination' => $booking->getTrip()->getDestination(),
                    'start_date' => $booking->getTrip()->getStartDate()?->format('Y-m-d'),
                    'end_date' => $booking->getTrip()->getEndDate()?->format('Y-m-d'),
                    'duration_days' => $booking->getTrip()->getDurationDays(),
                    'cover_image' => $booking->getTrip()->getCoverImage(),
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
}
