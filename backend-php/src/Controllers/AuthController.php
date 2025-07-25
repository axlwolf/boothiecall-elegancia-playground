<?php

declare(strict_types=1);

namespace BoothieCall\Api\Controllers;

use Firebase\JWT\JWT;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;

class AuthController
{
    private \PDO $db;
    private LoggerInterface $logger;
    private array $jwtSettings;
    private array $securitySettings;

    public function __construct(\PDO $db, LoggerInterface $logger, array $jwtSettings, array $securitySettings)
    {
        $this->db = $db;
        $this->logger = $logger;
        $this->jwtSettings = $jwtSettings;
        $this->securitySettings = $securitySettings;
    }

    public function login(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $data = $request->getParsedBody();
        
        if (empty($data['email']) || empty($data['password'])) {
            return $this->jsonResponse($response, [
                'error' => 'Missing email or password'
            ], 400);
        }

        try {
            // Find user by email
            $stmt = $this->db->prepare('
                SELECT u.*, t.name as tenant_name, t.domain as tenant_domain 
                FROM users u 
                JOIN tenants t ON u.tenant_id = t.id 
                WHERE u.email = ? AND u.is_active = 1 AND t.is_active = 1
            ');
            $stmt->execute([$data['email']]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($data['password'], $user['password'])) {
                $this->logger->warning('Failed login attempt', ['email' => $data['email']]);
                return $this->jsonResponse($response, [
                    'error' => 'Invalid credentials'
                ], 401);
            }

            // Update last login
            $stmt = $this->db->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?');
            $stmt->execute([$user['id']]);

            // Generate tokens
            $accessToken = $this->generateAccessToken($user);
            $refreshToken = $this->generateRefreshToken($user);

            // Store refresh token (in production, use Redis or database)
            // For now, we'll include it in response

            $this->logger->info('User logged in successfully', ['user_id' => $user['id']]);

            return $this->jsonResponse($response, [
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'username' => $user['username'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'role' => $user['role'],
                    'tenant' => [
                        'id' => $user['tenant_id'],
                        'name' => $user['tenant_name'],
                        'domain' => $user['tenant_domain']
                    ]
                ],
                'tokens' => [
                    'access_token' => $accessToken,
                    'refresh_token' => $refreshToken,
                    'expires_in' => $this->jwtSettings['expires_in']
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Login error', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function register(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $data = $request->getParsedBody();
        
        $required = ['email', 'password', 'first_name', 'last_name'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->jsonResponse($response, [
                    'error' => "Missing required field: {$field}"
                ], 400);
            }
        }

        try {
            // Check if user already exists
            $stmt = $this->db->prepare('SELECT id FROM users WHERE email = ?');
            $stmt->execute([$data['email']]);
            if ($stmt->fetch()) {
                return $this->jsonResponse($response, [
                    'error' => 'User already exists'
                ], 409);
            }

            // Get default tenant
            $stmt = $this->db->prepare('SELECT id FROM tenants WHERE is_active = 1 ORDER BY created_at LIMIT 1');
            $stmt->execute();
            $tenant = $stmt->fetch();
            
            if (!$tenant) {
                return $this->jsonResponse($response, [
                    'error' => 'No active tenant available'
                ], 500);
            }

            // Create user
            $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT, [
                'cost' => $this->securitySettings['bcrypt_cost']
            ]);

            $stmt = $this->db->prepare('
                INSERT INTO users (id, email, username, first_name, last_name, password, role, tenant_id, created_at, updated_at) 
                VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ');
            
            $stmt->execute([
                $data['email'],
                $data['username'] ?? null,
                $data['first_name'],
                $data['last_name'],
                $hashedPassword,
                $data['role'] ?? 'VIEWER',
                $tenant['id']
            ]);

            $this->logger->info('User registered successfully', ['email' => $data['email']]);

            return $this->jsonResponse($response, [
                'message' => 'User registered successfully',
                'user' => [
                    'email' => $data['email'],
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name']
                ]
            ], 201);

        } catch (\Exception $e) {
            $this->logger->error('Registration error', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function refresh(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $data = $request->getParsedBody();
        
        if (empty($data['refresh_token'])) {
            return $this->jsonResponse($response, [
                'error' => 'Missing refresh token'
            ], 400);
        }

        try {
            $decoded = JWT::decode($data['refresh_token'], new \Firebase\JWT\Key($this->jwtSettings['refresh_secret'], $this->jwtSettings['algorithm']));
            
            // Get user data
            $stmt = $this->db->prepare('
                SELECT u.*, t.name as tenant_name, t.domain as tenant_domain 
                FROM users u 
                JOIN tenants t ON u.tenant_id = t.id 
                WHERE u.id = ? AND u.is_active = 1 AND t.is_active = 1
            ');
            $stmt->execute([$decoded->user_id]);
            $user = $stmt->fetch();

            if (!$user) {
                return $this->jsonResponse($response, [
                    'error' => 'Invalid refresh token'
                ], 401);
            }

            // Generate new access token
            $accessToken = $this->generateAccessToken($user);

            return $this->jsonResponse($response, [
                'access_token' => $accessToken,
                'expires_in' => $this->jwtSettings['expires_in']
            ]);

        } catch (\Exception $e) {
            $this->logger->warning('Invalid refresh token', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Invalid refresh token'
            ], 401);
        }
    }

    public function logout(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        // In a real implementation, you would blacklist the token
        // For now, we'll just return success
        return $this->jsonResponse($response, [
            'message' => 'Logged out successfully'
        ]);
    }

    private function generateAccessToken(array $user): string
    {
        $payload = [
            'iss' => 'boothiecall-api',
            'aud' => 'boothiecall-frontend',
            'iat' => time(),
            'exp' => time() + $this->jwtSettings['expires_in'],
            'user_id' => $user['id'],
            'tenant_id' => $user['tenant_id'],
            'role' => $user['role'],
            'email' => $user['email']
        ];

        return JWT::encode($payload, $this->jwtSettings['secret'], $this->jwtSettings['algorithm']);
    }

    private function generateRefreshToken(array $user): string
    {
        $payload = [
            'iss' => 'boothiecall-api',
            'aud' => 'boothiecall-frontend',
            'iat' => time(),
            'exp' => time() + $this->jwtSettings['refresh_expires_in'],
            'user_id' => $user['id'],
            'type' => 'refresh'
        ];

        return JWT::encode($payload, $this->jwtSettings['refresh_secret'], $this->jwtSettings['algorithm']);
    }

    private function jsonResponse(ResponseInterface $response, array $data, int $status = 200): ResponseInterface
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
