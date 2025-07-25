<?php

declare(strict_types=1);

namespace BoothieCall\Api\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class CorsMiddleware implements MiddlewareInterface
{
    private array $settings;

    public function __construct(array $settings)
    {
        $this->settings = $settings;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $response = $handler->handle($request);
        
        $origin = $request->getHeaderLine('Origin');
        
        // Check if origin is allowed
        if (in_array($origin, $this->settings['origin']) || in_array('*', $this->settings['origin'])) {
            $response = $response->withHeader('Access-Control-Allow-Origin', $origin);
        }
        
        $response = $response
            ->withHeader('Access-Control-Allow-Methods', implode(', ', $this->settings['methods']))
            ->withHeader('Access-Control-Allow-Headers', implode(', ', $this->settings['headers']));
            
        if ($this->settings['credentials']) {
            $response = $response->withHeader('Access-Control-Allow-Credentials', 'true');
        }
        
        // Handle preflight requests
        if ($request->getMethod() === 'OPTIONS') {
            return $response->withStatus(200);
        }
        
        return $response;
    }
}
