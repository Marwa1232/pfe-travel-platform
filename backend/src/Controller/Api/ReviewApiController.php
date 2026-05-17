<?php

namespace App\Controller\Api;

use App\Entity\Booking;
use App\Entity\Review;
use App\Entity\Trip;
use App\Entity\User;
use App\Service\JwtService;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Gestion des avis laissés par les voyageurs sur les voyages.
 *
 * Règles métier :
 *  - L'utilisateur doit avoir une réservation CONFIRMED ou COMPLETED sur le voyage.
 *  - Le voyage (ou sa session réservée) doit être TERMINÉ (date de fin passée).
 *  - Un seul avis par utilisateur/voyage.
 *  - L'avis est publié directement (status = 'approved') sans validation préalable
 *    de l'organisateur.
 */
#[Route('/api/reviews')]
class ReviewApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private JwtService $jwtService,
        private NotificationService $notificationService,
    ) {}

    // ─────────────────────────────────────────────────────────────
    // Helper : récupérer l'utilisateur depuis le JWT
    // ─────────────────────────────────────────────────────────────
    private function getCurrentUser(Request $request): ?User
    {
        $authHeader = $request->headers->get('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        $token   = substr($authHeader, 7);
        $payload = $this->jwtService->decodeToken($token);

        if (!$payload || !isset($payload['id'])) {
            return null;
        }

        return $this->em->getRepository(User::class)->find($payload['id']);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/reviews  — Soumettre un avis
    // ─────────────────────────────────────────────────────────────
    #[Route('', name: 'api_reviews_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        // 1. Authentification
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        // Organisateurs et admins ne peuvent pas laisser d'avis
        $roles = $user->getRoles();
        if (in_array('ROLE_ORGANIZER', $roles) || in_array('ROLE_ADMIN', $roles)) {
            return $this->json(
                ['error' => 'Les organisateurs et administrateurs ne peuvent pas laisser d\'avis.'],
                Response::HTTP_FORBIDDEN
            );
        }

        // 2. Données de la requête
        $data = json_decode($request->getContent(), true);

        $tripId  = $data['trip_id'] ?? null;
        $rating  = $data['rating']  ?? null;
        $comment = trim($data['comment'] ?? '');

        if (!$tripId || !$rating) {
            return $this->json(
                ['error' => 'Les champs trip_id et rating sont obligatoires.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        if (!is_numeric($rating) || $rating < 1 || $rating > 5) {
            return $this->json(
                ['error' => 'La note doit être un entier entre 1 et 5.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // 3. Vérifier que le voyage existe
        $trip = $this->em->getRepository(Trip::class)->find($tripId);
        if (!$trip) {
            return $this->json(['error' => 'Voyage introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // 4. Vérifier qu'une réservation confirmée ou complétée existe
        $booking = $this->em->getRepository(Booking::class)->createQueryBuilder('b')
            ->where('b.user = :user')
            ->andWhere('b.trip = :trip')
            ->andWhere('b.status IN (:statuses)')
            ->setParameter('user',     $user)
            ->setParameter('trip',     $trip)
            ->setParameter('statuses', ['CONFIRMED', 'COMPLETED'])
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$booking) {
            return $this->json(
                ['error' => 'Vous devez avoir une réservation confirmée sur ce voyage pour laisser un avis.'],
                Response::HTTP_FORBIDDEN
            );
        }

        // 5. Vérifier que le voyage est TERMINÉ
        //    On vérifie la date de fin de la session réservée (si disponible) ou la date du voyage.
        $tripSession = $booking->getTripSession();
        $now         = new \DateTimeImmutable();

        if ($tripSession) {
            $endDate = $tripSession->getEndDate();
        } else {
            // Fallback : date de fin du voyage lui-même
            $endDate = $trip->getEndDate();
        }

        if (!$endDate || $endDate > $now) {
            return $this->json(
                ['error' => 'Vous ne pouvez laisser un avis qu\'après la fin du voyage.'],
                Response::HTTP_FORBIDDEN
            );
        }

        // 6. Un seul avis par utilisateur/voyage
        $existing = $this->em->getRepository(Review::class)->findOneBy([
            'user' => $user,
            'trip' => $trip,
        ]);

        if ($existing) {
            return $this->json(
                ['error' => 'Vous avez déjà laissé un avis pour ce voyage.'],
                Response::HTTP_CONFLICT
            );
        }

        // 7. Créer et persister l'avis
        //    Statut 'approved' directement : pas de validation préalable de l'organisateur.
        $review = new Review();
        $review->setUser($user);
        $review->setTrip($trip);
        $review->setRating((int) $rating);
        $review->setComment($comment ?: null);
        $review->setStatus('approved');
        $review->setFlagged(false);
        $review->setCreatedAt(new \DateTimeImmutable());

        $this->em->persist($review);
        $this->em->flush();

        // 8. Notifier l'organisateur qu'un nouvel avis a été publié
        $this->notificationService->notifyNewReview($trip);

        return $this->json([
            'message' => 'Votre avis a été publié.',
            'review'  => [
                'id'         => $review->getId(),
                'rating'     => $review->getRating(),
                'comment'    => $review->getComment(),
                'status'     => $review->getStatus(),
                'created_at' => $review->getCreatedAt()->format('Y-m-d H:i:s'),
            ],
        ], Response::HTTP_CREATED);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/reviews/trip/{tripId}  — Avis publics d'un voyage
    // ─────────────────────────────────────────────────────────────
    #[Route('/trip/{tripId}', name: 'api_reviews_by_trip', methods: ['GET'])]
    public function listByTrip(int $tripId, Request $request): JsonResponse
    {
        $trip = $this->em->getRepository(Trip::class)->find($tripId);
        if (!$trip) {
            return $this->json(['error' => 'Voyage introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // Seuls les avis approuvés et non supprimés sont publics
        $reviews = $this->em->getRepository(Review::class)->createQueryBuilder('r')
            ->leftJoin('r.user', 'u')
            ->where('r.trip = :trip')
            ->andWhere('r.status = :status')
            ->setParameter('trip',   $trip)
            ->setParameter('status', 'approved')
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();

        $data = array_map(function (Review $r) {
            $u = $r->getUser();
            return [
                'id'                 => $r->getId(),
                'rating'             => $r->getRating(),
                'comment'            => $r->getComment(),
                'organizer_response' => $r->getOrganizerResponse(),
                'response_date'      => $r->getResponseDate()?->format('Y-m-d H:i:s'),
                'created_at'         => $r->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => $u ? [
                    'id'         => $u->getId(),
                    'first_name' => $u->getFirstName(),
                    'last_name'  => $u->getLastName(),
                ] : null,
            ];
        }, $reviews);

        // Calculer la note moyenne
        $avgRating = count($data) > 0
            ? round(array_sum(array_column($data, 'rating')) / count($data), 1)
            : null;

        return $this->json([
            'reviews'    => $data,
            'total'      => count($data),
            'avg_rating' => $avgRating,
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/reviews/can-review/{tripId}
    // Vérifie si l'utilisateur connecté peut laisser un avis
    // ─────────────────────────────────────────────────────────────
    #[Route('/can-review/{tripId}', name: 'api_reviews_can_review', methods: ['GET'])]
    public function canReview(int $tripId, Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['canReview' => false, 'reason' => 'non_authenticated']);
        }

        $roles = $user->getRoles();
        if (in_array('ROLE_ORGANIZER', $roles) || in_array('ROLE_ADMIN', $roles)) {
            return $this->json(['canReview' => false, 'reason' => 'role_not_allowed']);
        }

        $trip = $this->em->getRepository(Trip::class)->find($tripId);
        if (!$trip) {
            return $this->json(['canReview' => false, 'reason' => 'trip_not_found']);
        }

        // Déjà avis existant ?
        $existing = $this->em->getRepository(Review::class)->findOneBy([
            'user' => $user,
            'trip' => $trip,
        ]);
        if ($existing) {
            return $this->json(['canReview' => false, 'reason' => 'already_reviewed', 'review_id' => $existing->getId()]);
        }

        // Réservation confirmée ou complétée ?
        $booking = $this->em->getRepository(Booking::class)->createQueryBuilder('b')
            ->where('b.user = :user')
            ->andWhere('b.trip = :trip')
            ->andWhere('b.status IN (:statuses)')
            ->setParameter('user',     $user)
            ->setParameter('trip',     $trip)
            ->setParameter('statuses', ['CONFIRMED', 'COMPLETED'])
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$booking) {
            return $this->json(['canReview' => false, 'reason' => 'no_valid_booking']);
        }

        // Voyage terminé ?
        $tripSession = $booking->getTripSession();
        $now         = new \DateTimeImmutable();
        $endDate     = $tripSession ? $tripSession->getEndDate() : $trip->getEndDate();

        if (!$endDate || $endDate > $now) {
            return $this->json(['canReview' => false, 'reason' => 'trip_not_finished']);
        }

        return $this->json(['canReview' => true]);
    }
}