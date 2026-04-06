<?php

declare(strict_types=1);

use BoothieCall\Api\Application\ApplicationFactory;

require_once __DIR__ . '/../vendor/autoload.php';

// DEBUG: Enable error reporting
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Load settings
$settings = require __DIR__ . '/../config/settings.php';

// Create application
$app = ApplicationFactory::create($settings);

// Run application
$app->run();
