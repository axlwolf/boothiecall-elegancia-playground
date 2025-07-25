<?php

declare(strict_types=1);

namespace BoothieCall\Api\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

class RateLimitMiddleware implements MiddlewareInterface
{
    private array $settings;
    private string $cacheDir;

    public function __construct(array $settings)
    {
        $this->settings = $settings;
        $this->cacheDir = sys_get_temp_dir() . '/boothiecall_rate_limit';
        
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $clientIp = $this->getClientIp($request);
        $key = 'rate_limit_' . md5($clientIp);
        $cacheFile = $this->cacheDir . '/' . $key;
        
        $now = time();
        $windowStart = $now - $this->settings['window'];
        
        // Load existing requests
        $requests = [];
        if (file_exists($cacheFile)) {
            $data = file_get_contents($cacheFile);
            $requests = json_decode($data, true) ?: [];
        }
        
        // Filter out old requests
        $requests = array_filter($requests, function($timestamp) use ($windowStart) {
            return $timestamp > $windowStart;
        });
        
        // Check if limit exceeded
        if (count($requests) >= $this->settings['requests']) {
            $response = new Response();
            $response->getBody()->write(json_encode([
                'error' => 'Rate limit exceeded',
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => $this->settings['window']
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withHeader('X-RateLimit-Limit', (string)$this->settings['requests'])
                ->withHeader('X-RateLimit-Remaining', '0')
                ->withHeader('X-RateLimit-Reset', (string)($windowStart + $this->settings['window']))
                ->withStatus(429);
        }
        
        // Add current request
        $requests[] = $now;
        file_put_contents($cacheFile, json_encode($requests));
        
        // Process request
        $response = $handler->handle($request);
        
        // Add rate limit headers
        $remaining = max(0, $this->settings['requests'] - count($requests));
        $response = $response
            ->withHeader('X-RateLimit-Limit', (string)$this->settings['requests'])
            ->withHeader('X-RateLimit-Remaining', (string)$remaining)
            ->withHeader('X-RateLimit-Reset', (string)($windowStart + $this->settings['window']));
        
        return $response;
    }

    private function getClientIp(ServerRequestInterface $request): string
    {
        $serverParams = $request->getServerParams();
        
        // Check for IP from various headers
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
            'HTTP_X_FORWARDED',          // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_FORWARDED_FOR',        // Proxy
            'HTTP_FORWARDED',            // Proxy
            'REMOTE_ADDR'                // Standard
        ];
        
        foreach ($headers as $header) {
            if (!empty($serverParams[$header])) {
                $ips = explode(',', $serverParams[$header]);
                return trim($ips[0]);
            }
        }
        
        return '127.0.0.1'; // Fallback
    }
}
