<?php

namespace App\Controller\Api;

use App\Service\LlmService;
use App\Service\RecommendationService;
use App\Service\EmbeddingService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SearchAiController extends AbstractController
{
    private HttpClientInterface $client;
    private EntityManagerInterface $em;
    private LlmService $llmService;
    private RecommendationService $recommendationService;
    private EmbeddingService $embeddingService;

    public function __construct(
        HttpClientInterface $client,
        EntityManagerInterface $em,
        LlmService $llmService,
        RecommendationService $recommendationService,
        EmbeddingService $embeddingService
    ) {
        $this->client = $client;
        $this->em = $em;
        $this->llmService = $llmService;
        $this->recommendationService = $recommendationService;
        $this->embeddingService = $embeddingService;
    }

    private function getFirstDestination($trip): ?object
    {
        $first = $trip->getDestinations()->first();
        return $first === false ? null : $first;
    }

    private function formatTrip($trip): array
    {
        $firstDest = $this->getFirstDestination($trip);
        return [
            'id'                => $trip->getId(),
            'title'             => $trip->getTitle() ?? '',
            'short_description' => $trip->getShortDescription() ?? '',
            'long_description'  => $trip->getLongDescription() ?? '',
            'base_price'        => $trip->getBasePrice(),
            'currency'          => $trip->getCurrency() ?? 'TND',
            'duration_days'     => $trip->getDurationDays(),
            'difficulty_level'  => $trip->getDifficultyLevel() ?? '',
            'destination'       => $firstDest?->getName() ?? '',
            'cover_image'       => $trip->getCoverImage()?->getUrl() ?? '',
            'status'            => $trip->getStatus() ?? '',
            'rating'            => $trip->getVisibilityScore() ?? 0,
            'categories'        => array_map(fn($c) => ['id' => $c->getId(), 'name' => $c->getName()], $trip->getCategories()->toArray()),
            'destinations'      => array_map(fn($d) => ['id' => $d->getId(), 'name' => $d->getName(), 'country' => $d->getCountry() ?? ''], $trip->getDestinations()->toArray()),
        ];
    }

    #[Route('/api/ai/search', name: 'api_ai_search', methods: ['POST'])]
    public function smartSearch(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $userQuery = $data['query'] ?? '';

        if (empty($userQuery)) {
            return new JsonResponse(['error' => 'Query is empty'], 400);
        }

        // 1. Embedding semantic search
        if ($this->embeddingService->isConfigured()) {
            try {
                $semanticResults = $this->recommendationService->semanticSearch($userQuery, 20);
                if (!empty($semanticResults)) {
                    $tripResults = array_map(function ($result) {
                        $trip = $result['trip'];
                        return [
                            'id'               => $trip['id'] ?? null,
                            'title'            => $trip['title'] ?? '',
                            'short_description'=> $trip['short_description'] ?? '',
                            'base_price'       => $trip['base_price'] ?? 0,
                            'currency'         => $trip['currency'] ?? 'TND',
                            'duration_days'    => $trip['duration_days'] ?? null,
                            'difficulty_level' => $trip['difficulty_level'] ?? '',
                            'destination'      => $trip['destination'] ?? '',
                            'cover_image'      => $trip['cover_image'] ?? '',
                            'categories'       => $trip['categories'] ?? [],
                            'destinations'     => $trip['destinations'] ?? [],
                            'similarity_score' => $result['score'] ?? 0,
                            'match_reason'     => $result['reason'] ?? '',
                        ];
                    }, $semanticResults);
                    return new JsonResponse([
                        'query' => $userQuery, 'search_method' => 'semantic_embedding',
                        'trips' => $tripResults, 'total_found' => count($tripResults),
                        'explanation' => 'Semantic search using AI embeddings',
                        'available_destinations' => $this->getAvailableDestinations(),
                        'available_categories' => $this->getAvailableCategories(),
                        'generated_at' => (new \DateTime())->format('Y-m-d H:i:s'),
                    ]);
                }
            } catch (\Exception $e) {}
        }

        // 2. LLM-based search (Groq)
        if ($this->llmService->isConfigured()) {
            try {
                $filters = $this->llmService->parseSearchQuery($userQuery);

                if (isset($filters['error'])) {
                    return $this->fallbackSearch($userQuery, new \Exception($filters['error']));
                }

                $allTrips = $this->em->getRepository(\App\Entity\Trip::class)->findActiveTrips();

                // ✅ Filter called only ONCE
                $filteredTrips = $this->recommendationService->filterTripsByFilters($allTrips, $filters);

                // If destination filter returned nothing, try keyword search in title/description
                if (empty($filteredTrips) && !empty($filters['destination'])) {
                    $searchTerm = strtolower($filters['destination']);
                    $filteredTrips = array_values(array_filter($allTrips, function($t) use ($searchTerm) {
                        $title = strtolower($t->getTitle() ?? '');
                        $desc  = strtolower($t->getShortDescription() ?? '');
                        $tags  = strtolower(implode(' ', $t->getTags() ?? []));
                        return strpos($title, $searchTerm) !== false
                            || strpos($desc, $searchTerm) !== false
                            || strpos($tags, $searchTerm) !== false;
                    }));
                }

                // Apply max_price filter on top if set
                if (!empty($filters['max_price'])) {
                    $maxPrice = (float) $filters['max_price'];
                    $filteredTrips = array_values(array_filter(
                        empty($filteredTrips) ? $allTrips : $filteredTrips,
                        fn($t) => (float)$t->getBasePrice() <= $maxPrice
                    ));
                }

                // Last resort: if still empty, return empty (not all trips)
                if (empty($filteredTrips) && empty($filters['max_price'])) {
                    // No match at all — return empty result rather than all trips
                    $filteredTrips = [];
                }

                return new JsonResponse([
                    'query'                  => $userQuery,
                    'search_method'          => 'llm_parsing',
                    'ai_analysis'            => $filters,
                    'trips'                  => array_map(fn($t) => $this->formatTrip($t), array_values($filteredTrips)),
                    'total_found'            => count($filteredTrips),
                    'explanation'            => $this->recommendationService->generateSearchExplanation($filters),
                    'available_destinations' => $this->getAvailableDestinations(),
                    'available_categories'   => $this->getAvailableCategories(),
                    'generated_at'           => (new \DateTime())->format('Y-m-d H:i:s'),
                ]);

            } catch (\Exception $e) {}
        }

        // 3. Keyword fallback
        return $this->fallbackSearch($userQuery, new \Exception('All AI methods unavailable'));
    }

    private function fallbackSearch(string $query, \Exception $e): JsonResponse
    {
        $allTrips = $this->em->getRepository(\App\Entity\Trip::class)->findActiveTrips();
        $queryLower = strtolower($query);
        $minPrice = null;
        $maxPrice = null;
        if (preg_match('/between\s+(\d+)\s+and\s+(\d+)/i', $query, $matches)) {
            $minPrice = (float)$matches[1];
            $maxPrice = (float)$matches[2];
        }
        $filtered = array_filter($allTrips, function ($trip) use ($queryLower, $minPrice, $maxPrice) {
            $firstDest   = $this->getFirstDestination($trip);
            $title       = strtolower($trip->getTitle() ?? '');
            $description = strtolower($trip->getShortDescription() ?? '');
            $destination = strtolower($firstDest?->getName() ?? '');
            $country     = strtolower($firstDest?->getCountry() ?? '');
            $price       = (float)$trip->getBasePrice();
            if ($minPrice !== null && $price < $minPrice) return false;
            if ($maxPrice !== null && $price > $maxPrice) return false;
            foreach (['tunisia','tunisie','tunis','djerba','douz','tabarka','sahara','carthage','kairouan','tozeur','algeria','algerie','alger','oran','constantine'] as $kw) {
                if (strpos($queryLower, $kw) !== false && (strpos($destination, $kw) !== false || strpos($country, $kw) !== false)) return true;
            }
            foreach (explode(' ', trim($queryLower)) as $word) {
                $word = trim($word, '.,!?;:');
                if (strlen($word) < 3) continue;
                if (strpos($title, $word) !== false || strpos($description, $word) !== false || strpos($destination, $word) !== false) return true;
            }
            return false;
        });
        if (empty($filtered)) $filtered = $allTrips;
        return new JsonResponse([
            'query' => $query, 'search_method' => 'keyword_fallback',
            'trips' => array_map(fn($t) => $this->formatTrip($t), array_values($filtered)),
            'total_found' => count($filtered),
            'explanation' => 'Basic keyword search (AI unavailable)',
            'ai_warning' => 'AI search temporarily unavailable',
            'available_destinations' => $this->getAvailableDestinations(),
            'available_categories' => $this->getAvailableCategories(),
        ]);
    }

    private function getAvailableDestinations(): array
    {
        return array_map(fn($d) => ['id'=>$d->getId(),'name'=>$d->getName(),'country'=>$d->getCountry()??'','region'=>$d->getRegion()??''],
            $this->em->getRepository(\App\Entity\Destination::class)->findAll());
    }

    private function getAvailableCategories(): array
    {
        return array_map(fn($c) => ['id'=>$c->getId(),'name'=>$c->getName(),'description'=>$c->getDescription()??''],
            $this->em->getRepository(\App\Entity\Category::class)->findAll());
    }
}