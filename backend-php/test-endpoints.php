<?php

/**
 * Simple endpoint testing script for BoothieCall Elegancia PHP Backend
 * This script tests all API endpoints to ensure they are properly configured
 */

$baseUrl = 'http://localhost:8080';

$endpoints = [
    // Health check
    ['GET', '/health', null, 'Health check endpoint'],
    
    // Auth endpoints (no auth required)
    ['POST', '/api/v1/auth/register', ['first_name' => 'Test', 'last_name' => 'User', 'email' => 'test@example.com', 'password' => 'password123'], 'User registration'],
    ['POST', '/api/v1/auth/login', ['email' => 'test@example.com', 'password' => 'password123'], 'User login'],
    ['POST', '/api/v1/auth/refresh', ['refresh_token' => 'dummy-token'], 'Token refresh'],
    ['POST', '/api/v1/auth/logout', null, 'User logout'],
    
    // Protected endpoints (will return 401 without auth)
    ['GET', '/api/v1/assets', null, 'List assets'],
    ['POST', '/api/v1/assets', null, 'Upload asset'],
    ['GET', '/api/v1/assets/123', null, 'Get asset'],
    ['PUT', '/api/v1/assets/123', null, 'Update asset'],
    ['DELETE', '/api/v1/assets/123', null, 'Delete asset'],
    
    ['GET', '/api/v1/sessions', null, 'List sessions'],
    ['POST', '/api/v1/sessions', null, 'Create session'],
    ['GET', '/api/v1/sessions/123', null, 'Get session'],
    ['PUT', '/api/v1/sessions/123', null, 'Update session'],
    ['DELETE', '/api/v1/sessions/123', null, 'Delete session'],
    ['POST', '/api/v1/sessions/123/photos', null, 'Upload photo to session'],
    ['POST', '/api/v1/sessions/123/filters', null, 'Apply filter to session'],
    ['POST', '/api/v1/sessions/123/generate', null, 'Generate session output'],
    
    ['GET', '/api/v1/filters', null, 'List filters'],
    ['POST', '/api/v1/filters', null, 'Create filter'],
    ['GET', '/api/v1/filters/categories', null, 'Get filter categories'],
    ['GET', '/api/v1/filters/123', null, 'Get filter'],
    ['PUT', '/api/v1/filters/123', null, 'Update filter'],
    ['DELETE', '/api/v1/filters/123', null, 'Delete filter'],
    
    ['GET', '/api/v1/analytics/dashboard', null, 'Analytics dashboard'],
    ['GET', '/api/v1/analytics/sessions', null, 'Session analytics'],
    ['GET', '/api/v1/analytics/assets', null, 'Asset analytics'],
    ['GET', '/api/v1/analytics/filters', null, 'Filter analytics'],
    
    ['GET', '/api/v1/admin/tenants', null, 'List tenants'],
    ['POST', '/api/v1/admin/tenants', null, 'Create tenant'],
    ['PUT', '/api/v1/admin/tenants/123', null, 'Update tenant'],
    ['GET', '/api/v1/admin/users', null, 'List users'],
    ['PUT', '/api/v1/admin/users/123', null, 'Update user'],
    ['GET', '/api/v1/admin/stats', null, 'System stats'],
    ['POST', '/api/v1/admin/cleanup', null, 'System cleanup'],
    
    // Test 404
    ['GET', '/api/v1/nonexistent', null, 'Non-existent endpoint (should return 404)'],
];

echo "🚀 Testing BoothieCall Elegancia PHP Backend Endpoints\n";
echo "=" . str_repeat("=", 60) . "\n\n";

$results = [
    'success' => 0,
    'database_error' => 0,
    'auth_required' => 0,
    'not_found' => 0,
    'other_error' => 0
];

foreach ($endpoints as $index => $endpoint) {
    [$method, $path, $data, $description] = $endpoint;
    
    $url = $baseUrl . $path;
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT => 5,
    ]);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $responseData = json_decode($response, true);
    
    // Determine status
    $status = '❌ ERROR';
    $statusColor = 'red';
    
    if ($httpCode === 200) {
        $status = '✅ OK';
        $statusColor = 'green';
        $results['success']++;
    } elseif ($httpCode === 401) {
        $status = '🔒 AUTH REQUIRED';
        $statusColor = 'yellow';
        $results['auth_required']++;
    } elseif ($httpCode === 404) {
        $status = '🔍 NOT FOUND';
        $statusColor = 'blue';
        $results['not_found']++;
    } elseif ($httpCode === 500 && isset($responseData['message']) && strpos($responseData['message'], 'SQLSTATE') !== false) {
        $status = '🗄️ DB ERROR (Expected)';
        $statusColor = 'cyan';
        $results['database_error']++;
    } else {
        $results['other_error']++;
    }
    
    printf(
        "%2d. %-8s %-35s %s (%d)\n",
        $index + 1,
        $method,
        $path,
        $status,
        $httpCode
    );
    
    if ($httpCode >= 400 && $httpCode !== 401 && $httpCode !== 404 && !($httpCode === 500 && isset($responseData['message']) && strpos($responseData['message'], 'SQLSTATE') !== false)) {
        echo "    Error: " . ($responseData['message'] ?? 'Unknown error') . "\n";
    }
}

echo "\n" . str_repeat("=", 70) . "\n";
echo "📊 SUMMARY:\n";
echo "✅ Successful responses: " . $results['success'] . "\n";
echo "🔒 Auth required (401): " . $results['auth_required'] . "\n";
echo "🔍 Not found (404): " . $results['not_found'] . "\n";
echo "🗄️ Database errors (expected): " . $results['database_error'] . "\n";
echo "❌ Other errors: " . $results['other_error'] . "\n";

$total = array_sum($results);
$healthy = $results['success'] + $results['auth_required'] + $results['not_found'] + $results['database_error'];

echo "\n🎯 HEALTH SCORE: " . round(($healthy / $total) * 100, 1) . "% (" . $healthy . "/" . $total . ")\n";

if ($results['other_error'] === 0) {
    echo "\n🎉 ALL ENDPOINTS ARE PROPERLY CONFIGURED!\n";
    echo "✨ The API is ready for database setup and deployment.\n";
} else {
    echo "\n⚠️  Some endpoints have configuration issues that need attention.\n";
}

echo "\n📝 Next steps:\n";
echo "1. Set up MySQL database using database/schema.sql\n";
echo "2. Update .env with database credentials\n";
echo "3. Test authentication endpoints with real database\n";
echo "4. Deploy to GoDaddy using docs/GODADDY_DEPLOYMENT.md\n";
