<?php

declare(strict_types=1);

namespace BoothieCall\Api\Controllers;

use Intervention\Image\ImageManagerStatic as Image;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;

class SessionsController
{
    private \PDO $db;
    private LoggerInterface $logger;
    private array $uploadSettings;
    private array $imageSettings;

    public function __construct(\PDO $db, LoggerInterface $logger, array $uploadSettings, array $imageSettings)
    {
        $this->db = $db;
        $this->logger = $logger;
        $this->uploadSettings = $uploadSettings;
        $this->imageSettings = $imageSettings;
        
        Image::configure(['driver' => $this->imageSettings['driver']]);
    }

    public function list(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $userId = $request->getAttribute('user_id');
        $params = $request->getQueryParams();
        
        $page = max(1, (int)($params['page'] ?? 1));
        $limit = min(100, max(1, (int)($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        
        $status = $params['status'] ?? null;
        $layout = $params['layout'] ?? null;

        try {
            // Build query
            $whereConditions = ['s.tenant_id = ?'];
            $queryParams = [$tenantId];

            // Users can only see their own sessions unless they're admin
            $userRole = $request->getAttribute('role');
            if (!in_array($userRole, ['SUPER_ADMIN', 'TENANT_ADMIN'])) {
                $whereConditions[] = 's.user_id = ?';
                $queryParams[] = $userId;
            }

            if ($status) {
                $whereConditions[] = 's.status = ?';
                $queryParams[] = $status;
            }

            if ($layout) {
                $whereConditions[] = 's.layout = ?';
                $queryParams[] = $layout;
            }

            $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);

            // Get total count
            $countSql = "SELECT COUNT(*) FROM photo_sessions s {$whereClause}";
            $stmt = $this->db->prepare($countSql);
            $stmt->execute($queryParams);
            $total = $stmt->fetchColumn();

            // Get sessions with photo count
            $sql = "
                SELECT s.*, 
                       u.first_name, u.last_name, u.email as user_email,
                       a.filename as asset_filename, a.url as asset_url,
                       COUNT(p.id) as photo_count
                FROM photo_sessions s
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN assets a ON s.asset_id = a.id
                LEFT JOIN photos p ON s.id = p.session_id
                {$whereClause}
                GROUP BY s.id
                ORDER BY s.created_at DESC
                LIMIT ? OFFSET ?
            ";
            
            $queryParams[] = $limit;
            $queryParams[] = $offset;
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($queryParams);
            $sessions = $stmt->fetchAll();

            return $this->jsonResponse($response, [
                'sessions' => $sessions,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int)$total,
                    'pages' => ceil($total / $limit)
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error listing sessions', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $userId = $request->getAttribute('user_id');
        $data = $request->getParsedBody();

        if (empty($data['layout'])) {
            return $this->jsonResponse($response, [
                'error' => 'Layout is required'
            ], 400);
        }

        if (!in_array($data['layout'], ['1', '3', '4', '6'])) {
            return $this->jsonResponse($response, [
                'error' => 'Invalid layout. Must be 1, 3, 4, or 6'
            ], 400);
        }

        try {
            $sessionId = Uuid::uuid4()->toString();
            $publicSessionId = 'session_' . substr(md5($sessionId . time()), 0, 10);

            $stmt = $this->db->prepare('
                INSERT INTO photo_sessions (
                    id, session_id, layout, template, status, metadata, 
                    tenant_id, user_id, asset_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ');

            $stmt->execute([
                $sessionId,
                $publicSessionId,
                $data['layout'],
                $data['template'] ?? null,
                'ACTIVE',
                json_encode($data['metadata'] ?? []),
                $tenantId,
                $userId,
                $data['asset_id'] ?? null
            ]);

            // Get the created session
            $stmt = $this->db->prepare('
                SELECT s.*, a.filename as asset_filename, a.url as asset_url
                FROM photo_sessions s
                LEFT JOIN assets a ON s.asset_id = a.id
                WHERE s.id = ?
            ');
            $stmt->execute([$sessionId]);
            $session = $stmt->fetch();

            $this->logger->info('Photo session created', ['session_id' => $sessionId]);

            return $this->jsonResponse($response, [
                'message' => 'Session created successfully',
                'session' => $session
            ], 201);

        } catch (\Exception $e) {
            $this->logger->error('Error creating session', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function get(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $userId = $request->getAttribute('user_id');
        $sessionId = $args['id'];

        try {
            // Build query with access control
            $whereConditions = ['s.id = ? AND s.tenant_id = ?'];
            $queryParams = [$sessionId, $tenantId];

            $userRole = $request->getAttribute('role');
            if (!in_array($userRole, ['SUPER_ADMIN', 'TENANT_ADMIN'])) {
                $whereConditions[] = 's.user_id = ?';
                $queryParams[] = $userId;
            }

            $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);

            $stmt = $this->db->prepare("
                SELECT s.*, 
                       u.first_name, u.last_name, u.email as user_email,
                       a.filename as asset_filename, a.url as asset_url
                FROM photo_sessions s
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN assets a ON s.asset_id = a.id
                {$whereClause}
            ");
            $stmt->execute($queryParams);
            $session = $stmt->fetch();

            if (!$session) {
                return $this->jsonResponse($response, [
                    'error' => 'Session not found'
                ], 404);
            }

            // Get photos
            $stmt = $this->db->prepare('
                SELECT * FROM photos 
                WHERE session_id = ? 
                ORDER BY position ASC
            ');
            $stmt->execute([$sessionId]);
            $photos = $stmt->fetchAll();

            // Get applied filters
            $stmt = $this->db->prepare('
                SELECT sf.*, f.name, f.display_name, f.css_filter
                FROM session_filters sf
                JOIN filters f ON sf.filter_id = f.id
                WHERE sf.session_id = ?
                ORDER BY sf.photo_position ASC
            ');
            $stmt->execute([$sessionId]);
            $filters = $stmt->fetchAll();

            // Get outputs
            $stmt = $this->db->prepare('
                SELECT * FROM session_outputs 
                WHERE session_id = ? 
                ORDER BY created_at DESC
            ');
            $stmt->execute([$sessionId]);
            $outputs = $stmt->fetchAll();

            $session['photos'] = $photos;
            $session['filters'] = $filters;
            $session['outputs'] = $outputs;

            return $this->jsonResponse($response, [
                'session' => $session
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error getting session', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function uploadPhoto(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $userId = $request->getAttribute('user_id');
        $sessionId = $args['id'];
        $uploadedFiles = $request->getUploadedFiles();
        $parsedBody = $request->getParsedBody();

        if (!isset($uploadedFiles['photo'])) {
            return $this->jsonResponse($response, [
                'error' => 'No photo uploaded'
            ], 400);
        }

        $uploadedFile = $uploadedFiles['photo'];
        $position = (int)($parsedBody['position'] ?? 0);

        try {
            // Verify session exists and user has access
            $stmt = $this->db->prepare('
                SELECT id, layout FROM photo_sessions 
                WHERE id = ? AND tenant_id = ? AND user_id = ? AND status = "ACTIVE"
            ');
            $stmt->execute([$sessionId, $tenantId, $userId]);
            $session = $stmt->fetch();

            if (!$session) {
                return $this->jsonResponse($response, [
                    'error' => 'Session not found or not accessible'
                ], 404);
            }

            // Validate position based on layout
            $maxPositions = ['1' => 1, '3' => 3, '4' => 4, '6' => 6];
            if ($position >= $maxPositions[$session['layout']]) {
                return $this->jsonResponse($response, [
                    'error' => 'Invalid position for this layout'
                ], 400);
            }

            // Validate file
            if ($uploadedFile->getError() !== UPLOAD_ERR_OK) {
                return $this->jsonResponse($response, [
                    'error' => 'File upload error'
                ], 400);
            }

            if (!in_array($uploadedFile->getClientMediaType(), ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
                return $this->jsonResponse($response, [
                    'error' => 'Invalid image format'
                ], 400);
            }

            // Generate filename and path
            $extension = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);
            $filename = "session_{$sessionId}_pos_{$position}_" . time() . '.' . $extension;
            $uploadPath = $this->uploadSettings['upload_path'] . '/sessions';
            
            if (!is_dir($uploadPath)) {
                mkdir($uploadPath, 0755, true);
            }

            $filePath = $uploadPath . '/' . $filename;
            $uploadedFile->moveTo($filePath);

            // Process image
            $image = Image::make($filePath);
            $metadata = [
                'width' => $image->width(),
                'height' => $image->height(),
                'size' => $uploadedFile->getSize()
            ];

            // Optimize image
            if ($image->width() > 1920 || $image->height() > 1080) {
                $image->resize(1920, 1080, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
                $image->save($filePath, 90);
            }

            // Delete existing photo at this position
            $stmt = $this->db->prepare('SELECT path FROM photos WHERE session_id = ? AND position = ?');
            $stmt->execute([$sessionId, $position]);
            $existingPhoto = $stmt->fetch();
            
            if ($existingPhoto && file_exists($existingPhoto['path'])) {
                unlink($existingPhoto['path']);
            }

            // Save/update photo in database
            $stmt = $this->db->prepare('
                INSERT INTO photos (id, filename, original_name, path, url, position, metadata, session_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                filename = VALUES(filename),
                original_name = VALUES(original_name),
                path = VALUES(path),
                url = VALUES(url),
                metadata = VALUES(metadata),
                created_at = NOW()
            ');

            $photoId = Uuid::uuid4()->toString();
            $stmt->execute([
                $photoId,
                $filename,
                $uploadedFile->getClientFilename(),
                $filePath,
                '/uploads/sessions/' . $filename,
                $position,
                json_encode($metadata),
                $sessionId
            ]);

            $this->logger->info('Photo uploaded to session', [
                'session_id' => $sessionId,
                'position' => $position
            ]);

            return $this->jsonResponse($response, [
                'message' => 'Photo uploaded successfully',
                'photo' => [
                    'id' => $photoId,
                    'filename' => $filename,
                    'url' => '/uploads/sessions/' . $filename,
                    'position' => $position,
                    'metadata' => $metadata
                ]
            ], 201);

        } catch (\Exception $e) {
            $this->logger->error('Error uploading photo', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function applyFilter(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $userId = $request->getAttribute('user_id');
        $sessionId = $args['id'];
        $data = $request->getParsedBody();

        if (empty($data['filter_id'])) {
            return $this->jsonResponse($response, [
                'error' => 'Filter ID is required'
            ], 400);
        }

        try {
            // Verify session access
            $stmt = $this->db->prepare('
                SELECT id FROM photo_sessions 
                WHERE id = ? AND tenant_id = ? AND user_id = ? AND status = "ACTIVE"
            ');
            $stmt->execute([$sessionId, $tenantId, $userId]);
            if (!$stmt->fetch()) {
                return $this->jsonResponse($response, [
                    'error' => 'Session not found or not accessible'
                ], 404);
            }

            // Verify filter exists
            $stmt = $this->db->prepare('SELECT id FROM filters WHERE id = ? AND tenant_id = ? AND is_active = 1');
            $stmt->execute([$data['filter_id'], $tenantId]);
            if (!$stmt->fetch()) {
                return $this->jsonResponse($response, [
                    'error' => 'Filter not found'
                ], 404);
            }

            $photoPosition = isset($data['photo_position']) ? (int)$data['photo_position'] : null;

            // Insert or update filter application
            $stmt = $this->db->prepare('
                INSERT INTO session_filters (id, session_id, filter_id, photo_position, settings, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                settings = VALUES(settings),
                created_at = NOW()
            ');

            $stmt->execute([
                Uuid::uuid4()->toString(),
                $sessionId,
                $data['filter_id'],
                $photoPosition,
                json_encode($data['settings'] ?? [])
            ]);

            $this->logger->info('Filter applied to session', [
                'session_id' => $sessionId,
                'filter_id' => $data['filter_id'],
                'photo_position' => $photoPosition
            ]);

            return $this->jsonResponse($response, [
                'message' => 'Filter applied successfully'
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error applying filter', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function generateOutput(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $userId = $request->getAttribute('user_id');
        $sessionId = $args['id'];
        $data = $request->getParsedBody();

        $format = strtoupper($data['format'] ?? 'PNG');
        if (!in_array($format, ['PNG', 'JPEG', 'GIF'])) {
            return $this->jsonResponse($response, [
                'error' => 'Invalid format. Must be PNG, JPEG, or GIF'
            ], 400);
        }

        try {
            // Get session with photos and filters
            $stmt = $this->db->prepare('
                SELECT s.*, COUNT(p.id) as photo_count
                FROM photo_sessions s
                LEFT JOIN photos p ON s.id = p.session_id
                WHERE s.id = ? AND s.tenant_id = ? AND s.user_id = ?
                GROUP BY s.id
            ');
            $stmt->execute([$sessionId, $tenantId, $userId]);
            $session = $stmt->fetch();

            if (!$session) {
                return $this->jsonResponse($response, [
                    'error' => 'Session not found'
                ], 404);
            }

            if ($session['photo_count'] == 0) {
                return $this->jsonResponse($response, [
                    'error' => 'No photos in session'
                ], 400);
            }

            // Generate output (simplified version - in production you'd use a proper image processing library)
            $outputFilename = "output_{$sessionId}_" . time() . '.' . strtolower($format);
            $outputPath = $this->uploadSettings['upload_path'] . '/outputs';
            
            if (!is_dir($outputPath)) {
                mkdir($outputPath, 0755, true);
            }

            $outputFilePath = $outputPath . '/' . $outputFilename;

            // For now, just copy the first photo as a placeholder
            // In production, you'd create a proper photo strip layout
            $stmt = $this->db->prepare('SELECT path FROM photos WHERE session_id = ? ORDER BY position LIMIT 1');
            $stmt->execute([$sessionId]);
            $firstPhoto = $stmt->fetch();

            if ($firstPhoto && file_exists($firstPhoto['path'])) {
                copy($firstPhoto['path'], $outputFilePath);
            }

            // Save output to database
            $outputId = Uuid::uuid4()->toString();
            $stmt = $this->db->prepare('
                INSERT INTO session_outputs (id, filename, path, url, format, size, metadata, session_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ');

            $fileSize = file_exists($outputFilePath) ? filesize($outputFilePath) : 0;
            
            $stmt->execute([
                $outputId,
                $outputFilename,
                $outputFilePath,
                '/uploads/outputs/' . $outputFilename,
                $format,
                $fileSize,
                json_encode(['generated_at' => date('c')]),
                $sessionId
            ]);

            // Update session status
            $stmt = $this->db->prepare('UPDATE photo_sessions SET status = "COMPLETED", completed_at = NOW() WHERE id = ?');
            $stmt->execute([$sessionId]);

            $this->logger->info('Session output generated', ['session_id' => $sessionId, 'format' => $format]);

            return $this->jsonResponse($response, [
                'message' => 'Output generated successfully',
                'output' => [
                    'id' => $outputId,
                    'filename' => $outputFilename,
                    'url' => '/uploads/outputs/' . $outputFilename,
                    'format' => $format,
                    'size' => $fileSize
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error generating output', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    private function jsonResponse(ResponseInterface $response, array $data, int $status = 200): ResponseInterface
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
