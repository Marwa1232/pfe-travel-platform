<?php

namespace App\Security;

use App\Entity\User;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class JwtAuthenticator extends AbstractAuthenticator
{
    private array $publicPaths = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/categories',
        '/api/destinations',
        '/api/ai/search',
    ];

    public function __construct(
        private JwtService $jwtService,
        private EntityManagerInterface $em
    ) {}

    public function supports(Request $request): ?bool
    {
        if ($request->getMethod() === 'OPTIONS') {
            return false;
        }
        
        $path = $request->getPathInfo();
        
        // Check if this is a public path
        foreach ($this->publicPaths as $publicPath) {
            if (str_starts_with($path, $publicPath)) {
                return false;
            }
        }
    
        return str_starts_with($path, '/api');
    }

    public function authenticate(Request $request): Passport
    {
        $token = $this->extractToken($request);

        if (!$token) {
            throw new CustomUserMessageAuthenticationException('No token provided');
        }

        $payload = $this->jwtService->decodeToken($token);

        if (!$payload || !isset($payload['email'])) {
            throw new CustomUserMessageAuthenticationException('Invalid token');
        }

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $payload['email']]);

        if (!$user || !$user->isActive()) {
            throw new CustomUserMessageAuthenticationException('User not found or inactive');
        }

        return new SelfValidatingPassport(new UserBadge($user->getUserIdentifier(), function() use ($user) {
            return $user;
        }));
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse([
            'error' => 'Authentication failed',
            'message' => strtr($exception->getMessageKey(), $exception->getMessageData())
        ], Response::HTTP_UNAUTHORIZED);
    }

    private function extractToken(Request $request): ?string
    {
        $authorization = $request->headers->get('Authorization');
        
        if (!$authorization || !str_starts_with($authorization, 'Bearer ')) {
            return null;
        }

        return substr($authorization, 7);
    }
}
