<?php

declare(strict_types=1);

namespace BoothieCall\Api\Routes;

use Psr\Container\ContainerInterface;
use Slim\App;
use BoothieCall\Api\Controllers\AuthController;
use BoothieCall\Api\Controllers\AssetsController;
use BoothieCall\Api\Controllers\SessionsController;
use BoothieCall\Api\Controllers\FiltersController;
use BoothieCall\Api\Controllers\AnalyticsController;
use BoothieCall\Api\Controllers\AdminController;
use BoothieCall\Api\Middleware\JwtAuthMiddleware;
use BoothieCall\Api\Middleware\TenantMiddleware;

class Routes
{
    private ContainerInterface $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function register(App $app): void
    {
        // Root route - API info
        $app->get('/', function ($request, $response) {
            $response->getBody()->write(json_encode([
                'name' => 'BoothieCall Elegancia API',
                'version' => '1.0.0',
                'status' => 'running',
                'endpoints' => [
                    'health' => '/health',
                    'api' => '/api/v1',
                    'auth' => '/api/v1/auth/login',
                    'docs' => 'https://github.com/axlwolf/boothiecall-elegancia-playground'
                ]
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        });

        // Health check
        $app->get('/health', function ($request, $response) {
            $response->getBody()->write(json_encode([
                'status' => 'ok',
                'timestamp' => date('c'),
                'version' => '1.0.0'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        });

        // API routes group
        $app->group('/api/v1', function ($group) {
            // Auth routes (no auth required)
            $group->group('/auth', function ($authGroup) {
                $authGroup->post('/login', [AuthController::class, 'login']);
                $authGroup->post('/register', [AuthController::class, 'register']);
                $authGroup->post('/refresh', [AuthController::class, 'refresh']);
                $authGroup->post('/logout', [AuthController::class, 'logout']);
            });

            // Protected routes (require authentication)
            $group->group('', function ($protectedGroup) {
                // Assets routes
                $protectedGroup->group('/assets', function ($assetsGroup) {
                    $assetsGroup->get('', [AssetsController::class, 'list']);
                    $assetsGroup->post('', [AssetsController::class, 'upload']);
                    $assetsGroup->get('/{id}', [AssetsController::class, 'get']);
                    $assetsGroup->put('/{id}', [AssetsController::class, 'update']);
                    $assetsGroup->delete('/{id}', [AssetsController::class, 'delete']);
                    $assetsGroup->get('/{id}/versions', [AssetsController::class, 'versions']);
                    $assetsGroup->post('/{id}/rollback/{version}', [AssetsController::class, 'rollback']);
                });

                // Sessions routes
                $protectedGroup->group('/sessions', function ($sessionsGroup) {
                    $sessionsGroup->get('', [SessionsController::class, 'list']);
                    $sessionsGroup->post('', [SessionsController::class, 'create']);
                    $sessionsGroup->get('/{id}', [SessionsController::class, 'get']);
                    $sessionsGroup->put('/{id}', [SessionsController::class, 'update']);
                    $sessionsGroup->delete('/{id}', [SessionsController::class, 'delete']);
                    $sessionsGroup->post('/{id}/photos', [SessionsController::class, 'uploadPhoto']);
                    $sessionsGroup->post('/{id}/filters', [SessionsController::class, 'applyFilter']);
                    $sessionsGroup->post('/{id}/generate', [SessionsController::class, 'generateOutput']);
                    $sessionsGroup->get('/{id}/download', [SessionsController::class, 'download']);
                });

                // Filters routes
                $protectedGroup->group('/filters', function ($filtersGroup) {
                    $filtersGroup->get('', [FiltersController::class, 'list']);
                    $filtersGroup->post('', [FiltersController::class, 'create']);
                    $filtersGroup->get('/categories', [FiltersController::class, 'categories']);
                    $filtersGroup->get('/{id}', [FiltersController::class, 'get']);
                    $filtersGroup->put('/{id}', [FiltersController::class, 'update']);
                    $filtersGroup->delete('/{id}', [FiltersController::class, 'delete']);
                });

                // Analytics routes
                $protectedGroup->group('/analytics', function ($analyticsGroup) {
                    $analyticsGroup->get('/dashboard', [AnalyticsController::class, 'dashboard']);
                    $analyticsGroup->get('/sessions', [AnalyticsController::class, 'sessions']);
                    $analyticsGroup->get('/assets', [AnalyticsController::class, 'assets']);
                    $analyticsGroup->get('/filters', [AnalyticsController::class, 'filters']);
                    $analyticsGroup->get('/users', [AnalyticsController::class, 'users']);
                    $analyticsGroup->post('/event', [AnalyticsController::class, 'trackEvent']);
                });

                // Admin routes
                $protectedGroup->group('/admin', function ($adminGroup) {
                    $adminGroup->get('/tenants', [AdminController::class, 'listTenants']);
                    $adminGroup->post('/tenants', [AdminController::class, 'createTenant']);
                    $adminGroup->put('/tenants/{id}', [AdminController::class, 'updateTenant']);
                    $adminGroup->get('/users', [AdminController::class, 'listUsers']);
                    $adminGroup->put('/users/{id}', [AdminController::class, 'updateUser']);
                    $adminGroup->get('/stats', [AdminController::class, 'systemStats']);
                    $adminGroup->post('/cleanup', [AdminController::class, 'cleanup']);
                });

            });
        });

        // Catch-all route for 404s
        $app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function ($request, $response) {
            $data = [
                'error' => 'Route not found',
                'message' => 'The requested route does not exist.',
                'path' => $request->getUri()->getPath(),
                'method' => $request->getMethod()
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(404);
        });
    }
}
