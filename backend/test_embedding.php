<?php

require_once __DIR__ . '/vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;

// Load environment variables
$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/.env');

// Get the API key
$apiKey = $_ENV['HUGGINGFACE_API_KEY'] ?? '';

echo "=== EMBEDDING SERVICE TEST ===\n";
echo "API Key loaded: " . (!empty($apiKey) ? 'YES' : 'NO') . "\n";
echo "API Key length: " . strlen($apiKey) . "\n";
echo "API Key (first 10 chars): " . substr($apiKey, 0, 10) . "...\n\n";

if (empty($apiKey)) {
    echo "ERROR: HUGGINGFACE_API_KEY is not set in .env file\n";
    exit(1);
}

// Test the API call
echo "=== TESTING HUGGING FACE API ===\n";

$testText = "historical tour of tunisia";
echo "Test text: {$testText}\n\n";

$url = 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2';
echo "API URL: {$url}\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'inputs' => $testText,
    'options' => ['wait_for_model' => true]
]));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status Code: {$httpCode}\n";
echo "Response: {$response}\n\n";

if ($httpCode === 200) {
    $result = json_decode($response, true);
    if (is_array($result) && isset($result[0])) {
        echo "SUCCESS: Embedding generated with " . count($result[0]) . " dimensions\n";
        echo "First 5 values: " . implode(', ', array_slice($result[0], 0, 5)) . "\n";
    } else {
        echo "ERROR: Unexpected response format\n";
        print_r($result);
    }
} else {
    echo "ERROR: API call failed with status {$httpCode}\n";
    echo "Response: {$response}\n";
}

echo "\n=== TEST COMPLETE ===\n";
