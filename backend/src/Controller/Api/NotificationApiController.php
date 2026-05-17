<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\Notification;
use App\Service\NotificationService;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/notifications')]
class NotificationApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private SerializerInterface $serializer,
        private NotificationService $notificationService,
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

    #[Route('', name: 'api_notifications_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $notifications = $this->em->getRepository(Notification::class)->findBy(
            ['user' => $user],
            ['createdAt' => 'DESC']
        );

        $data = array_map(fn($n) => [
            'id'        => $n->getId(),
            'title'     => $n->getTitle(),
            'message'   => $n->getMessage(),
            'type'      => $n->getType(),
            'isRead'    => $n->isRead(),   // camelCase garanti
            'createdAt' => $n->getCreatedAt()?->format('Y-m-d H:i:s'),
        ], $notifications);

        return $this->json($data);
    }

    #[Route('/unread-count', name: 'api_notifications_unread_count', methods: ['GET'])]
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $count = $this->notificationService->getUnreadCount($user);

        return $this->json(['unreadCount' => $count]);
    }

    #[Route('/read-all', name: 'api_notifications_read_all', methods: ['PATCH'])]
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $notifications = $this->em->getRepository(Notification::class)->findBy([
            'user' => $user,
            'isRead' => false,
        ]);

        foreach ($notifications as $notification) {
            $notification->setIsRead(true);
        }

        $this->em->flush();

        return $this->json(['message' => 'All notifications marked as read']);
    }

    #[Route('/{id}/read', name: 'api_notifications_read', methods: ['PATCH'])]
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $notification = $this->em->getRepository(Notification::class)->find($id);

        if (!$notification) {
            return $this->json(['error' => 'Notification not found'], Response::HTTP_NOT_FOUND);
        }

        if ($notification->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $notification->setIsRead(true);
        $this->em->flush();

        return $this->json(['message' => 'Notification marked as read']);
    }
}