<?php

namespace App\Controller\Api;

use App\Entity\LoyaltyOffer;
use App\Entity\OrganizerProfile;
use App\Entity\Trip;
use App\Entity\User;
use App\Service\JwtService;
use App\Service\LoyaltyService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/loyalty')]
class LoyaltyController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private LoyaltyService $loyaltyService,
        private JwtService $jwtService,
    ) {}

    private function getAuthUser(Request $request): ?User
    {
        $h = $request->headers->get('Authorization');
        if (!$h || !str_starts_with($h, 'Bearer ')) return null;
        $payload = $this->jwtService->decodeToken(substr($h, 7));
        if (!$payload || !isset($payload['id'])) return null;
        return $this->em->getRepository(User::class)->find($payload['id']);
    }

    // ────────────────────────────────────────────────────────
    // GET /api/loyalty/points
    // Retourne les points du user groupés par organizer
    // ────────────────────────────────────────────────────────
    #[Route('/points', methods: ['GET'])]
    public function getPoints(Request $request): JsonResponse
    {
        $user = $this->getAuthUser($request);
        if (!$user) return $this->json(['error' => 'Unauthorized'], 401);

        $byOrganizer = $this->loyaltyService->getPointsByOrganizer($user);
        $history     = $this->loyaltyService->getHistory($user);

        // Total global (informatif uniquement)
        $totalEarned = $this->loyaltyService->getTotalPointsEarned($user);

        return $this->json([
            'total_earned'    => $totalEarned,
            'by_organizer'    => $byOrganizer,
            'history'         => array_map(fn($tx) => [
                'id'           => $tx->getId(),
                'type'         => $tx->getType(),
                'points'       => $tx->getPoints(),
                'description'  => $tx->getDescription(),
                'agency_name'  => $tx->getOrganizer()?->getAgencyName(),
                'organizer_id' => $tx->getOrganizer()?->getId(),
                'created_at'   => $tx->getCreatedAt()->format('Y-m-d H:i'),
            ], $history),
        ]);
    }

    // ────────────────────────────────────────────────────────
    // GET /api/loyalty/offers?trip_id=X&include_inactive=1
    // Retourne les offres de l'organizer du trip (ou de l'user connecté)
    // + les points disponibles du user CHEZ CET ORGANIZER
    // ────────────────────────────────────────────────────────
    #[Route('/offers', methods: ['GET'])]
    public function getOffers(Request $request): JsonResponse
    {
        $user = $this->getAuthUser($request);
        if (!$user) return $this->json(['error' => 'Unauthorized'], 401);

        $tripId          = $request->query->get('trip_id');
        $includeInactive = $request->query->get('include_inactive') === '1';

        $organizer       = null;
        $availablePoints = 0;

        if ($tripId) {
            // ── Cas 1 : trip_id fourni → organizer du trip ──────────
            $trip = $this->em->getRepository(Trip::class)->find($tripId);
            if ($trip?->getOrganizer()) {
                $organizer       = $trip->getOrganizer();
                $availablePoints = $this->loyaltyService->getAvailablePoints($user, $organizer);
            }
        } else {
            // ── Cas 2 : pas de trip_id ───────────────────────────────
            // Si l'user connecté EST un organizer → ses propres offres
            $organizerProfile = $this->em->getRepository(OrganizerProfile::class)->findOneBy(['user' => $user]);

            if ($organizerProfile && $includeInactive) {
                // include_inactive=1 → appel depuis dashboard organizer → ses offres uniquement
                $organizer       = $organizerProfile;
                $availablePoints = $this->loyaltyService->getAvailablePoints($user, $organizer);
            } else {
                // Appel depuis page client → toutes les offres actives tous organizers
                // (même si l'user est aussi organizer, on l'ignore ici)
                $byOrg           = $this->loyaltyService->getPointsByOrganizer($user);
                $availablePoints = array_sum(array_column($byOrg, 'available'));
                // $organizer reste null → la query renverra TOUTES les offres actives
            }
        }

        // ── Construction de la query des offres ─────────────────
        $qb = $this->em->getRepository(LoyaltyOffer::class)->createQueryBuilder('o')
            ->orderBy('o.pointsRequired', 'ASC');

        if ($organizer) {
            $qb->andWhere('o.organizer = :org')
               ->setParameter('org', $organizer);

            if (!$includeInactive) {
                $qb->andWhere('o.isActive = true');
            }

            if ($tripId && isset($trip)) {
                $qb->andWhere('o.trip IS NULL OR o.trip = :trip')
                   ->setParameter('trip', $trip);
            }
        } else {
            // Pas d'organizer ciblé → toutes les offres actives non expirées
            $qb->andWhere('o.isActive = true');
        }

        if (!$includeInactive) {
            $qb->andWhere('o.expiresAt IS NULL OR o.expiresAt > :now')
               ->setParameter('now', new \DateTimeImmutable());
        }

        $offers = $qb->getQuery()->getResult();

        // ✅ FIX 3 — Pour chaque offre, calculer can_use avec les points
        // disponibles de l'user CHEZ CET ORGANIZER SPÉCIFIQUE (et non le global)
        $pointsByOrg = [];
        if (!$organizer) {
            // Charger les points par organizer une seule fois pour tout calculer
            foreach ($this->loyaltyService->getPointsByOrganizer($user) as $orgData) {
                $pointsByOrg[$orgData['organizer_id']] = $orgData['available'] ?? 0;
            }
        }

        return $this->json([
            'available_points' => $availablePoints,
            'organizer_id'     => $organizer?->getId(),
            'agency_name'      => $organizer?->getAgencyName(),
            'offers'           => array_map(function (LoyaltyOffer $o) use ($organizer, $availablePoints, $pointsByOrg) {
                $orgId = $o->getOrganizer()?->getId();

                // can_use : basé sur les points disponibles CHEZ l'organizer de l'offre
                if ($organizer) {
                    $pts = $availablePoints;
                } else {
                    $pts = $pointsByOrg[$orgId] ?? 0;
                }

                return [
                    'id'              => $o->getId(),
                    'title'           => $o->getTitle(),
                    'description'     => $o->getDescription(),
                    'discount_type'   => $o->getDiscountType(),
                    'discount_value'  => $o->getDiscountValue(),
                    'points_required' => $o->getPointsRequired(),
                    'organizer_id'    => $orgId,
                    'agency_name'     => $o->getOrganizer()?->getAgencyName(),
                    'is_active'       => $o->isActive(),
                    'can_use'         => $pts >= $o->getPointsRequired(),
                    'expires_at'      => $o->getExpiresAt()?->format('Y-m-d'),
                    'created_at'      => $o->getCreatedAt()->format('Y-m-d'),
                ];
            }, $offers),
        ]);
    }

    // ────────────────────────────────────────────────────────
    // POST /api/loyalty/offers — Organizer crée une offre
    // ────────────────────────────────────────────────────────
    #[Route('/offers', methods: ['POST'])]
    public function createOffer(Request $request): JsonResponse
    {
        $user = $this->getAuthUser($request);
        if (!$user) return $this->json(['error' => 'Unauthorized'], 401);

        $organizer = $this->em->getRepository(OrganizerProfile::class)->findOneBy(['user' => $user]);
        if (!$organizer) return $this->json(['error' => 'Organizer profile not found'], 403);

        $data = json_decode($request->getContent(), true);

        $offer = new LoyaltyOffer();
        $offer->setOrganizer($organizer);
        $offer->setTitle($data['title'] ?? 'Offre fidélité');
        $offer->setDescription($data['description'] ?? null);
        $offer->setDiscountType($data['discount_type'] ?? 'percentage_discount');
        $offer->setDiscountValue((string)($data['discount_value'] ?? 10));
        $offer->setPointsRequired((int)($data['points_required'] ?? 100));

        if (!empty($data['trip_id'])) {
            $trip = $this->em->getRepository(Trip::class)->find($data['trip_id']);
            if ($trip) $offer->setTrip($trip);
        }

        if (!empty($data['expires_at'])) {
            $offer->setExpiresAt(new \DateTimeImmutable($data['expires_at']));
        }

        $this->em->persist($offer);
        $this->em->flush();

        return $this->json(['message' => 'Offre créée', 'id' => $offer->getId()], 201);
    }

    // ────────────────────────────────────────────────────────
    // DELETE /api/loyalty/offers/{id}
    // ────────────────────────────────────────────────────────
    #[Route('/offers/{id}', methods: ['DELETE'])]
    public function deleteOffer(int $id, Request $request): JsonResponse
    {
        $user = $this->getAuthUser($request);
        if (!$user) return $this->json(['error' => 'Unauthorized'], 401);

        $offer     = $this->em->getRepository(LoyaltyOffer::class)->find($id);
        $organizer = $this->em->getRepository(OrganizerProfile::class)->findOneBy(['user' => $user]);

        if (!$offer || $offer->getOrganizer() !== $organizer) {
            return $this->json(['error' => 'Not found'], 404);
        }

        $offer->setIsActive(false);
        $this->em->flush();

        return $this->json(['message' => 'Offre désactivée']);
    }

    // ────────────────────────────────────────────────────────
    // PATCH /api/loyalty/offers/{id}/activate — Réactiver une offre
    // ────────────────────────────────────────────────────────
    #[Route('/offers/{id}/activate', methods: ['PATCH'])]
    public function activateOffer(int $id, Request $request): JsonResponse
    {
        $user = $this->getAuthUser($request);
        if (!$user) return $this->json(['error' => 'Unauthorized'], 401);

        $offer     = $this->em->getRepository(LoyaltyOffer::class)->find($id);
        $organizer = $this->em->getRepository(OrganizerProfile::class)->findOneBy(['user' => $user]);

        if (!$offer || $offer->getOrganizer() !== $organizer) {
            return $this->json(['error' => 'Not found'], 404);
        }

        $offer->setIsActive(true);
        $this->em->flush();

        return $this->json(['message' => 'Offre réactivée']);
    }
}