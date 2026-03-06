<?php

namespace App\Controller;

use App\Entity\Trip;
use App\Entity\User;
use App\Repository\TripRepository;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/trips')]
class TripController extends AbstractController
{
    public function __construct(
        private TripRepository $tripRepo,
        private EntityManagerInterface $em,
        private JwtService $jwtService
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

    #[Route('', name: 'api_trips_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $filters = [
            'destination' => $request->query->get('destination'),
            'category' => $request->query->get('category'),
            'country' => $request->query->get('country'),
            'min_price' => $request->query->get('min_price'),
            'max_price' => $request->query->get('max_price'),
            'start_date' => $request->query->get('start_date'),
            'duration' => $request->query->get('duration'),
            'page' => $request->query->getInt('page', 1),
            'limit' => $request->query->getInt('limit', 12),
        ];

        $trips = $this->tripRepo->search($filters);

        return $this->json($trips, Response::HTTP_OK, [], ['groups' => ['trip:list', 'trip:read']]);
    }

    #[Route('/{id}', name: 'api_trips_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $trip = $this->tripRepo->find($id);

        if (!$trip || !$trip->isActive()) {
            return $this->json(['error' => 'Trip not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($trip, Response::HTTP_OK, [], ['groups' => 'trip:read']);
    }

    #[Route('', name: 'api_trips_create', methods: ['POST'])]
    #[IsGranted('ROLE_ORGANIZER')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $trip = new Trip();
        $trip->setTitle($data['title'] ?? '');
        $trip->setShortDescription($data['short_description'] ?? null);
        $trip->setLongDescription($data['long_description'] ?? null);
        $trip->setBasePrice($data['base_price'] ?? '0');
        $trip->setCurrency($data['currency'] ?? 'TND');
        $trip->setDurationDays($data['duration_days'] ?? 1);
        $trip->setDifficultyLevel($data['difficulty_level'] ?? 'medium');

        // Récupérer l'organisateur de l'utilisateur connecté
        $user = $this->getUser();
        $organizer = $user->getOrganizerProfile();
        if (!$organizer || $organizer->getStatus() !== 'APPROVED') {
            return $this->json(['error' => 'Organizer profile not approved'], Response::HTTP_FORBIDDEN);
        }
        $trip->setOrganizer($organizer);

        $this->em->persist($trip);
        $this->em->flush();

        return $this->json($trip, Response::HTTP_CREATED, [], ['groups' => 'trip:read']);
    }

    #[Route('/{id}', name: 'api_trips_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ORGANIZER')]
    public function update(int $id, Request $request): JsonResponse
    {
        $trip = $this->tripRepo->find($id);

        if (!$trip) {
            return $this->json(['error' => 'Trip not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que l'organisateur est le propriétaire
        $user = $this->getUser();
        if ($trip->getOrganizer()->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) $trip->setTitle($data['title']);
        if (isset($data['short_description'])) $trip->setShortDescription($data['short_description']);
        if (isset($data['long_description'])) $trip->setLongDescription($data['long_description']);
        if (isset($data['base_price'])) $trip->setBasePrice($data['base_price']);
        if (isset($data['duration_days'])) $trip->setDurationDays($data['duration_days']);

        $trip->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json($trip, Response::HTTP_OK, [], ['groups' => 'trip:read']);
    }

    #[Route('/{id}', name: 'api_trips_delete', methods: ['DELETE'])]
    public function delete(int $id, Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }
        
        $trip = $this->tripRepo->find($id);

        if (!$trip) {
            return $this->json(['error' => 'Trip not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que l'organisateur est le propriétaire
        if ($trip->getOrganizer()->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $this->em->remove($trip);
        $this->em->flush();

        return $this->json(['message' => 'Trip deleted'], Response::HTTP_OK);
    }
}