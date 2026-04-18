<?php

namespace App\Controller\Api;

use App\Entity\Review;
use App\Entity\Trip;
use App\Entity\User;
use App\Entity\Booking;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/reviews')]
class ReviewApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private JwtService $jwtService
    ) {}

    private function getAuthUser(Request $request): ?User
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

    #[Route('/trip/{tripId}', name: 'api_reviews_trip', methods: ['GET'])]
    public function getTripReviews(int $tripId): JsonResponse
    {
        $reviews = $this->em->getRepository(Review::class)->findByTripAndStatus($tripId, 'approved');

        $data = array_map(function($r) {
            $user = $r->getUser();
            return [
                'id' => $r->getId(),
                'rating' => $r->getRating(),
                'comment' => $r->getComment(),
                'status' => $r->getStatus(),
                'created_at' => $r->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $user?->getId(),
                    'first_name' => $user?->getFirstName(),
                    'last_name' => $user?->getLastName(),
                ],
            ];
        }, $reviews);

        $avgRating = count($reviews) > 0
            ? round(array_sum(array_column($data, 'rating')) / count($data), 1)
            : 0;

        return $this->json([
            'reviews' => $data,
            'total' => count($data),
            'avg_rating' => $avgRating,
        ]);
    }

    #[Route('', name: 'api_reviews_create', methods: ['POST'])]
    public function createReview(Request $request): JsonResponse
    {
        $user = $this->getAuthUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['trip_id']) || empty($data['rating'])) {
            return $this->json(['error' => 'trip_id and rating are required'], Response::HTTP_BAD_REQUEST);
        }

        if ($data['rating'] < 1 || $data['rating'] > 5) {
            return $this->json(['error' => 'Rating must be between 1 and 5'], Response::HTTP_BAD_REQUEST);
        }

        $trip = $this->em->getRepository(Trip::class)->find($data['trip_id']);
        if (!$trip) {
            return $this->json(['error' => 'Trip not found'], Response::HTTP_NOT_FOUND);
        }

        // Check if user has a confirmed/completed booking for this trip
        $booking = $this->em->getRepository(Booking::class)->createQueryBuilder('b')
            ->where('b.user = :userId')
            ->andWhere('b.trip = :tripId')
            ->andWhere('b.status IN (:statuses)')
            ->setParameter('userId', $user->getId())
            ->setParameter('tripId', $trip->getId())
            ->setParameter('statuses', ['CONFIRMED', 'COMPLETED'])
            ->getQuery()
            ->getOneOrNullResult();

        if (!$booking) {
            return $this->json([
                'error' => 'Vous devez avoir réservé ce voyage pour laisser un avis',
                'code' => 'NO_BOOKING'
            ], Response::HTTP_FORBIDDEN);
        }

        $existing = $this->em->getRepository(Review::class)->findByUserAndTrip($user->getId(), $trip->getId());
        if ($existing) {
            return $this->json(['error' => 'You already reviewed this trip'], Response::HTTP_CONFLICT);
        }

        $review = new Review();
        $review->setUser($user);
        $review->setTrip($trip);
        $review->setRating($data['rating']);
        $review->setComment($data['comment'] ?? null);
        $review->setStatus('pending');

        $this->em->persist($review);
        $this->em->flush();

        return $this->json([
            'message' => 'Review submitted successfully',
            'review' => [
                'id' => $review->getId(),
                'rating' => $review->getRating(),
                'comment' => $review->getComment(),
                'status' => $review->getStatus(),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_reviews_delete', methods: ['DELETE'])]
    public function deleteReview(int $id, Request $request): JsonResponse
    {
        $user = $this->getAuthUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $review = $this->em->getRepository(Review::class)->find($id);
        if (!$review) {
            return $this->json(['error' => 'Review not found'], Response::HTTP_NOT_FOUND);
        }

        if ($review->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $this->em->remove($review);
        $this->em->flush();

        return $this->json(['message' => 'Review deleted']);
    }
}