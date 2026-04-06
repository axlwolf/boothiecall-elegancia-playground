<?php

declare(strict_types=1);

namespace BoothieCall\Api\Application;

use DI\Container;
use DI\ContainerBuilder;
use Monolog\Handler\StreamHandler;
use Monolog\Logger;
use PDO;
use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;
use Slim\App;
use Slim\Factory\AppFactory;
use BoothieCall\Api\Middleware\CorsMiddleware;
use BoothieCall\Api\Middleware\JwtAuthMiddleware;
use BoothieCall\Api\Middleware\TenantMiddleware;
use BoothieCall\Api\Middleware\JsonBodyParserMiddleware;
use BoothieCall\Api\Middleware\ErrorMiddleware;
use BoothieCall\Api\Middleware\RateLimitMiddleware;
use BoothieCall\Api\Routes\Routes;

class ApplicationFactory
{
    public static function create(array $settings): App
    {
        // Create DI container
        $container = self::createContainer($settings);
        
        // Create Slim app
        AppFactory::setContainer($container);
        $app = AppFactory::create();
        
        // Add error handling (Must be added before middleware so it's inner in the stack, allowing Cors to wrap it)
        self::addErrorHandling($app, $settings);
        
        // Add middleware (Cors is added here, so it will be outer)
        self::addMiddleware($app, $container);
        
        // Register routes
        self::registerRoutes($app, $container);
        
        return $app;
    }
    
    private static function createContainer(array $settings): ContainerInterface
    {
        $containerBuilder = new ContainerBuilder();
        
        $containerBuilder->addDefinitions([
            'settings' => $settings,
            
            LoggerInterface::class => function() use ($settings) {
                $logger = new Logger($settings['app']['name']);
                $logger->pushHandler(new StreamHandler(
                    $settings['logger']['path'],
                    $settings['logger']['level']
                ));
                return $logger;
            },
            
            PDO::class => function() use ($settings) {
                $db = $settings['database'];
                $dsn = "mysql:host={$db['host']};port={$db['port']};dbname={$db['database']};charset=utf8mb4";
                
                $pdo = new PDO($dsn, $db['username'], $db['password'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
                
                return $pdo;
            },

            \BoothieCall\Api\Controllers\AuthController::class => function(ContainerInterface $c) use ($settings) {
                return new \BoothieCall\Api\Controllers\AuthController(
                    $c->get(PDO::class),
                    $c->get(LoggerInterface::class),
                    $settings['jwt'],
                    $settings['security']
                );
            },
        ]);
        
        return $containerBuilder->build();
    }
    
    private static function addMiddleware(App $app, ContainerInterface $container): void
    {
        $settings = $container->get('settings');
        $logger = $container->get(LoggerInterface::class);
        
        // Add tenant middleware
        $app->add(new TenantMiddleware($settings['tenant']));
        
        // Add JSON body parser middleware
        $app->add(new JsonBodyParserMiddleware());
        
        // Add body parsing middleware
        $app->addBodyParsingMiddleware();
        
        // Add routing middleware
        $app->addRoutingMiddleware();

        // Add rate limiting middleware
        $app->add(new RateLimitMiddleware($settings['rate_limit']));

        // Add CORS middleware (Added last to run first - LIFO)
        $app->add(new CorsMiddleware($settings['cors']));
    }
    
    private static function registerRoutes(App $app, ContainerInterface $container): void
    {
        $routes = new Routes($container);
        $routes->register($app);
    }
    
    private static function addErrorHandling(App $app, array $settings): void
    {
        $errorMiddleware = $app->addErrorMiddleware(
            $settings['app']['debug'],
            true,
            true
        );
        
        // Custom error handler
        $errorHandler = $errorMiddleware->getDefaultErrorHandler();
        $errorHandler->forceContentType('application/json');
    }

    private function addRoutes(App $app): void
    {
        (new Routes())->register($app);
    }
}
