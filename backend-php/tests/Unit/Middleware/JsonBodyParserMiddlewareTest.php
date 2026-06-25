<?php

namespace BoothieCall\Api\Tests\Unit\Middleware;

use BoothieCall\Api\Middleware\JsonBodyParserMiddleware;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamInterface;
use Psr\Http\Server\RequestHandlerInterface;

class JsonBodyParserMiddlewareTest extends TestCase
{
    public function testProcessParsesJsonBody(): void
    {
        $middleware = new JsonBodyParserMiddleware();
        
        $bodyContent = json_encode(['key' => 'value']);
        
        $stream = $this->createMock(StreamInterface::class);
        $stream->method('__toString')->willReturn($bodyContent);
        
        $request = $this->createMock(ServerRequestInterface::class);
        $request->method('getHeaderLine')->with('Content-Type')->willReturn('application/json');
        $request->method('getBody')->willReturn($stream);
        
        $request->expects($this->once())
            ->method('withParsedBody')
            ->with(['key' => 'value'])
            ->willReturnSelf();
            
        $handler = $this->createMock(RequestHandlerInterface::class);
        $response = $this->createMock(ResponseInterface::class);
        $handler->method('handle')->willReturn($response);
        
        $result = $middleware->process($request, $handler);
        
        $this->assertSame($response, $result);
    }

    public function testProcessIgnoresNonJsonContentType(): void
    {
        $middleware = new JsonBodyParserMiddleware();
        
        $request = $this->createMock(ServerRequestInterface::class);
        $request->method('getHeaderLine')->with('Content-Type')->willReturn('text/plain');
        
        $request->expects($this->never())->method('getBody');
        $request->expects($this->never())->method('withParsedBody');
            
        $handler = $this->createMock(RequestHandlerInterface::class);
        $response = $this->createMock(ResponseInterface::class);
        $handler->method('handle')->willReturn($response);
        
        $result = $middleware->process($request, $handler);
        
        $this->assertSame($response, $result);
    }
    
    public function testProcessHandlesInvalidJson(): void
    {
        $middleware = new JsonBodyParserMiddleware();
        
        $bodyContent = '{invalid json';
        
        $stream = $this->createMock(StreamInterface::class);
        $stream->method('__toString')->willReturn($bodyContent);
        
        $request = $this->createMock(ServerRequestInterface::class);
        $request->method('getHeaderLine')->with('Content-Type')->willReturn('application/json');
        $request->method('getBody')->willReturn($stream);
        
        $request->expects($this->never())->method('withParsedBody');
            
        $handler = $this->createMock(RequestHandlerInterface::class);
        $response = $this->createMock(ResponseInterface::class);
        $handler->method('handle')->willReturn($response);
        
        $result = $middleware->process($request, $handler);
        
        $this->assertSame($response, $result);
    }
}
