<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use App\Entity\Trip;
use App\Entity\Booking;
use App\Entity\AIData;
use App\Repository\TripRepository;
use App\Repository\AIDataRepository;

class RecommendationService
{
    private EntityManagerInterface $em;
    private LlmService $llmService;
    private EmbeddingService $embeddingService;
    
    public function __construct(
        EntityManagerInterface $em,
        LlmService $llmService,
        EmbeddingService $embeddingService
    ) {
        $this->em = $em;
        $this->llmService = $llmService;
        $this->embeddingService = $embeddingService;
    }
    
    /**
     * Get personalized recommendations for a user
     */
    public function getPersonalizedRecommendations(User $user, int $limit = 10): array
    {
        // Get user's preferences
        $preferences = $this->getUserPreferences($user);
        
        // Get all active trips
        $trips = $this->em->getRepository(Trip::class)->findBy([
            'isActive' => true,
            'status' => 'published'
        ]);
        
        if (empty($trips)) {
            return [];
        }
        
        // Check if we have cached recommendations
        $cached = $this->getCachedRecommendations($user->getId(), 'personalized');
        if ($cached && count($cached) > 0) {
            return $cached;
        }
        
        // Try embedding-based recommendations first (no rate limits)
        if ($this->embeddingService->isConfigured()) {
            try {
                $result = $this->getEmbeddingBasedPersonalizedRecommendations($user, $trips, $limit);
                if (!empty($result)) {
                    $this->cacheRecommendations($user->getId(), 'personalized', $result);
                    return $result;
                }
            } catch (\Exception $e) {
                error_log('[RecommendationService] Embedding personalized error: ' . $e->getMessage());
            }
        }
        
        // Fallback to LLM if embeddings not available
        if ($this->llmService->isConfigured()) {
            try {
                $aiRecommendations = $this->llmService->generateRecommendations($preferences, $trips);
                
                if (!isset($aiRecommendations['error'])) {
                    // Map AI recommendations to actual trips
                    $result = $this->mapRecommendationsToTrips($aiRecommendations, $trips, $limit);
                    
                    // Cache the results
                    $this->cacheRecommendations($user->getId(), 'personalized', $result);
                    
                    return $result;
                }
            } catch (\Exception $e) {
                error_log('[RecommendationService] LLM error: ' . $e->getMessage());
            }
        }
        
        // Fallback to rule-based recommendations
        return $this->getRuleBasedRecommendations($user, $trips, $limit);
    }
    
    /**
     * Get similar trips to a given trip
     */
    public function getSimilarTrips(Trip $trip, int $limit = 5): array
    {
        $allTrips = $this->em->getRepository(Trip::class)->findBy([
            'isActive' => true,
            'status' => 'published'
        ]);
        
        // Check cache first
        $cached = $this->getCachedRecommendations($trip->getId(), 'similar');
        if ($cached && count($cached) > 0) {
            return $cached;
        }
        
        // Try embedding-based similarity first (no rate limits)
        if ($this->embeddingService->isConfigured()) {
            try {
                $result = $this->getEmbeddingBasedSimilarTrips($trip, $allTrips, $limit);
                if (!empty($result)) {
                    $this->cacheRecommendations($trip->getId(), 'similar', $result);
                    return $result;
                }
            } catch (\Exception $e) {
                error_log('[RecommendationService] Embedding similar error: ' . $e->getMessage());
            }
        }
        
        // Fallback to LLM if embeddings not available
        if ($this->llmService->isConfigured()) {
            try {
                $aiSimilar = $this->llmService->findSimilarTrips($trip, $allTrips);
                
                if (!isset($aiSimilar['error'])) {
                    $result = $this->mapRecommendationsToTrips($aiSimilar, $allTrips, $limit);
                    $this->cacheRecommendations($trip->getId(), 'similar', $result);
                    return $result;
                }
            } catch (\Exception $e) {
                error_log('[RecommendationService] LLM similar error: ' . $e->getMessage());
            }
        }
        
        // Fallback to rule-based similarity
        return $this->getRuleBasedSimilarTrips($trip, $allTrips, $limit);
    }
    
    /**
     * Get trending trips based on recent bookings
     */
    public function getTrendingTrips(int $limit = 10): array
    {
        error_log('[RecommendationService] getTrendingTrips called');
        
        try {
            // Get trips with most confirmed bookings in last 30 days
            $recentDate = new \DateTime('-30 days');
            
            $bookings = $this->em->getRepository(Booking::class)->createQueryBuilder('b')
                ->where('b.createdAt >= :date')
                ->andWhere('b.status IN (:statuses)')
                ->setParameter('date', $recentDate)
                ->setParameter('statuses', ['CONFIRMED', 'COMPLETED'])
                ->getQuery()
                ->getResult();
            
            // Count bookings per trip
            $tripCounts = [];
            foreach ($bookings as $booking) {
                $trip = $booking->getTrip();
                if ($trip && $trip->isActive() && $trip->getStatus() === 'published') {
                    $tripId = $trip->getId();
                    if (!isset($tripCounts[$tripId])) {
                        $tripCounts[$tripId] = ['trip' => $trip, 'count' => 0];
                    }
                    $tripCounts[$tripId]['count']++;
                }
            }
            
            // Sort by count and take top results
            usort($tripCounts, fn($a, $b) => $b['count'] - $a['count']);
            
            $result = [];
            foreach (array_slice($tripCounts, 0, $limit) as $item) {
                $result[] = $this->formatTripRecommendation($item['trip'], $item['count'] * 10, 'Popular based on recent bookings');
            }
            
            return $result;
            
        } catch (\Exception $e) {
            error_log('[RecommendationService] Error getting trending trips: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get user's explicit preferences
     */
    public function getUserPreferences(User $user): array
    {
        return [
            'interests' => $user->getInterests() ?? [],
            'preferred_language' => $user->getPreferredLanguage(),
            'preferred_currency' => $user->getPreferredCurrency(),
            'country' => $user->getCountry(),
            'past_bookings' => $this->getPastBookingSummary($user),
            'status_organizer' => $user->getStatusOrganizer()
        ];
    }
    
    /**
     * Update user preference based on behavior
     */
    public function trackUserPreference(int $userId, string $type, array $data): void
    {
        $aiData = new AIData();
        $aiData->setUserId($userId);
        $aiData->setDataType('preference_' . $type);
        $aiData->setData($data);
        $aiData->setScore(1.0);
        
        $this->em->persist($aiData);
        $this->em->flush();
    }
    
    /**
     * Track search query for future recommendations
     */
    public function trackSearch(int $userId, string $query, array $filters): void
    {
        $aiData = new AIData();
        $aiData->setUserId($userId);
        $aiData->setDataType('search_history');
        $aiData->setData([
            'query' => $query,
            'filters' => $filters,
            'timestamp' => (new \DateTime())->format('Y-m-d H:i:s')
        ]);
        
        $this->em->persist($aiData);
        $this->em->flush();
    }
    
    /**
     * Get cached recommendations
     */
    private function getCachedRecommendations(int $userId, string $type): ?array
    {
        $aiData = $this->em->getRepository(AIData::class)->findOneBy([
            'userId' => $userId,
            'dataType' => 'recommendation_' . $type,
            'isActive' => true
        ]);
        
        if (!$aiData || !$aiData->getData()) {
            return null;
        }
        
        $data = $aiData->getData();
        
        // Check expiration (24 hours)
        if (isset($data['expires_at'])) {
            $expiresAt = new \DateTime($data['expires_at']);
            if (new \DateTime() > $expiresAt) {
                return null;
            }
        }
        
        return $data['recommendations'] ?? null;
    }
    
    /**
     * Cache recommendations
     */
    private function cacheRecommendations(int $userId, string $type, array $recommendations): void
    {
        // Check if there's existing data
        $aiData = $this->em->getRepository(AIData::class)->findOneBy([
            'userId' => $userId,
            'dataType' => 'recommendation_' . $type
        ]);
        
        if (!$aiData) {
            $aiData = new AIData();
            $aiData->setUserId($userId);
            $aiData->setDataType('recommendation_' . $type);
        }
        
        $aiData->setData([
            'recommendations' => $recommendations,
            'generated_at' => (new \DateTime())->format('Y-m-d H:i:s'),
            'expires_at' => (new \DateTime())->modify('+24 hours')->format('Y-m-d H:i:s')
        ]);
        $aiData->setIsActive(true);
        
        $this->em->persist($aiData);
        $this->em->flush();
    }
    
    /**
     * Map AI recommendations to actual Trip entities
     */
    private function mapRecommendationsToTrips(array $aiRecommendations, array $trips, int $limit): array
    {
        $result = [];
        $tripMap = [];
        
        // Create ID-based map
        foreach ($trips as $trip) {
            $tripMap[$trip->getId()] = $trip;
        }
        
        // Map AI results to trips
        $aiRecs = is_array($aiRecommendations) ? $aiRecommendations : [];
        
        foreach ($aiRecs as $rec) {
            if (isset($rec['trip_id']) && isset($tripMap[$rec['trip_id']])) {
                $trip = $tripMap[$rec['trip_id']];
                $result[] = $this->formatTripRecommendation(
                    $trip,
                    $rec['score'] ?? $rec['similarity_score'] ?? 50,
                    $rec['reason'] ?? $rec['common_features'] ?? 'AI recommended'
                );
            }
            
            if (count($result) >= $limit) {
                break;
            }
        }
        
        return $result;
    }
    
    /**
     * Format a trip for recommendation output
     */
    private function formatTripRecommendation(Trip $trip, float $score, string $reason): array
    {
        return [
            'trip' => [
                'id' => $trip->getId(),
                'title' => $trip->getTitle(),
                'short_description' => $trip->getShortDescription(),
                'base_price' => $trip->getBasePrice(),
                'currency' => $trip->getCurrency(),
                'duration_days' => $trip->getDurationDays(),
                'difficulty_level' => $trip->getDifficultyLevel(),
                'cover_image' => $trip->getCoverImage()?->getImageUrl(),
                'destination' => $trip->getDestinations()->first()?->getName() ?? '',
                'categories' => array_map(fn($c) => $c->getName(), $trip->getCategories()->toArray()),
                'destinations' => array_map(fn($d) => $d->getName(), $trip->getDestinations()->toArray())
            ],
            'score' => round($score, 1),
            'reason' => $reason
        ];
    }
    
    /**
     * Get summary of past bookings for a user
     */
    private function getPastBookingSummary(User $user): array
    {
        $bookings = $user->getBookings();
        
        $summary = [
            'total_bookings' => count($bookings),
            'total_spent' => 0,
            'destinations' => [],
            'categories' => [],
            'avg_price' => 0
        ];
        
        $prices = [];
        
        foreach ($bookings as $booking) {
            if ($booking->getStatus() === 'CONFIRMED' || $booking->getStatus() === 'COMPLETED') {
                $summary['total_spent'] += (float) $booking->getTotalPrice();
                $prices[] = (float) $booking->getTotalPrice();
                
                $trip = $booking->getTrip();
                if ($trip) {
                    foreach ($trip->getDestinations() as $dest) {
                        $summary['destinations'][] = $dest->getName();
                    }
                    foreach ($trip->getCategories() as $cat) {
                        $summary['categories'][] = $cat->getName();
                    }
                }
            }
        }
        
        $summary['destinations'] = array_count_values($summary['destinations']);
        $summary['categories'] = array_count_values($summary['categories']);
        $summary['avg_price'] = count($prices) > 0 ? array_sum($prices) / count($prices) : 0;
        
        return $summary;
    }
    
    /**
     * Fallback: Rule-based recommendations
     */
    private function getRuleBasedRecommendations(User $user, array $trips, int $limit): array
    {
        $preferences = $this->getUserPreferences($user);
        $result = [];
        
        // Score each trip based on user preferences
        foreach ($trips as $trip) {
            $score = 0;
            $reasons = [];
            
            // Check interests match categories
            $userInterests = $preferences['interests'] ?? [];
            $tripCategories = array_map(fn($c) => strtolower($c->getName()), $trip->getCategories()->toArray());
            
            foreach ($userInterests as $interest) {
                if (in_array(strtolower($interest), $tripCategories)) {
                    $score += 30;
                    $reasons[] = "Matches your interest in {$interest}";
                }
            }
            
            // Check past booking destinations
            $pastDests = array_keys($preferences['past_bookings']['destinations'] ?? []);
            $tripDests = array_map(fn($d) => strtolower($d->getName()), $trip->getDestinations()->toArray());
            
            foreach ($pastDests as $dest) {
                if (in_array($dest, $tripDests)) {
                    $score += 20;
                    $reasons[] = "Similar to your past trips to {$dest}";
                }
            }
            
            // Boost popular trips
            $score += 10;
            
            if ($score > 0) {
                $result[] = $this->formatTripRecommendation(
                    $trip,
                    $score,
                    implode('. ', $reasons) ?: 'Recommended for you'
                );
            }
        }
        
        // Sort by score and limit
        usort($result, fn($a, $b) => $b['score'] - $a['score']);
        
        return array_slice($result, 0, $limit);
    }
    
    /**
     * Fallback: Rule-based similar trips
     */
    private function getRuleBasedSimilarTrips(Trip $trip, array $allTrips, int $limit): array
    {
        $result = [];
        
        $tripCategories = array_map(fn($c) => $c->getId(), $trip->getCategories()->toArray());
        $tripDests = array_map(fn($d) => $d->getId(), $trip->getDestinations()->toArray());
        $tripPrice = (float) $trip->getBasePrice();
        
        foreach ($allTrips as $otherTrip) {
            if ($otherTrip->getId() === $trip->getId()) {
                continue;
            }
            
            $score = 0;
            $commonFeatures = [];
            
            // Category match
            $otherCategories = array_map(fn($c) => $c->getId(), $otherTrip->getCategories()->toArray());
            $categoryMatch = array_intersect($tripCategories, $otherCategories);
            if (count($categoryMatch) > 0) {
                $score += 30 * count($categoryMatch);
                $commonFeatures[] = 'similar categories';
            }
            
            // Destination match
            $otherDests = array_map(fn($d) => $d->getId(), $otherTrip->getDestinations()->toArray());
            $destMatch = array_intersect($tripDests, $otherDests);
            if (count($destMatch) > 0) {
                $score += 25 * count($destMatch);
                $commonFeatures[] = 'similar destinations';
            }
            
            // Price range match (within 30%)
            $otherPrice = (float) $otherTrip->getBasePrice();
            if ($otherPrice > 0 && $tripPrice > 0) {
                $priceDiff = abs($otherPrice - $tripPrice) / $tripPrice;
                if ($priceDiff < 0.3) {
                    $score += 15;
                    $commonFeatures[] = 'similar price';
                }
            }
            
            // Duration match
            if ($otherTrip->getDurationDays() === $trip->getDurationDays()) {
                $score += 10;
                $commonFeatures[] = 'same duration';
            }
            
            if ($score > 0) {
                $result[] = $this->formatTripRecommendation(
                    $otherTrip,
                    min($score, 100),
                    implode(', ', $commonFeatures) ?: 'Similar trip'
                );
            }
        }
        
        usort($result, fn($a, $b) => $b['score'] - $a['score']);
        
        return array_slice($result, 0, $limit);
    }

    /**
     * Get similar trips using embeddings (no rate limits)
     */
    private function getEmbeddingBasedSimilarTrips(Trip $trip, array $allTrips, int $limit): array
    {
        // Generate embedding for the source trip
        $tripData = [
            'title' => $trip->getTitle(),
            'short_description' => $trip->getShortDescription(),
            'destination' => $trip->getDestinations()->first()?->getName() ?? '',
            'categories' => array_map(fn($c) => $c->getName(), $trip->getCategories()->toArray()),
            'difficulty_level' => $trip->getDifficultyLevel()
        ];
        
        $sourceEmbedding = $this->embeddingService->generateTripEmbedding($tripData);
        if (!$sourceEmbedding) {
            return [];
        }
        
        // Generate embeddings for all other trips
        $tripEmbeddings = [];
        foreach ($allTrips as $otherTrip) {
            if ($otherTrip->getId() === $trip->getId()) {
                continue;
            }
            
            $otherTripData = [
                'title' => $otherTrip->getTitle(),
                'short_description' => $otherTrip->getShortDescription(),
                'destination' => $otherTrip->getDestinations()->first()?->getName() ?? '',
                'categories' => array_map(fn($c) => $c->getName(), $otherTrip->getCategories()->toArray()),
                'difficulty_level' => $otherTrip->getDifficultyLevel()
            ];
            
            $embedding = $this->embeddingService->generateTripEmbedding($otherTripData);
            if ($embedding) {
                $tripEmbeddings[$otherTrip->getId()] = $embedding;
            }
        }
        
        if (empty($tripEmbeddings)) {
            return [];
        }
        
        // Find most similar trips
        $similarities = $this->embeddingService->findMostSimilar($sourceEmbedding, $tripEmbeddings, $limit);
        
        // Build result
        $result = [];
        $tripMap = [];
        foreach ($allTrips as $t) {
            $tripMap[$t->getId()] = $t;
        }
        
        foreach ($similarities as $tripId => $similarity) {
            if (isset($tripMap[$tripId])) {
                $result[] = $this->formatTripRecommendation(
                    $tripMap[$tripId],
                    $similarity * 100, // Convert to percentage
                    'Semantically similar'
                );
            }
        }
        
        return $result;
    }

    /**
     * Get personalized recommendations using embeddings (no rate limits)
     */
    private function getEmbeddingBasedPersonalizedRecommendations(User $user, array $trips, int $limit): array
    {
        // Get user preferences
        $preferences = $this->getUserPreferences($user);
        
        // Generate embedding for user preferences
        $userEmbedding = $this->embeddingService->generateUserPreferenceEmbedding($preferences);
        if (!$userEmbedding) {
            return [];
        }
        
        // Generate embeddings for all trips
        $tripEmbeddings = [];
        foreach ($trips as $trip) {
            $tripData = [
                'title' => $trip->getTitle(),
                'short_description' => $trip->getShortDescription(),
                'destination' => $trip->getDestinations()->first()?->getName() ?? '',
                'categories' => array_map(fn($c) => $c->getName(), $trip->getCategories()->toArray()),
                'difficulty_level' => $trip->getDifficultyLevel()
            ];
            
            $embedding = $this->embeddingService->generateTripEmbedding($tripData);
            if ($embedding) {
                $tripEmbeddings[$trip->getId()] = $embedding;
            }
        }
        
        if (empty($tripEmbeddings)) {
            return [];
        }
        
        // Find most similar trips to user preferences
        $similarities = $this->embeddingService->findMostSimilar($userEmbedding, $tripEmbeddings, $limit);
        
        // Build result
        $result = [];
        $tripMap = [];
        foreach ($trips as $t) {
            $tripMap[$t->getId()] = $t;
        }
        
        foreach ($similarities as $tripId => $similarity) {
            if (isset($tripMap[$tripId])) {
                $result[] = $this->formatTripRecommendation(
                    $tripMap[$tripId],
                    $similarity * 100, // Convert to percentage
                    'Matches your preferences'
                );
            }
        }
        
        return $result;
    }

    /**
     * Semantic search using embeddings
     */
    public function semanticSearch(string $query, int $limit = 10): array
    {
        error_log('[RecommendationService] ===== SEMANTIC SEARCH START =====');
        error_log('[RecommendationService] semanticSearch called with query: ' . $query);
        error_log('[RecommendationService] Limit: ' . $limit);
        
        if (!$this->embeddingService->isConfigured()) {
            error_log('[RecommendationService] Embedding service not configured - returning empty');
            return [];
        }
        
        try {
            // Generate embedding for the search query
            error_log('[RecommendationService] Generating embedding for query...');
            $queryEmbedding = $this->embeddingService->generateEmbedding($query);
            if (!$queryEmbedding) {
                error_log('[RecommendationService] Failed to generate query embedding - returning empty');
                return [];
            }
            error_log('[RecommendationService] Query embedding generated with ' . count($queryEmbedding) . ' dimensions');
            
            // Get all active trips
            $trips = $this->em->getRepository(Trip::class)->findBy([
                'isActive' => true,
                'status' => 'published'
            ]);
            
            error_log('[RecommendationService] Found ' . count($trips) . ' active trips');
            
            if (empty($trips)) {
                return [];
            }
            
            // Generate embeddings for all trips
            $tripEmbeddings = [];
            foreach ($trips as $trip) {
                $tripData = [
                    'title' => $trip->getTitle(),
                    'short_description' => $trip->getShortDescription(),
                    'destination' => $trip->getDestinations()->first()?->getName() ?? '',
                    'categories' => array_map(fn($c) => $c->getName(), $trip->getCategories()->toArray()),
                    'difficulty_level' => $trip->getDifficultyLevel()
                ];
                
                $embedding = $this->embeddingService->generateTripEmbedding($tripData);
                if ($embedding) {
                    $tripEmbeddings[$trip->getId()] = $embedding;
                }
            }
            
            error_log('[RecommendationService] Generated embeddings for ' . count($tripEmbeddings) . ' trips');
            
            if (empty($tripEmbeddings)) {
                error_log('[RecommendationService] No trip embeddings generated');
                return [];
            }
            
            // Find most similar trips
            error_log('[RecommendationService] Finding most similar trips...');
            $similarities = $this->embeddingService->findMostSimilar($queryEmbedding, $tripEmbeddings, $limit);
            
            error_log('[RecommendationService] Found ' . count($similarities) . ' similar trips');
            
            // Build result
            $result = [];
            $tripMap = [];
            foreach ($trips as $t) {
                $tripMap[$t->getId()] = $t;
            }
            
            foreach ($similarities as $tripId => $similarity) {
                if (isset($tripMap[$tripId])) {
                    $result[] = $this->formatTripRecommendation(
                        $tripMap[$tripId],
                        $similarity * 100, // Convert to percentage
                        'Semantic match for: ' . $query
                    );
                }
            }
            
            error_log('[RecommendationService] Returning ' . count($result) . ' results');
            return $result;
            
        } catch (\Exception $e) {
            error_log('[RecommendationService] Semantic search error: ' . $e->getMessage());
            error_log('[RecommendationService] Stack trace: ' . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Filter trips based on AI-parsed filters (shared method)
     * Used by both SearchAiController and RecommendationApiController
     */
    public function filterTripsByFilters(array $trips, array $filters): array
    {
        $scoredTrips = [];
        
        foreach ($trips as $trip) {
            $score = 0;
            $reasons = [];
            
            // Match destination
                    // Match destination - check name, country AND region
            if (!empty($filters['destination'])) {
                $searchDest = strtolower($filters['destination']);
                $destMatched = false;
                
                foreach ($trip->getDestinations() as $dest) {
                    $destNameLower    = strtolower($dest->getName() ?? '');
                    $destCountryLower = strtolower($dest->getCountry() ?? '');
                    $destRegionLower  = strtolower($dest->getRegion() ?? '');
                    
                    if (strpos($destNameLower, $searchDest) !== false
                        || strpos($searchDest, $destNameLower) !== false
                        || strpos($destCountryLower, $searchDest) !== false
                        || strpos($searchDest, $destCountryLower) !== false
                        || strpos($destRegionLower, $searchDest) !== false
                    ) {
                        $score += 40;
                        $reasons[] = 'destination match';
                        $destMatched = true;
                        break;
                    }
                }
                
                // If no filter for destination but has max_price only, still include trips
            }
                        // Match max price
            if (!empty($filters['max_price'])) {
                $price = (float) $trip->getBasePrice();
                if ($price <= (float) $filters['max_price']) {
                    $score += 30;
                    $reasons[] = 'within budget';
                }
            }
            
            // Match category
            if (!empty($filters['category'])) {
                foreach ($trip->getCategories() as $cat) {
                    if (stripos($cat->getName(), $filters['category']) !== false) {
                        $score += 35;
                        $reasons[] = 'category match';
                        break;
                    }
                }
            }
            
            // Match duration
            if (!empty($filters['duration'])) {
                $duration = $trip->getDurationDays();
                if ($duration && abs($duration - $filters['duration']) <= 2) {
                    $score += 20;
                    $reasons[] = 'right duration';
                }
            }
            
            // Match difficulty
            if (!empty($filters['difficulty'])) {
                if (strtolower($trip->getDifficultyLevel()) === strtolower($filters['difficulty'])) {
                    $score += 15;
                    $reasons[] = 'difficulty match';
                }
            }
            
            if ($score > 0) {
                $scoredTrips[] = [
                    'trip' => $trip,
                    'score' => $score,
                    'reasons' => $reasons
                ];
            }
        }
        
        // Sort by score descending
        usort($scoredTrips, fn($a, $b) => $b['score'] - $a['score']);
        
        return array_map(fn($item) => $item['trip'], array_slice($scoredTrips, 0, 20));
    }

    /**
     * Generate human-readable search explanation from filters
     */
    public function generateSearchExplanation(array $filters): string
    {
        $parts = [];
        
        if (!empty($filters['destination'])) {
            $parts[] = "trips to {$filters['destination']}";
        }
        
        if (!empty($filters['max_price'])) {
            $parts[] = "under {$filters['max_price']} TND";
        }
        
        if (!empty($filters['category'])) {
            $parts[] = "{$filters['category']} trips";
        }
        
        if (!empty($filters['duration'])) {
            $parts[] = "{$filters['duration']} days";
        }
        
        if (!empty($filters['difficulty'])) {
            $parts[] = "{$filters['difficulty']} difficulty";
        }
        
        if (empty($parts)) {
            return "Showing all available trips";
        }
        
        return "Found trips matching: " . implode(', ', $parts);
    }
}

