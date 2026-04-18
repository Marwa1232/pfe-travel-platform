<?php

namespace App\Controller\Api;

use App\Entity\Moment;
use App\Entity\MomentMedia;
use App\Entity\Booking;
use App\Entity\User;
use App\Service\ImageStorageService;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/moments')]
class MomentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private JwtService $jwtService,
        private ImageStorageService $imageStorage,
        private LoggerInterface $logger
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

    #[Route('', name: 'api_moments_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $moments = $this->em->getRepository(Moment::class)->findBy(
            [],
            ['createdAt' => 'DESC']
        );

        return $this->json($moments, Response::HTTP_OK, [], ['groups' => 'moment:read']);
    }

    #[Route('', name: 'api_moments_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $content = $request->request->get('content');
        $tripId = $request->request->get('trip_id');
        $bookingId = $request->request->get('booking_id');

        $this->logger->info("Creating moment - Content: $content, TripId: $tripId, BookingId: $bookingId");

        if (!$content || !$tripId || !$bookingId) {
            return $this->json(['error' => 'Content, trip_id and booking_id are required'], Response::HTTP_BAD_REQUEST);
        }

        $booking = $this->em->getRepository(Booking::class)->find($bookingId);
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], Response::HTTP_NOT_FOUND);
        }

        // Authorization check: user must own the booking AND booking must be CONFIRMED AND trip must have started
        if ($booking->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        if ($booking->getStatus() !== 'CONFIRMED') {
            return $this->json(['error' => 'Booking must be confirmed'], Response::HTTP_FORBIDDEN);
        }

        $tripSession = $booking->getTripSession();
        if (!$tripSession || !$tripSession->getStartDate()) {
            return $this->json(['error' => 'Trip session not found'], Response::HTTP_NOT_FOUND);
        }

        $today = new \DateTime();
        $startDate = $tripSession->getStartDate();
        if ($today < $startDate) {
            return $this->json(['error' => 'You can only post moments after the trip has started'], Response::HTTP_FORBIDDEN);
        }

        $trip = $booking->getTrip();

        // Create moment
        $moment = new Moment();
        $moment->setUser($user);
        $moment->setTrip($trip);
        $moment->setBooking($booking);
        $moment->setContent($content);

        $this->em->persist($moment);
        
        $uploadDir = dirname(__DIR__, 3) . '/public/uploads/moments';
        
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $filesToProcess = [];
        
        // Handle files from media[] key
        $mediaFiles = $request->files->get('media');
        $this->logger->info("media files from request: " . ($mediaFiles ? "exists" : "null"));
        
        if ($mediaFiles) {
            if (is_array($mediaFiles)) {
                foreach ($mediaFiles as $file) {
                    if ($file instanceof \Symfony\Component\HttpFoundation\File\UploadedFile) {
                        $this->logger->info("Processing media[] file: " . $file->getClientOriginalName());
                        $filesToProcess[] = $file;
                    }
                }
            } elseif ($mediaFiles instanceof \Symfony\Component\HttpFoundation\File\UploadedFile) {
                $this->logger->info("Processing single media file: " . $mediaFiles->getClientOriginalName());
                $filesToProcess[] = $mediaFiles;
            }
        }
        
        $this->logger->info("Total files to process: " . count($filesToProcess));
        
        // Iterate through all files to process
        foreach ($filesToProcess as $file) {
            try {
                // Get file info BEFORE moving (temp file might be deleted after move)
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension() ?: 'jpg';
                $mimeType = $file->getMimeType() ?: 'image/jpeg';
                $type = str_contains($mimeType, 'video') ? 'video' : 'image';
                
                $filename = uniqid() . '.' . $extension;
                $file->move($uploadDir, $filename);

                $media = new MomentMedia();
                $media->setMoment($moment);
                $media->setUrl('/uploads/moments/' . $filename);
                $media->setType($type);

                $moment->addMedia($media);
                $this->em->persist($media);
                $this->logger->info("Created media for moment: " . $moment->getId() . " with URL: /uploads/moments/" . $filename);
            } catch (\Exception $e) {
                $this->logger->error('Error uploading file: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            }
        }
        
        $this->em->flush();
        $this->logger->info("Moment with media created with ID: " . $moment->getId());

        return $this->json($moment, Response::HTTP_CREATED, [], ['groups' => 'moment:read']);
    }

    #[Route('/trip/{tripId}', name: 'api_moments_trip', methods: ['GET'])]
    public function getTripMoments(int $tripId): JsonResponse
    {
        $moments = $this->em->getRepository(Moment::class)->findBy(
            ['trip' => $tripId],
            ['createdAt' => 'DESC']
        );

        return $this->json($moments, Response::HTTP_OK, [], ['groups' => 'moment:read']);
    }

    #[Route('/my-bookings', name: 'api_moments_my_bookings', methods: ['GET'])]
    public function myEligibleBookings(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        // If no user is authenticated, return empty array for public endpoint
        if (!$user) {
            return $this->json([]);
        }

        $today = new \DateTime();

        $bookings = $this->em->getRepository(Booking::class)->findBy([
            'user' => $user,
            'status' => 'CONFIRMED',
        ]);

        $eligibleBookings = [];
        foreach ($bookings as $booking) {
            $session = $booking->getTripSession();
            if ($session && $session->getStartDate() && $today >= $session->getStartDate()) {
                $eligibleBookings[] = [
                    'id' => $booking->getId(),
                    'trip_id' => $booking->getTrip()->getId(),
                    'trip_title' => $booking->getTrip()->getTitle(),
                    'start_date' => $session->getStartDate()->format('Y-m-d'),
                ];
            }
        }

        return $this->json($eligibleBookings);
    }

    #[Route('/{id}', name: 'api_moments_delete', methods: ['DELETE'])]
    public function delete(Request $request, int $id): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $moment = $this->em->getRepository(Moment::class)->find($id);
        if (!$moment) {
            return $this->json(['error' => 'Moment not found'], Response::HTTP_NOT_FOUND);
        }

        if ($moment->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        // Delete media files
        foreach ($moment->getMedia() as $media) {
            $this->em->remove($media);
        }

        $this->em->remove($moment);
        $this->em->flush();

        return $this->json(['message' => 'Moment deleted']);
    }
}