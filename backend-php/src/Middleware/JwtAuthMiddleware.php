<?php

declare(strict_types=1);

namespace BoothieCall\Api\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

class JwtAuthMiddleware implements MiddlewareInterface
{
    private array $settings;

    public function __construct(array $settings)
    {
        $this->settings = $settings;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $authorization = $request->getHeaderLine('Authorization');
        
        if (empty($authorization)) {
            return $this->unauthorizedResponse('Missing Authorization header');
        }

        if (!preg_match('/Bearer\s+(.*)$/i', $authorization, $matches)) {
            return $this->unauthorizedResponse('Invalid Authorization header format');
        }

        $token = $matches[1];

        try {
            $decoded = JWT::decode($token, new Key($this->settings['secret'], $this->settings['algorithm']));
            
            // Add user data to request attributes
            $request = $request->withAttribute('user', $decoded);
            $request = $request->withAttribute('user_id', $decoded->user_id);
            $request = $request->withAttribute('tenant_id', $decoded->tenant_id);
            $request = $request->withAttribute('role', $decoded->role);

            return $handler->handle($request);
            
        } catch (\Exception $e) {
            return $this->unauthorizedResponse('Invalid or expired token: ' . $e->getMessage());
        }
    }

    private function unauthorizedResponse(string $message): ResponseInterface
    {
        $response = new Response();
        $response->getBody()->write(json_encode([
            'error' => 'Unauthorized',
            'message' => $message,
            'status' => 401
        ]));
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(401);
    }
}
