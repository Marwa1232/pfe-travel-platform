<?php

namespace App\Service;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService
{
    private string $secretKey;
    private string $publicKey;
    private string $algorithm = 'RS256';
    private int $ttl = 3600; // 1 heure

    public function __construct()
    {
        // Use RSA keys for RS256 algorithm
        $this->secretKey = dirname(__DIR__, 2) . '/config/jwt/private.pem';
        $this->publicKey = dirname(__DIR__, 2) . '/config/jwt/public.pem';
        
        if (!file_exists($this->secretKey)) {
            throw new \RuntimeException('JWT private key not found: ' . $this->secretKey);
        }
        
        if (!file_exists($this->publicKey)) {
            throw new \RuntimeException('JWT public key not found: ' . $this->publicKey);
        }
    }

    public function generateToken(array $payload): string
    {
        $issuedAt = time();
        $expirationTime = $issuedAt + $this->ttl;

        $token = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'username' => $payload['email'] ?? '', // Required by LexikJWT
            'data' => $payload
        ];

        return JWT::encode($token, file_get_contents($this->secretKey), $this->algorithm);
    }

    public function decodeToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key(file_get_contents($this->publicKey), $this->algorithm));
            $decodedArray = (array) $decoded;
            
            // Check if data is wrapped in a 'data' key or at root level
            if (isset($decodedArray['data'])) {
                return (array) $decodedArray['data'];
            }
            
            // Return the full payload minus standard JWT claims
            unset($decodedArray['iat'], $decodedArray['exp'], $decodedArray['username']);
            return $decodedArray;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function validateToken(string $token): bool
    {
        return $this->decodeToken($token) !== null;
    }
}