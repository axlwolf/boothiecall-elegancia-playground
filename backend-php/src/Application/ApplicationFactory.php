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
        
        // Add middleware
        self::addMiddleware($app, $container);
        
        // Register routes
        self::registerRoutes($app, $container);
        
        // Add error handling
        self::addErrorHandling($app, $settings);
        
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
        ]);
        
        return $containerBuilder->build();
    }
    
    private static function addMiddleware(App $app, ContainerInterface $container): void
    {
        $settings = $container->get('settings');
        $logger = $container->get(LoggerInterface::class);
        
        // Add error middleware first
        $app->add(new ErrorMiddleware($logger));
        
        // Add CORS middleware
        $app->add(new CorsMiddleware($settings['cors']));
        
        // Add rate limiting middleware
        $app->add(new RateLimitMiddleware($settings['rate_limit']));
        
        // Add tenant middleware
        $app->add(new TenantMiddleware($settings['tenant']));
        
        // Add JSON body parser middleware
        $app->add(new JsonBodyParserMiddleware());
        
        // Add body parsing middleware
        $app->addBodyParsingMiddleware();
        
        // Add routing middleware
        $app->addRoutingMiddleware();
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
