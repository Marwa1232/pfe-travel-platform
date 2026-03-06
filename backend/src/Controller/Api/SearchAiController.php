<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SearchAiController extends AbstractController
{
    private $client;

    public function __construct(HttpClientInterface $client)
    {
        $this->client = $client;
    }

    #[Route('/api/ai/search', name: 'api_ai_search', methods: ['POST'])]
    public function smartSearch(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $userQuery = $data['query'] ?? '';

        if (empty($userQuery)) {
            return new JsonResponse(['error' => 'Query is empty'], 400);
        }

        try {

            $response = $this->client->request('POST', 'https://api.openai.com/v1/chat/completions', [

                'headers' => [
                    'Authorization' => 'Bearer ' . $_ENV['OPENAI_API_KEY'],
                    'Content-Type' => 'application/json',
                ],

                'json' => [

                    'model' => 'gpt-3.5-turbo',

                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are a travel assistant. Extract destination, max_price and category from the user query and return ONLY JSON.'
                        ],
                        [
                            'role' => 'user',
                            'content' => $userQuery
                        ]
                    ],

                    'temperature' => 0.3
                ]
            ]);

            $result = $response->toArray();

            $aiContent = $result['choices'][0]['message']['content'];

            $cleanJson = preg_replace('/```json|```/', '', $aiContent);

            return new JsonResponse(json_decode($cleanJson, true));

        } catch (\Exception $e) {

            return new JsonResponse([
                'error' => 'OpenAI API error: ' . $e->getMessage()
            ], 500);

        }
    }
}