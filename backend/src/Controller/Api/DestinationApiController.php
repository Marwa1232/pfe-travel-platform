<?php

namespace App\Controller\Api;

use App\Entity\Destination;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/destinations')]
class DestinationApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: 'api_destinations_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $destinations = $this->em->getRepository(Destination::class)->findAll();
        
        $json = $this->serializer->serialize($destinations, 'json', ['groups' => 'destination:read']);
        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/popular', name: 'api_destinations_popular', methods: ['GET'])]
    public function popular(): JsonResponse
    {
        $destinations = $this->em->getRepository(Destination::class)->findAll();
        
        // Add trips_count and min_price to each destination
        $result = array_map(function ($destination) {
            return [
                'id' => $destination->getId(),
                'name' => $destination->getName(),
                'country' => $destination->getCountry(),
                'region' => $destination->getRegion(),
                'image' => $destination->getImage() ?? 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&q=80',
                'trips_count' => $destination->getTripsCount(),
                'min_price' => $destination->getMinPrice(),
            ];
        }, $destinations);

        // Filter destinations with trips and sort by trips_count
        $result = array_filter($result, fn($d) => $d['trips_count'] > 0);
        usort($result, fn($a, $b) => $b['trips_count'] - $a['trips_count']);

        return new JsonResponse($result, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_destinations_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $destination = $this->em->getRepository(Destination::class)->find($id);
        
        if (!$destination) {
            return $this->json(['error' => 'Destination not found'], Response::HTTP_NOT_FOUND);
        }
        
        $json = $this->serializer->serialize($destination, 'json', ['groups' => 'destination:read']);
        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }
}
