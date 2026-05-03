<?php

namespace App\Controller\Api;

use App\Entity\Favorite;
use App\Entity\Trip;
use App\Entity\User;
use App\Repository\FavoriteRepository;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * FIXES APPLIED:
 *
 * 1. Route ordering — specific named routes (/check/{tripId}, /toggle/{tripId})
 *    are declared BEFORE the generic /{tripId} routes to prevent Symfony from
 *    matching "check" or "toggle" as an integer tripId → 500.
 *
 * 2. FavoriteRepository::findByUser() now eager-loads images & destinations
 *    so Doctrine never lazy-loads outside the session → 500.
 *
 * 3. Safe collection access: null-check on getImages()/getDestinations()
 *    before calling ->toArray(), and safe isCover() / getIsCover() fallback.
 *
 * 4. Removed unused SerializerInterface injection.
 */
#[Route('/api/favorites')]
class FavoriteApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private FavoriteRepository $favoriteRepository,
        private JwtService $jwtService
    ) {}

    // ─────────────────────────────────────────────────────────────
    //  Auth helper
    // ─────────────────────────────────────────────────────────────
    private function getCurrentUser(Request $request): ?User
    {
        $user = $this->getUser();
        if ($user instanceof User) {
            return $user;
        }

        $authHeader = $request->headers->get('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            try {
                $token   = substr($authHeader, 7);
                $payload = $this->jwtService->decodeToken($token);
                if ($payload && isset($payload['id'])) {
                    return $this->em->getRepository(User::class)->find($payload['id']);
                }
            } catch (\Exception $e) {
                error_log('JWT decode error: ' . $e->getMessage());
            }
        }

        return null;
    }

    // ─────────────────────────────────────────────────────────────
    //  Safe trip serializer (avoids isCover() naming mismatch)
    // ─────────────────────────────────────────────────────────────
    private function serializeTrip(Trip $trip, Favorite $favorite): array
    {
        // Images — safely handle both isCover() and getIsCover() method names
        $images = [];
        $imgCollection = $trip->getImages();
        if ($imgCollection) {
            foreach ($imgCollection->toArray() as $img) {
                $isCover = method_exists($img, 'isCover')
                    ? $img->isCover()
                    : (method_exists($img, 'getIsCover') ? $img->getIsCover() : false);

                $images[] = [
                    'url'      => $img->getUrl(),
                    'is_cover' => (bool) $isCover,
                ];
            }
        }

        // Cover image shortcut (used by TripCard)
        $coverImage = null;
        foreach ($images as $img) {
            if ($img['is_cover']) {
                $coverImage = $img['url'];
                break;
            }
        }
        if (!$coverImage && count($images) > 0) {
            $coverImage = $images[0]['url'];
        }

        // Destinations
        $destinations = [];
        $destCollection = $trip->getDestinations();
        if ($destCollection) {
            foreach ($destCollection->toArray() as $dest) {
                $destinations[] = [
                    'id'   => $dest->getId(),
                    'name' => $dest->getName(),
                ];
            }
        }

        return [
            'id'               => $trip->getId(),
            'title'            => $trip->getTitle(),
            'short_description'=> $trip->getShortDescription(),
            'base_price'       => $trip->getBasePrice(),
            'currency'         => $trip->getCurrency() ?? 'TND',
            'duration_days'    => $trip->getDurationDays(),
            'difficulty_level' => $trip->getDifficultyLevel(),
            'status'           => $trip->getStatus(),
            'cover_image'      => $coverImage,   // flat field for TripCard
            'images'           => $images,
            'destinations'     => $destinations,
            'favorite_id'      => $favorite->getId(),
            'favorited_at'     => null,  // Favorite entity has no createdAt field
        ];
    }

    // ─────────────────────────────────────────────────────────────
    //  GET /api/favorites
    // ─────────────────────────────────────────────────────────────
    #[Route('', name: 'api_favorites_list', methods: ['GET'])]
    public function listFavorites(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $favorites = $this->favoriteRepository->findByUser($user);

            $result = [];
            foreach ($favorites as $favorite) {
                $trip = $favorite->getTrip();
                if ($trip) {
                    $result[] = $this->serializeTrip($trip, $favorite);
                }
            }

            return $this->json($result);

        } catch (\Exception $e) {
            error_log('Favorites list error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return $this->json(['error' => 'Failed to load favorites', 'detail' => $e->getMessage()], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  GET /api/favorites/check/{tripId}
    //  MUST be declared before /{tripId} routes to avoid conflict
    // ─────────────────────────────────────────────────────────────
    #[Route('/check/{tripId}', name: 'api_favorites_check', methods: ['GET'])]
    public function checkFavorite(Request $request, int $tripId): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['is_favorite' => false]);
        }

        $isFavorite = $this->favoriteRepository->isFavorite($user, $tripId);
        return $this->json(['is_favorite' => $isFavorite]);
    }

    // ─────────────────────────────────────────────────────────────
    //  POST /api/favorites/toggle/{tripId}
    //  MUST be declared before /{tripId} routes to avoid conflict
    // ─────────────────────────────────────────────────────────────
    #[Route('/toggle/{tripId}', name: 'api_favorites_toggle', methods: ['POST'])]
    public function toggleFavorite(Request $request, int $tripId): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $trip = $this->em->getRepository(Trip::class)->find($tripId);
        if (!$trip) {
            return $this->json(['error' => 'Trip not found'], Response::HTTP_NOT_FOUND);
        }

        $existingFavorite = $this->favoriteRepository->findByUserAndTrip($user, $tripId);

        if ($existingFavorite) {
            $this->em->remove($existingFavorite);
            $this->em->flush();
            return $this->json(['is_favorite' => false, 'message' => 'Removed from favorites']);
        }

        $favorite = new Favorite();
        $favorite->setUser($user);
        $favorite->setTrip($trip);
        $this->em->persist($favorite);
        $this->em->flush();

        return $this->json([
            'is_favorite'  => true,
            'favorite_id'  => $favorite->getId(),
            'message'      => 'Added to favorites',
        ], Response::HTTP_CREATED);
    }

    // ─────────────────────────────────────────────────────────────
    //  POST /api/favorites/{tripId}
    // ─────────────────────────────────────────────────────────────
    #[Route('/{tripId}', name: 'api_favorites_add', methods: ['POST'])]
    public function addFavorite(Request $request, int $tripId): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $trip = $this->em->getRepository(Trip::class)->find($tripId);
        if (!$trip) {
            return $this->json(['error' => 'Trip not found'], Response::HTTP_NOT_FOUND);
        }

        $existingFavorite = $this->favoriteRepository->findByUserAndTrip($user, $tripId);
        if ($existingFavorite) {
            return $this->json(['message' => 'Already favorited', 'favorite_id' => $existingFavorite->getId()]);
        }

        $favorite = new Favorite();
        $favorite->setUser($user);
        $favorite->setTrip($trip);
        $this->em->persist($favorite);
        $this->em->flush();

        return $this->json([
            'message'     => 'Favorite added',
            'favorite_id' => $favorite->getId(),
        ], Response::HTTP_CREATED);
    }

    // ─────────────────────────────────────────────────────────────
    //  DELETE /api/favorites/{tripId}
    // ─────────────────────────────────────────────────────────────
    #[Route('/{tripId}', name: 'api_favorites_remove', methods: ['DELETE'])]
    public function removeFavorite(Request $request, int $tripId): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $favorite = $this->favoriteRepository->findByUserAndTrip($user, $tripId);
        if (!$favorite) {
            return $this->json(['error' => 'Favorite not found'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($favorite);
        $this->em->flush();

        return $this->json(['message' => 'Favorite removed']);
    }
}