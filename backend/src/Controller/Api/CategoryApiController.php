<?php

namespace App\Controller\Api;

use App\Entity\Category;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/categories')]
class CategoryApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: 'api_categories_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $categories = $this->em->getRepository(Category::class)->findAll();
        
        $json = $this->serializer->serialize($categories, 'json', ['groups' => 'category:read']);
        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'api_categories_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $category = $this->em->getRepository(Category::class)->find($id);
        
        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }
        
        $json = $this->serializer->serialize($category, 'json', ['groups' => 'category:read']);
        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }
}
