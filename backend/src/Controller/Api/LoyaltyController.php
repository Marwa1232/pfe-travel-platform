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

    // GET /api/loyalty/points
    #[Route('/points', methods: ['GET'])]
    public function getPoints(Request $request): JsonResponse
    {
        $user = $this->getAuthUser($request);
        if (!$user) return $this->json(['error' => 'Unauthorized'], 401);

        $lp      = $this->loyaltyService->getOrCreate($user);
        $history = $this->loyaltyService->getHistory($user);

        return $this->json([
            'total_points'     => $lp->getTotalPoints(),
            'used_points'      => $lp->getUsedPoints(),
            'available_points' => $lp->getAvailablePoints(),
            'history'          => array_map(fn($tx) => [
                'id'          => $tx->getId(),
                'type'        => $tx->getType(),
                'points'      => $tx->getPoints(),
                'description' => $tx->getDescription(),
                'created_at'  => $tx->getCreatedAt()->format('Y-m-d H:i'),
            ], $history),
        ]);
    }

    // GET /api/loyalty/offers?trip_id=X
    #[Route('/offers', methods: ['GET'])]
    public function getOffers(Request $request): JsonResponse
    {
        $user = $this->getAuthUser($request);
        if (!$user) return $this->json(['error' => 'Unauthorized'], 401);

        $lp      = $this->loyaltyService->getOrCreate($user);
        $tripId  = $request->query->get('trip_id');

        $qb = $this->em->getRepository(LoyaltyOffer::class)->createQueryBuilder('o')
            ->where('o.isActive = true')
            ->andWhere('o.expiresAt IS NULL OR o.expiresAt > :now')
            ->setParameter('now', new \DateTimeImmutable())
            ->orderBy('o.pointsRequired', 'ASC');

        if ($tripId) {
            $trip = $this->em->getRepository(Trip::class)->find($tripId);
            if ($trip) {
                $qb->andWhere('o.trip IS NULL OR o.trip = :trip')
                   ->setParameter('trip', $trip);
                if ($trip->getOrganizer()) {
                    $qb->andWhere('o.organizer = :org')
                       ->setParameter('org', $trip->getOrganizer());
                }
            }
        }

        $offers = $qb->getQuery()->getResult();

        return $this->json([
            'available_points' => $lp->getAvailablePoints(),
            'offers'           => array_map(fn(LoyaltyOffer $o) => [
                'id'              => $o->getId(),
                'title'           => $o->getTitle(),
                'description'     => $o->getDescription(),
                'discount_type'   => $o->getDiscountType(),
                'discount_value'  => $o->getDiscountValue(),
                'points_required' => $o->getPointsRequired(),
                'can_use'         => $lp->getAvailablePoints() >= $o->getPointsRequired(),
                'expires_at'      => $o->getExpiresAt()?->format('Y-m-d'),
            ], $offers),
        ]);
    }

    // POST /api/loyalty/offers (organisateur crée une offre)
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

    // DELETE /api/loyalty/offers/{id}
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
}
