<?php

namespace BoothieCall\Api\Tests\Unit\Controllers;

use BoothieCall\Api\Controllers\AuthController;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamInterface;
use Psr\Log\LoggerInterface;

class AuthControllerTest extends TestCase
{
    private $db;
    private $logger;
    private $jwtSettings;
    private $securitySettings;
    private $controller;

    protected function setUp(): void
    {
        $this->db = $this->createMock(\PDO::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        $this->jwtSettings = [
            'secret' => 'test_secret',
            'refresh_secret' => 'test_refresh_secret',
            'algorithm' => 'HS256',
            'expires_in' => 3600,
            'refresh_expires_in' => 86400
        ];
        $this->securitySettings = ['bcrypt_cost' => 10];
        
        $this->controller = new AuthController(
            $this->db,
            $this->logger,
            $this->jwtSettings,
            $this->securitySettings
        );
    }

    public function testLoginReturns400IfMissingCredentials(): void
    {
        $request = $this->createMock(ServerRequestInterface::class);
        $request->method('getParsedBody')->willReturn(['email' => '']);
        
        $response = $this->createMock(ResponseInterface::class);
        $stream = $this->createMock(StreamInterface::class);
        $response->method('getBody')->willReturn($stream);
        $response->method('withHeader')->willReturnSelf();
        $response->method('withStatus')->with(400)->willReturnSelf();
        
        $result = $this->controller->login($request, $response);
        
        $this->assertSame($response, $result);
    }
    
    public function testLoginReturns401IfUserNotFound(): void
    {
        $request = $this->createMock(ServerRequestInterface::class);
        $request->method('getParsedBody')->willReturn([
            'email' => 'test@example.com',
            'password' => 'password'
        ]);
        
        $stmt = $this->createMock(\PDOStatement::class);
        $stmt->method('execute')->willReturn(true);
        $stmt->method('fetch')->willReturn(false);
        
        $this->db->method('prepare')->willReturn($stmt);
        
        $response = $this->createMock(ResponseInterface::class);
        $stream = $this->createMock(StreamInterface::class);
        $response->method('getBody')->willReturn($stream);
        $response->method('withHeader')->willReturnSelf();
        $response->method('withStatus')->with(401)->willReturnSelf();
        
        $result = $this->controller->login($request, $response);
        
        $this->assertSame($response, $result);
    }
}
