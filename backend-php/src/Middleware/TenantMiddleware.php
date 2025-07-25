<?php

declare(strict_types=1);

namespace BoothieCall\Api\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

class TenantMiddleware implements MiddlewareInterface
{
    private array $settings;

    public function __construct(array $settings)
    {
        $this->settings = $settings;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // Get tenant ID from header or use default
        $tenantId = $request->getHeaderLine($this->settings['header_name']);
        
        if (empty($tenantId)) {
            // Try to get from user token if available
            $user = $request->getAttribute('user');
            if ($user && isset($user->tenant_id)) {
                $tenantId = $user->tenant_id;
            } else {
                $tenantId = $this->settings['default_id'];
            }
        }

        // Add tenant ID to request attributes
        $request = $request->withAttribute('tenant_id', $tenantId);

        return $handler->handle($request);
    }
}
