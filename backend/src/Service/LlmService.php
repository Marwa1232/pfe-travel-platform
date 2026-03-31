<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\AIData;
use App\Entity\Trip;
use App\Entity\User;

class LlmService
{
    private string $apiKey;
    private HttpClientInterface $client;
    private EntityManagerInterface $em;

    private const CACHE_TTL = 3600;
    private const MODEL     = 'llama-3.1-8b-instant'; // ✅ Groq - gratuit et rapide
    private const API_URL   = 'https://api.groq.com/openai/v1/chat/completions';

    public function __construct(
        HttpClientInterface $client,
        EntityManagerInterface $em,
        #[Autowire(env: 'GROQ_API_KEY')] string $apiKey = ''
    ) {
        $this->client = $client;
        $this->em = $em;
        $this->apiKey = $apiKey;

        error_log('[LlmService] Groq API key loaded: ' . (empty($this->apiKey) ? 'NO' : 'YES'));
    }

    public function isConfigured(): bool
    {
        error_log('[LlmService] isConfigured: ' . ($this->apiKey ? 'YES' : 'NO'));
        return !empty($this->apiKey);
    }

    /**
     * Parse a natural language search query into structured filters
     */
    public function parseSearchQuery(string $query): array
    {
        $cached = $this->getCachedResponse('search_parse', $query);
        if ($cached) return $cached;

        $systemPrompt = "You are a travel assistant. Extract filters from user query. Always respond with valid JSON only, no explanation.";

        $userPrompt = <<<EOT
Parse this travel search query into JSON filters:
"{$query}"

Respond ONLY with this JSON format (use null for unknown fields):
{
  "destination": "string or null",
  "max_price": "number or null",
  "category": "string or null",
  "duration": "number or null",
  "difficulty": "string or null",
  "num_travelers": "number or null"
}
EOT;

        $result = $this->callOpenAI($systemPrompt, $userPrompt);

        if (!isset($result['error'])) {
            try {
                $this->cacheResponse('search_parse', $query, $result);
            } catch (\Exception $e) {
                error_log('[LlmService] Cache save failed (non-fatal): ' . $e->getMessage());
            }
        }

        return $result;
    }

    /**
     * Generate personalized trip recommendations based on user preferences
     * Called by RecommendationService
     */
    public function generateRecommendations(array $preferences, array $trips): array
    {
        $cacheKey = json_encode($preferences);
        $cached = $this->getCachedResponse('recommendations', $cacheKey);
        if ($cached) return $cached;

        // Build a simplified trip list for the prompt
        $tripSummaries = [];
        foreach (array_slice($trips, 0, 30) as $trip) {
            /** @var Trip $trip */
            $tripSummaries[] = [
                'id' => $trip->getId(),
                'title' => $trip->getTitle(),
                'destination' => $trip->getDestinations()->first()?->getName() ?? '',
                'categories' => array_map(fn($c) => $c->getName(), $trip->getCategories()->toArray()),
                'price' => $trip->getBasePrice(),
                'duration' => $trip->getDurationDays(),
                'difficulty' => $trip->getDifficultyLevel(),
            ];
        }

        $systemPrompt = "You are a travel recommendation engine. Respond with valid JSON only.";

        $userPrompt = "Given these user preferences: " . json_encode($preferences) . "\n\n"
            . "And these available trips: " . json_encode($tripSummaries) . "\n\n"
            . "Return a JSON array of up to 10 recommended trip IDs with reasons, format:\n"
            . '[{"trip_id": 1, "score": 85, "reason": "matches interest"}]';

        $result = $this->callOpenAI($systemPrompt, $userPrompt);

        if (!isset($result['error'])) {
            $this->cacheResponse('recommendations', $cacheKey, $result);
        }

        return $result;
    }

    /**
     * Find trips similar to a given trip
     * Called by RecommendationService
     */
    public function findSimilarTrips(Trip $trip, array $allTrips): array
    {
        $cacheKey = 'similar_' . $trip->getId();
        $cached = $this->getCachedResponse('similar_trips', $cacheKey);
        if ($cached) return $cached;

        $tripSummaries = [];
        foreach (array_slice($allTrips, 0, 30) as $t) {
            /** @var Trip $t */
            if ($t->getId() === $trip->getId()) continue;
            $tripSummaries[] = [
                'id' => $t->getId(),
                'title' => $t->getTitle(),
                'destination' => $t->getDestinations()->first()?->getName() ?? '',
                'categories' => array_map(fn($c) => $c->getName(), $t->getCategories()->toArray()),
                'price' => $t->getBasePrice(),
                'duration' => $t->getDurationDays(),
            ];
        }

        $referenceTrip = [
            'id' => $trip->getId(),
            'title' => $trip->getTitle(),
            'destination' => $trip->getDestinations()->first()?->getName() ?? '',
            'categories' => array_map(fn($c) => $c->getName(), $trip->getCategories()->toArray()),
            'price' => $trip->getBasePrice(),
            'duration' => $trip->getDurationDays(),
        ];

        $systemPrompt = "You are a travel similarity engine. Respond with valid JSON only.";

        $userPrompt = "Given this reference trip: " . json_encode($referenceTrip) . "\n\n"
            . "Find the most similar trips from this list: " . json_encode($tripSummaries) . "\n\n"
            . "Return a JSON array of up to 5 similar trip IDs, format:\n"
            . '[{"trip_id": 1, "score": 80, "reason": "same destination"}]';

        $result = $this->callOpenAI($systemPrompt, $userPrompt);

        if (!isset($result['error'])) {
            $this->cacheResponse('similar_trips', $cacheKey, $result);
        }

        return $result;
    }

    /**
     * Call OpenAI Chat Completions API
     */
    private function callOpenAI(string $systemPrompt, string $userPrompt): array
    {
        error_log('=== CALLING OPENAI ===');
        error_log('API KEY LENGTH: ' . strlen($this->apiKey));
        error_log('MODEL: ' . self::MODEL);

        try {
            $response = $this->client->request(
                'POST',
                self::API_URL, // ✅ Groq endpoint
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $this->apiKey,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'model' => self::MODEL,
                        'messages' => [ // ✅ correct key (not "input")
                            [
                                'role' => 'system',
                                'content' => $systemPrompt
                            ],
                            [
                                'role' => 'user',
                                'content' => $userPrompt
                            ]
                        ],
                        'temperature' => 0.3,
                        'response_format' => ['type' => 'json_object']
                    ]
                ]
            );

            $result = $response->toArray();

            error_log('=== OPENAI RESPONSE ===');
            error_log(json_encode($result));
            error_log('=======================');

            $content = $result['choices'][0]['message']['content'] ?? null;

            if (!$content) {
                throw new \Exception('Empty response from OpenAI');
            }

            // Clean JSON if wrapped in markdown code blocks
            $cleanJson = preg_replace('/```json\s*|\s*```/', '', trim($content));
            $decoded = json_decode($cleanJson, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log('[LlmService] JSON decode error: ' . json_last_error_msg());
                error_log('[LlmService] Raw content: ' . $content);
                return ['content' => $content];
            }

            return $decoded;

        } catch (\Exception $e) {
            error_log('================ OPENAI ERROR ================');
            error_log('Message: ' . $e->getMessage());
            error_log('Code: ' . $e->getCode());
            error_log('Trace: ' . $e->getTraceAsString());
            error_log('=============================================');

            return ['error' => $e->getMessage()];
        }
    }

    private function getCachedResponse(string $type, string $query): ?array
    {
        $cacheKey = hash('sha256', $type . '_' . $query);

        $aiData = $this->em->getRepository(AIData::class)->findOneBy([
            'dataType' => 'cache_' . $type,
            'isActive' => true
        ]);

        if (!$aiData || !$aiData->getData()) return null;

        $cacheData = $aiData->getData();

        if (isset($cacheData[$cacheKey])) {
            $cached = $cacheData[$cacheKey];
            if ($cached['expires_at'] && new \DateTime() < new \DateTime($cached['expires_at'])) {
                return $cached['response'];
            }
        }

        return null;
    }

    private function cacheResponse(string $type, string $query, array $response): void
    {
        $cacheKey = hash('sha256', $type . '_' . $query);

        $aiData = $this->em->getRepository(AIData::class)->findOneBy([
            'dataType' => 'cache_' . $type,
            'isActive' => true
        ]);

        if (!$aiData) {
            $aiData = new AIData();
            $aiData->setDataType('cache_' . $type);
            $aiData->setIsActive(true);
        }

        $cacheData = $aiData->getData() ?? [];

        $cacheData[$cacheKey] = [
            'response' => $response,
            'created_at' => (new \DateTime())->format('Y-m-d H:i:s'),
            'expires_at' => (new \DateTime())->modify('+' . self::CACHE_TTL . ' seconds')->format('Y-m-d H:i:s')
        ];

        $aiData->setData($cacheData);
        $this->em->persist($aiData);
        $this->em->flush();
    }
}