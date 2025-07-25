<?php

declare(strict_types=1);

namespace BoothieCall\Api\Controllers;

use Intervention\Image\ImageManagerStatic as Image;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;

class AssetsController
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
        
        // Configure Intervention Image
        Image::configure(['driver' => $this->imageSettings['driver']]);
    }

    public function list(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $params = $request->getQueryParams();
        
        $page = max(1, (int)($params['page'] ?? 1));
        $limit = min(100, max(1, (int)($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        
        $type = $params['type'] ?? null;
        $category = $params['category'] ?? null;
        $search = $params['search'] ?? null;

        try {
            // Build query
            $whereConditions = ['a.tenant_id = ? AND a.is_active = 1'];
            $queryParams = [$tenantId];

            if ($type) {
                $whereConditions[] = 'a.type = ?';
                $queryParams[] = $type;
            }

            if ($category) {
                $whereConditions[] = 'a.category = ?';
                $queryParams[] = $category;
            }

            if ($search) {
                $whereConditions[] = '(a.filename LIKE ? OR a.original_name LIKE ?)';
                $queryParams[] = "%{$search}%";
                $queryParams[] = "%{$search}%";
            }

            $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);

            // Get total count
            $countSql = "SELECT COUNT(*) FROM assets a {$whereClause}";
            $stmt = $this->db->prepare($countSql);
            $stmt->execute($queryParams);
            $total = $stmt->fetchColumn();

            // Get assets
            $sql = "
                SELECT a.*, u.first_name, u.last_name, u.email as creator_email
                FROM assets a
                LEFT JOIN users u ON a.created_by_id = u.id
                {$whereClause}
                ORDER BY a.created_at DESC
                LIMIT ? OFFSET ?
            ";
            
            $queryParams[] = $limit;
            $queryParams[] = $offset;
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($queryParams);
            $assets = $stmt->fetchAll();

            return $this->jsonResponse($response, [
                'assets' => $assets,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int)$total,
                    'pages' => ceil($total / $limit)
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error listing assets', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function upload(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $userId = $request->getAttribute('user_id');
        $uploadedFiles = $request->getUploadedFiles();
        $parsedBody = $request->getParsedBody();

        if (!isset($uploadedFiles['file'])) {
            return $this->jsonResponse($response, [
                'error' => 'No file uploaded'
            ], 400);
        }

        $uploadedFile = $uploadedFiles['file'];
        
        if ($uploadedFile->getError() !== UPLOAD_ERR_OK) {
            return $this->jsonResponse($response, [
                'error' => 'File upload error'
            ], 400);
        }

        try {
            // Validate file
            $validation = $this->validateUploadedFile($uploadedFile);
            if ($validation !== true) {
                return $this->jsonResponse($response, [
                    'error' => $validation
                ], 400);
            }

            // Generate unique filename
            $extension = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);
            $filename = Uuid::uuid4()->toString() . '.' . $extension;
            $uploadPath = $this->uploadSettings['upload_path'];
            
            // Create upload directory if it doesn't exist
            if (!is_dir($uploadPath)) {
                mkdir($uploadPath, 0755, true);
            }

            $filePath = $uploadPath . '/' . $filename;
            
            // Move uploaded file
            $uploadedFile->moveTo($filePath);

            // Process image if it's an image
            $metadata = [];
            if (strpos($uploadedFile->getClientMediaType(), 'image/') === 0) {
                $metadata = $this->processImage($filePath);
            }

            // Save to database
            $assetId = Uuid::uuid4()->toString();
            $stmt = $this->db->prepare('
                INSERT INTO assets (
                    id, filename, original_name, mime_type, size, path, url, 
                    type, category, metadata, tenant_id, created_by_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ');

            $stmt->execute([
                $assetId,
                $filename,
                $uploadedFile->getClientFilename(),
                $uploadedFile->getClientMediaType(),
                $uploadedFile->getSize(),
                $filePath,
                '/uploads/' . $filename, // Public URL
                $parsedBody['type'] ?? 'OTHER',
                $parsedBody['category'] ?? null,
                json_encode($metadata),
                $tenantId,
                $userId
            ]);

            // Get the created asset
            $stmt = $this->db->prepare('SELECT * FROM assets WHERE id = ?');
            $stmt->execute([$assetId]);
            $asset = $stmt->fetch();

            $this->logger->info('Asset uploaded successfully', ['asset_id' => $assetId]);

            return $this->jsonResponse($response, [
                'message' => 'Asset uploaded successfully',
                'asset' => $asset
            ], 201);

        } catch (\Exception $e) {
            $this->logger->error('Error uploading asset', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function get(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $assetId = $args['id'];

        try {
            $stmt = $this->db->prepare('
                SELECT a.*, u.first_name, u.last_name, u.email as creator_email
                FROM assets a
                LEFT JOIN users u ON a.created_by_id = u.id
                WHERE a.id = ? AND a.tenant_id = ? AND a.is_active = 1
            ');
            $stmt->execute([$assetId, $tenantId]);
            $asset = $stmt->fetch();

            if (!$asset) {
                return $this->jsonResponse($response, [
                    'error' => 'Asset not found'
                ], 404);
            }

            return $this->jsonResponse($response, [
                'asset' => $asset
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error getting asset', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $assetId = $args['id'];
        $data = $request->getParsedBody();

        try {
            // Check if asset exists
            $stmt = $this->db->prepare('SELECT id FROM assets WHERE id = ? AND tenant_id = ? AND is_active = 1');
            $stmt->execute([$assetId, $tenantId]);
            if (!$stmt->fetch()) {
                return $this->jsonResponse($response, [
                    'error' => 'Asset not found'
                ], 404);
            }

            // Update asset
            $updateFields = [];
            $updateParams = [];

            if (isset($data['type'])) {
                $updateFields[] = 'type = ?';
                $updateParams[] = $data['type'];
            }

            if (isset($data['category'])) {
                $updateFields[] = 'category = ?';
                $updateParams[] = $data['category'];
            }

            if (isset($data['metadata'])) {
                $updateFields[] = 'metadata = ?';
                $updateParams[] = json_encode($data['metadata']);
            }

            if (empty($updateFields)) {
                return $this->jsonResponse($response, [
                    'error' => 'No fields to update'
                ], 400);
            }

            $updateFields[] = 'updated_at = NOW()';
            $updateParams[] = $assetId;
            $updateParams[] = $tenantId;

            $sql = 'UPDATE assets SET ' . implode(', ', $updateFields) . ' WHERE id = ? AND tenant_id = ?';
            $stmt = $this->db->prepare($sql);
            $stmt->execute($updateParams);

            return $this->jsonResponse($response, [
                'message' => 'Asset updated successfully'
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error updating asset', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function delete(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $assetId = $args['id'];

        try {
            // Check if asset exists
            $stmt = $this->db->prepare('SELECT path FROM assets WHERE id = ? AND tenant_id = ? AND is_active = 1');
            $stmt->execute([$assetId, $tenantId]);
            $asset = $stmt->fetch();
            
            if (!$asset) {
                return $this->jsonResponse($response, [
                    'error' => 'Asset not found'
                ], 404);
            }

            // Soft delete
            $stmt = $this->db->prepare('UPDATE assets SET is_active = 0, updated_at = NOW() WHERE id = ? AND tenant_id = ?');
            $stmt->execute([$assetId, $tenantId]);

            // Optionally delete physical file
            if (file_exists($asset['path'])) {
                unlink($asset['path']);
            }

            $this->logger->info('Asset deleted successfully', ['asset_id' => $assetId]);

            return $this->jsonResponse($response, [
                'message' => 'Asset deleted successfully'
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error deleting asset', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    private function validateUploadedFile(UploadedFileInterface $uploadedFile): string|true
    {
        // Check file size
        if ($uploadedFile->getSize() > $this->uploadSettings['max_size']) {
            return 'File too large';
        }

        // Check MIME type
        $mimeType = $uploadedFile->getClientMediaType();
        if (!in_array($mimeType, $this->uploadSettings['allowed_types'])) {
            return 'File type not allowed';
        }

        return true;
    }

    private function processImage(string $filePath): array
    {
        try {
            $image = Image::make($filePath);
            
            $metadata = [
                'width' => $image->width(),
                'height' => $image->height(),
                'aspect_ratio' => round($image->width() / $image->height(), 2)
            ];

            // Resize if too large
            if ($image->width() > $this->imageSettings['max_width'] || $image->height() > $this->imageSettings['max_height']) {
                $image->resize($this->imageSettings['max_width'], $this->imageSettings['max_height'], function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
                
                $image->save($filePath, $this->imageSettings['quality']);
                
                $metadata['resized'] = true;
                $metadata['new_width'] = $image->width();
                $metadata['new_height'] = $image->height();
            }

            // Generate thumbnail
            $thumbnailPath = str_replace('.', '_thumb.', $filePath);
            $image->fit($this->imageSettings['thumbnail_size'])->save($thumbnailPath);
            $metadata['thumbnail'] = str_replace($this->uploadSettings['upload_path'], '/uploads', $thumbnailPath);

            return $metadata;

        } catch (\Exception $e) {
            $this->logger->warning('Error processing image', ['error' => $e->getMessage()]);
            return ['error' => 'Could not process image'];
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
