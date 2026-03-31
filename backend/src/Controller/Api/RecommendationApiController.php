<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\Trip;
use App\Service\LlmService;
use App\Service\RecommendationService;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/recommendations')]
class RecommendationApiController extends AbstractController
{
    private EntityManagerInterface $em;
    private RecommendationService $recommendationService;
    private LlmService $llmService;
    private JwtService $jwtService;
    
    public function __construct(
        EntityManagerInterface $em,
        RecommendationService $recommendationService,
        LlmService $llmService,
        JwtService $jwtService
    ) {
        $this->em = $em;
        $this->recommendationService = $recommendationService;
        $this->llmService = $llmService;
        $this->jwtService = $jwtService;
    }
    
    /**
     * Get current authenticated user from token
     */
    private function getAuthenticatedUser(Request $request): ?User
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
    
    /**
     * GET /api/recommendations/personalized
     * Get personalized trip recommendations for authenticated user
     */
    #[Route('/personalized', name: 'api_recommendations_personalized', methods: ['GET'])]
    public function getPersonalizedRecommendations(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        // If not authenticated, return trending instead
        if (!$user) {
            return $this->json([
                'error' => 'Authentication required for personalized recommendations',
                'recommendations' => []
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        $limit = (int) $request->query->get('limit', 10);
        
        try {
            $recommendations = $this->recommendationService->getPersonalizedRecommendations($user, $limit);
            
            // Track this as a recommendation request
            $this->recommendationService->trackUserPreference(
                $user->getId(),
                'viewed',
                ['type' => 'personalized', 'count' => count($recommendations)]
            );
            
            return $this->json([
                'recommendations' => $recommendations,
                'user_preferences' => $this->recommendationService->getUserPreferences($user),
                'generated_at' => (new \DateTime())->format('Y-m-d H:i:s')
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to generate recommendations: ' . $e->getMessage(),
                'recommendations' => []
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * GET /api/recommendations/similar/{tripId}
     * Get trips similar to a given trip
     */
    #[Route('/similar/{tripId}', name: 'api_recommendations_similar', methods: ['GET'])]
    public function getSimilarTrips(Request $request, int $tripId): JsonResponse
    {
        $trip = $this->em->getRepository(Trip::class)->find($tripId);
        
        if (!$trip) {
            return $this->json([
                'error' => 'Trip not found'
            ], Response::HTTP_NOT_FOUND);
        }
        
        $limit = (int) $request->query->get('limit', 5);
        
        try {
            $similarTrips = $this->recommendationService->getSimilarTrips($trip, $limit);
            
            return $this->json([
                'reference_trip' => [
                    'id' => $trip->getId(),
                    'title' => $trip->getTitle()
                ],
                'similar_trips' => $similarTrips,
                'generated_at' => (new \DateTime())->format('Y-m-d H:i:s')
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to find similar trips: ' . $e->getMessage(),
                'similar_trips' => []
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * GET /api/recommendations/trending
     * Get trending trips based on recent bookings
     */
    #[Route('/trending', name: 'api_recommendations_trending', methods: ['GET'])]
    public function getTrendingTrips(Request $request): JsonResponse
    {
        $limit = (int) $request->query->get('limit', 10);
        
        try {
            $trendingTrips = $this->recommendationService->getTrendingTrips($limit);
            error_log('[RecommendationApiController] getTrendingTrips result: ' . count($trendingTrips));
            
            return $this->json([
                'trending' => $trendingTrips,
                'generated_at' => (new \DateTime())->format('Y-m-d H:i:s')
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to get trending trips: ' . $e->getMessage(),
                'trending' => []
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * POST /api/recommendations/feedback
     * Submit feedback on recommendations to improve future results
     */
    #[Route('/feedback', name: 'api_recommendations_feedback', methods: ['POST'])]
    public function submitFeedback(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return $this->json([
                'error' => 'Authentication required'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['trip_id']) || !isset($data['feedback'])) {
            return $this->json([
                'error' => 'trip_id and feedback are required'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        // Valid feedback types
        $validFeedback = ['like', 'dislike', 'booked', 'hidden'];
        if (!in_array($data['feedback'], $validFeedback)) {
            return $this->json([
                'error' => 'Invalid feedback type. Use: ' . implode(', ', $validFeedback)
            ], Response::HTTP_BAD_REQUEST);
        }
        
        try {
            // Track the feedback
            $this->recommendationService->trackUserPreference(
                $user->getId(),
                $data['feedback'],
                [
                    'trip_id' => $data['trip_id'],
                    'timestamp' => (new \DateTime())->format('Y-m-d H:i:s')
                ]
            );
            
            return $this->json([
                'message' => 'Feedback recorded successfully',
                'thank_you' => 'Thank you for helping us improve our recommendations!'
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to record feedback: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * POST /api/recommendations/search-based
     * Get recommendations based on search query (for non-authenticated users)
     */
    #[Route('/search-based', name: 'api_recommendations_search', methods: ['POST'])]
    public function getSearchBasedRecommendations(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $query = $data['query'] ?? '';
        
        if (empty($query)) {
            return $this->json([
                'error' => 'Search query is required'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        // Get user if authenticated
        $user = $this->getAuthenticatedUser($request);
        
        try {
            // Use LLM to parse the query
            $filters = $this->llmService->parseSearchQuery($query);
            
            // Track search if user is authenticated
            if ($user) {
                $this->recommendationService->trackSearch($user->getId(), $query, $filters);
            }
            
            // Build query based on filters using shared service
            $tripRepository = $this->em->getRepository(Trip::class);
            $trips = $tripRepository->findActiveTrips();
            
            // Apply filters using shared service
            $filteredTrips = $this->recommendationService->filterTripsByFilters($trips, $filters);
            
            // Score the filtered trips
            $scoredResults = [];
            foreach ($filteredTrips as $trip) {
                $score = 0;
                $reasons = [];
                
                if ($filters['destination']) {
                    $score += 40;
                    $reasons[] = 'matches destination';
                }
                if ($filters['max_price']) {
                    $score += 30;
                    $reasons[] = 'within budget';
                }
                if ($filters['category']) {
                    $score += 35;
                    $reasons[] = 'matches category';
                }
                if ($filters['duration']) {
                    $score += 20;
                    $reasons[] = 'right duration';
                }
                
                $scoredResults[] = [
                    'trip' => $trip,
                    'score' => $score,
                    'reason' => implode(', ', $reasons)
                ];
            }
            
            // Sort by score
            usort($scoredResults, fn($a, $b) => $b['score'] - $a['score']);
            
            // Format output
            $results = array_map(function($item) {
                $trip = $item['trip'];
                return [
                    'trip' => [
                        'id' => $trip->getId(),
                        'title' => $trip->getTitle(),
                        'short_description' => $trip->getShortDescription(),
                        'base_price' => $trip->getBasePrice(),
                        'currency' => $trip->getCurrency(),
                        'duration_days' => $trip->getDurationDays(),
                        'cover_image' => $trip->getCoverImage()?->getUrl() ?? '',
                        'destination' => $trip->getDestinations()->first()?->getName() ?? '',
                        'categories' => array_map(fn($c) => $c->getName(), $trip->getCategories()->toArray())
                    ],
                    'score' => $item['score'],
                    'reason' => $item['reason']
                ];
            }, array_slice($scoredResults, 0, 10));
            
            return $this->json([
                'query' => $query,
                'ai_analysis' => $filters,
                'recommendations' => $results,
                'total_found' => count($results),
                'generated_at' => (new \DateTime())->format('Y-m-d H:i:s')
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Search failed: ' . $e->getMessage(),
                'recommendations' => []
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * GET /api/recommendations/status
     * Check LLM service status
     */
    #[Route('/status', name: 'api_recommendations_status', methods: ['GET'])]
    public function getStatus(): JsonResponse
    {
        $llmConfigured = $this->llmService->isConfigured();
        
        return $this->json([
            'llm_service' => [
                'configured' => $llmConfigured,
                'model' => $llmConfigured ? 'gpt-4o' : 'not configured',
                'message' => $llmConfigured 
                    ? 'AI recommendations are active'
                    : 'Set OPENAI_API_KEY in .env to enable AI features'
            ],
            'features' => [
                'personalized_recommendations' => true,
                'similar_trips' => true,
                'trending_trips' => true,
                'search_based_recommendations' => true,
                'feedback_tracking' => true
            ]
        ]);
    }
}
