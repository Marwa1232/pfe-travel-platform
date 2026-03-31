<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\AIData;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class EmbeddingService
{
    private string $apiKey;
    private HttpClientInterface $client;
    private EntityManagerInterface $em;

    private const CACHE_TTL = 86400; // 24 hours
    private const MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
    private const API_URL = 'https://router.huggingface.co/hf-inference/models/';

    public function __construct(
        HttpClientInterface $client,
        EntityManagerInterface $em,
        #[Autowire(env: 'HUGGINGFACE_API_KEY')] string $apiKey = ''
    ) {
        $this->client = $client;
        $this->em = $em;
        $this->apiKey = $apiKey;

        error_log('[EmbeddingService] API key loaded: ' . (empty($this->apiKey) ? 'NO' : 'YES'));
        error_log('[EmbeddingService] API key length: ' . strlen($this->apiKey));
    }

    public function isConfigured(): bool
    {
        $configured = !empty($this->apiKey);
        error_log('[EmbeddingService] isConfigured: ' . ($configured ? 'YES' : 'NO'));
        error_log('[EmbeddingService] API key value: ' . substr($this->apiKey, 0, 10) . '...');
        return $configured;
    }

    /**
     * Generate embedding for a text string
     */
    public function generateEmbedding(string $text): ?array
    {
        if (empty(trim($text))) {
            error_log('[EmbeddingService] Empty text provided');
            return null;
        }

        // Check cache first
        $cached = $this->getCachedEmbedding($text);
        if ($cached) {
            error_log('[EmbeddingService] Using cached embedding for: ' . substr($text, 0, 50) . '...');
            return $cached;
        }

        error_log('[EmbeddingService] Calling Hugging Face API for: ' . substr($text, 0, 50) . '...');
        error_log('[EmbeddingService] API URL: ' . self::API_URL . self::MODEL);
        error_log('[EmbeddingService] API Key length: ' . strlen($this->apiKey));

        try {
            $response = $this->client->request(
                'POST',
                self::API_URL . self::MODEL,
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $this->apiKey,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'inputs' => $text,
                        'options' => [
                            'wait_for_model' => true,
                        ]
                    ]
                ]
            );

            $statusCode = $response->getStatusCode();
            error_log('[EmbeddingService] API response status: ' . $statusCode);

            $result = $response->toArray();
            error_log('[EmbeddingService] API response: ' . json_encode($result));

            // Hugging Face returns a nested array, extract the embedding
            $embedding = is_array($result) && isset($result[0]) ? $result[0] : $result;

            if (!is_array($embedding) || empty($embedding)) {
                error_log('[EmbeddingService] Invalid embedding format received');
                return null;
            }

            error_log('[EmbeddingService] Generated embedding with ' . count($embedding) . ' dimensions');

            // Cache the embedding
            $this->cacheEmbedding($text, $embedding);

            return $embedding;

        } catch (\Exception $e) {
            error_log('[EmbeddingService] Error generating embedding: ' . $e->getMessage());
            error_log('[EmbeddingService] Stack trace: ' . $e->getTraceAsString());
            return null;
        }
    }

    /**
     * Generate embeddings for multiple texts in batch
     */
    public function generateEmbeddings(array $texts): array
    {
        $embeddings = [];

        foreach ($texts as $text) {
            $embedding = $this->generateEmbedding($text);
            if ($embedding) {
                $embeddings[$text] = $embedding;
            }
        }

        return $embeddings;
    }

    /**
     * Calculate cosine similarity between two embeddings
     */
    public function calculateSimilarity(array $embedding1, array $embedding2): float
    {
        if (count($embedding1) !== count($embedding2)) {
            return 0.0;
        }

        $dotProduct = 0;
        $norm1 = 0;
        $norm2 = 0;

        for ($i = 0; $i < count($embedding1); $i++) {
            $dotProduct += $embedding1[$i] * $embedding2[$i];
            $norm1 += $embedding1[$i] * $embedding1[$i];
            $norm2 += $embedding2[$i] * $embedding2[$i];
        }

        $norm1 = sqrt($norm1);
        $norm2 = sqrt($norm2);

        if ($norm1 == 0 || $norm2 == 0) {
            return 0.0;
        }

        return $dotProduct / ($norm1 * $norm2);
    }

    /**
     * Find most similar items from a list based on embedding similarity
     */
    public function findMostSimilar(array $queryEmbedding, array $itemEmbeddings, int $limit = 5): array
    {
        $similarities = [];

        foreach ($itemEmbeddings as $itemId => $embedding) {
            $similarity = $this->calculateSimilarity($queryEmbedding, $embedding);
            $similarities[$itemId] = $similarity;
        }

        // Sort by similarity (descending)
        arsort($similarities);

        // Return top N items
        return array_slice($similarities, 0, $limit, true);
    }

    /**
     * Generate embedding for a trip based on its properties
     */
    public function generateTripEmbedding(array $tripData): ?array
    {
        $textParts = [];

        if (!empty($tripData['title'])) {
            $textParts[] = $tripData['title'];
        }

        if (!empty($tripData['short_description'])) {
            $textParts[] = $tripData['short_description'];
        }

        if (!empty($tripData['destination'])) {
            $textParts[] = 'Destination: ' . $tripData['destination'];
        }

        if (!empty($tripData['categories']) && is_array($tripData['categories'])) {
            $textParts[] = 'Categories: ' . implode(', ', $tripData['categories']);
        }

        if (!empty($tripData['difficulty_level'])) {
            $textParts[] = 'Difficulty: ' . $tripData['difficulty_level'];
        }

        if (empty($textParts)) {
            return null;
        }

        $text = implode('. ', $textParts);
        return $this->generateEmbedding($text);
    }

    /**
     * Generate embedding for user preferences
     */
    public function generateUserPreferenceEmbedding(array $preferences): ?array
    {
        $textParts = [];

        if (!empty($preferences['interests']) && is_array($preferences['interests'])) {
            $textParts[] = 'Interests: ' . implode(', ', $preferences['interests']);
        }

        if (!empty($preferences['past_bookings']['destinations'])) {
            $destinations = array_keys($preferences['past_bookings']['destinations']);
            $textParts[] = 'Past destinations: ' . implode(', ', $destinations);
        }

        if (!empty($preferences['past_bookings']['categories'])) {
            $categories = array_keys($preferences['past_bookings']['categories']);
            $textParts[] = 'Preferred categories: ' . implode(', ', $categories);
        }

        if (empty($textParts)) {
            return null;
        }

        $text = implode('. ', $textParts);
        return $this->generateEmbedding($text);
    }

    /**
     * Get cached embedding
     */
    private function getCachedEmbedding(string $text): ?array
    {
        $cacheKey = hash('sha256', $text);

        $aiData = $this->em->getRepository(AIData::class)->findOneBy([
            'dataType' => 'embedding_cache',
            'isActive' => true
        ]);

        if (!$aiData || !$aiData->getData()) {
            return null;
        }

        $cacheData = $aiData->getData();

        if (isset($cacheData[$cacheKey])) {
            $cached = $cacheData[$cacheKey];
            if ($cached['expires_at'] && new \DateTime() < new \DateTime($cached['expires_at'])) {
                return $cached['embedding'];
            }
        }

        return null;
    }

    /**
     * Cache embedding
     */
    private function cacheEmbedding(string $text, array $embedding): void
    {
        $cacheKey = hash('sha256', $text);

        $aiData = $this->em->getRepository(AIData::class)->findOneBy([
            'dataType' => 'embedding_cache',
            'isActive' => true
        ]);

        if (!$aiData) {
            $aiData = new AIData();
            $aiData->setDataType('embedding_cache');
            $aiData->setIsActive(true);
        }

        $cacheData = $aiData->getData() ?? [];

        $cacheData[$cacheKey] = [
            'embedding' => $embedding,
            'created_at' => (new \DateTime())->format('Y-m-d H:i:s'),
            'expires_at' => (new \DateTime())->modify('+' . self::CACHE_TTL . ' seconds')->format('Y-m-d H:i:s')
        ];

        // Limit cache size to prevent database bloat
        if (count($cacheData) > 1000) {
            // Remove oldest entries
            uasort($cacheData, function($a, $b) {
                return strtotime($a['created_at']) - strtotime($b['created_at']);
            });
            $cacheData = array_slice($cacheData, -500, null, true);
        }

        $aiData->setData($cacheData);
        $this->em->persist($aiData);
        $this->em->flush();
    }
}