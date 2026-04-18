<?php

namespace App\Controller\Api;

use App\Entity\Favorite;
use App\Entity\Trip;
use App\Entity\User;
use App\Repository\FavoriteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/favorites')]
class FavoriteApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private FavoriteRepository $favoriteRepository,
        private SerializerInterface $serializer
    ) {}

    private function getCurrentUser(Request $request): ?User
    {
        $user = $this->getUser();
        if ($user instanceof User) {
            return $user;
        }
        return null;
    }

    #[Route('', name: 'api_favorites_list', methods: ['GET'])]
    public function listFavorites(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $favorites = $this->favoriteRepository->findByUser($user);

        $trips = [];
        foreach ($favorites as $favorite) {
            $trip = $favorite->getTrip();
            if ($trip) {
                $trips[] = [
                    'id' => $trip->getId(),
                    'title' => $trip->getTitle(),
                    'short_description' => $trip->getShortDescription(),
                    'base_price' => $trip->getBasePrice(),
                    'currency' => $trip->getCurrency(),
                    'duration_days' => $trip->getDurationDays(),
                    'difficulty_level' => $trip->getDifficultyLevel(),
                    'status' => $trip->getStatus(),
                    'images' => array_map(function($img) {
                        return [
                            'url' => $img->getUrl(),
                            'is_cover' => $img->isIsCover(),
                        ];
                    }, $trip->getImages()->toArray()),
                    'destinations' => array_map(function($dest) {
                        return ['id' => $dest->getId(), 'name' => $dest->getName()];
                    }, $trip->getDestinations()->toArray()),
                    'favorite_id' => $favorite->getId(),
                    'favorited_at' => $favorite->getCreatedAt()?->format('Y-m-d H:i:s'),
                ];
            }
        }

        return $this->json($trips);
    }

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

        // Check if already favorited
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
            'message' => 'Favorite added',
            'favorite_id' => $favorite->getId(),
        ], Response::HTTP_CREATED);
    }

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
        } else {
            $favorite = new Favorite();
            $favorite->setUser($user);
            $favorite->setTrip($trip);
            $this->em->persist($favorite);
            $this->em->flush();
            return $this->json(['is_favorite' => true, 'favorite_id' => $favorite->getId(), 'message' => 'Added to favorites']);
        }
    }
}
