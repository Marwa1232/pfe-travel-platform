<?php

namespace App\Controller\Api;

use App\Entity\Review;
use App\Entity\OrganizerProfile;
use App\Entity\User;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/organizer/reviews')]
class OrganizerReviewApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private JwtService $jwtService
    ) {}

    private function getOrganizer(Request $request): ?OrganizerProfile
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
        
        $user = $this->em->getRepository(User::class)->find($payload['id']);
        if (!$user) {
            return null;
        }
        
        return $user->getOrganizerProfile();
    }

    #[Route('', name: 'api_organizer_reviews_list', methods: ['GET'])]
    public function listReviews(Request $request): JsonResponse
    {
        $organizer = $this->getOrganizer($request);
        if (!$organizer) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $status = $request->query->get('status');
        
        if ($status && $status !== 'all') {
            $reviews = $this->em->getRepository(Review::class)->createQueryBuilder('r')
                ->leftJoin('r.trip', 't')
                ->andWhere('t.organizer = :organizerId')
                ->andWhere('r.status = :status')
                ->setParameter('organizerId', $organizer->getId())
                ->setParameter('status', $status)
                ->orderBy('r.createdAt', 'DESC')
                ->getQuery()
                ->getResult();
        } else {
            $reviews = $this->em->getRepository(Review::class)->findByOrganizer($organizer->getId());
        }

        $data = array_map(function($r) {
            $trip = $r->getTrip();
            $user = $r->getUser();
            return [
                'id' => $r->getId(),
                'rating' => $r->getRating(),
                'comment' => $r->getComment(),
                'status' => $r->getStatus(),
                'organizer_response' => $r->getOrganizerResponse(),
                'response_date' => $r->getResponseDate()?->format('Y-m-d H:i:s'),
                'created_at' => $r->getCreatedAt()->format('Y-m-d H:i:s'),
                'trip' => [
                    'id' => $trip?->getId(),
                    'title' => $trip?->getTitle(),
                ],
                'user' => [
                    'id' => $user?->getId(),
                    'first_name' => $user?->getFirstName(),
                    'last_name' => $user?->getLastName(),
                ],
            ];
        }, $reviews);

        $pendingCount = count($this->em->getRepository(Review::class)->findPendingByOrganizer($organizer->getId()));

        return $this->json([
            'reviews' => $data,
            'total' => count($data),
            'pending_count' => $pendingCount,
        ]);
    }

    #[Route('/{id}/approve', name: 'api_organizer_reviews_approve', methods: ['PUT'])]
    public function approveReview(int $id, Request $request): JsonResponse
    {
        $organizer = $this->getOrganizer($request);
        if (!$organizer) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $review = $this->em->getRepository(Review::class)->find($id);
        if (!$review) {
            return $this->json(['error' => 'Review not found'], Response::HTTP_NOT_FOUND);
        }

        $trip = $review->getTrip();
        if (!$trip || $trip->getOrganizer()->getId() !== $organizer->getId()) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $review->setStatus('approved');
        $this->em->flush();

        return $this->json([
            'message' => 'Review approved',
            'review' => [
                'id' => $review->getId(),
                'status' => $review->getStatus(),
            ]
        ]);
    }

    #[Route('/{id}/reject', name: 'api_organizer_reviews_reject', methods: ['PUT'])]
    public function rejectReview(int $id, Request $request): JsonResponse
    {
        $organizer = $this->getOrganizer($request);
        if (!$organizer) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $review = $this->em->getRepository(Review::class)->find($id);
        if (!$review) {
            return $this->json(['error' => 'Review not found'], Response::HTTP_NOT_FOUND);
        }

        $trip = $review->getTrip();
        if (!$trip || $trip->getOrganizer()->getId() !== $organizer->getId()) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $review->setStatus('rejected');
        $this->em->flush();

        return $this->json([
            'message' => 'Review rejected',
            'review' => [
                'id' => $review->getId(),
                'status' => $review->getStatus(),
            ]
        ]);
    }

    #[Route('/{id}/respond', name: 'api_organizer_reviews_respond', methods: ['PUT'])]
    public function respondReview(int $id, Request $request): JsonResponse
    {
        $organizer = $this->getOrganizer($request);
        if (!$organizer) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $review = $this->em->getRepository(Review::class)->find($id);
        if (!$review) {
            return $this->json(['error' => 'Review not found'], Response::HTTP_NOT_FOUND);
        }

        $trip = $review->getTrip();
        if (!$trip || $trip->getOrganizer()->getId() !== $organizer->getId()) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        if (empty($data['response'])) {
            return $this->json(['error' => 'Response is required'], Response::HTTP_BAD_REQUEST);
        }

        $review->setOrganizerResponse($data['response']);
        $review->setResponseDate(new \DateTimeImmutable());
        
        // Auto-approve when responding
        if ($review->getStatus() === 'pending') {
            $review->setStatus('approved');
        }
        
        $this->em->flush();

        return $this->json([
            'message' => 'Response added',
            'review' => [
                'id' => $review->getId(),
                'organizer_response' => $review->getOrganizerResponse(),
                'response_date' => $review->getResponseDate()->format('Y-m-d H:i:s'),
                'status' => $review->getStatus(),
            ]
        ]);
    }
}