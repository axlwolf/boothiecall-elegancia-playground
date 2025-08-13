<?php

declare(strict_types=1);

namespace BoothieCall\Api\Controllers;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;

class FiltersController
{
    private \PDO $db;
    private LoggerInterface $logger;

    public function __construct(\PDO $db, LoggerInterface $logger)
    {
        $this->db = $db;
        $this->logger = $logger;
    }

    public function list(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $params = $request->getQueryParams();
        
        $category = $params['category'] ?? null;
        $search = $params['search'] ?? null;
        $active = isset($params['active']) ? filter_var($params['active'], FILTER_VALIDATE_BOOLEAN) : true;

        try {
            // Build query
            $whereConditions = ['f.tenant_id = ?'];
            $queryParams = [$tenantId];

            if ($active !== null) {
                $whereConditions[] = 'f.is_active = ?';
                $queryParams[] = $active ? 1 : 0;
            }

            if ($category) {
                $whereConditions[] = 'f.category = ?';
                $queryParams[] = $category;
            }

            if ($search) {
                $whereConditions[] = '(f.name LIKE ? OR f.display_name LIKE ? OR f.description LIKE ?)';
                $queryParams[] = "%{$search}%";
                $queryParams[] = "%{$search}%";
                $queryParams[] = "%{$search}%";
            }

            $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);

            $sql = "
                SELECT f.*, u.first_name, u.last_name, u.email as creator_email
                FROM filters f
                LEFT JOIN users u ON f.created_by_id = u.id
                {$whereClause}
                ORDER BY f.category ASC, f.sort_order ASC, f.display_name ASC
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($queryParams);
            $filters = $stmt->fetchAll();

            return $this->jsonResponse($response, [
                'filters' => $filters
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error listing filters', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $userId = $request->getAttribute('user_id');
        $userRole = $request->getAttribute('role');
        $data = $request->getParsedBody();

        // Check permissions
        if (!in_array($userRole, ['SUPER_ADMIN', 'TENANT_ADMIN', 'EDITOR'])) {
            return $this->jsonResponse($response, [
                'error' => 'Insufficient permissions'
            ], 403);
        }

        // Validate required fields
        $required = ['name', 'display_name', 'category', 'css_filter'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->jsonResponse($response, [
                    'error' => "Missing required field: {$field}"
                ], 400);
            }
        }

        try {
            // Check if filter name already exists
            $stmt = $this->db->prepare('SELECT id FROM filters WHERE name = ? AND tenant_id = ?');
            $stmt->execute([$data['name'], $tenantId]);
            if ($stmt->fetch()) {
                return $this->jsonResponse($response, [
                    'error' => 'Filter name already exists'
                ], 409);
            }

            // Create filter
            $filterId = Uuid::uuid4()->toString();
            $stmt = $this->db->prepare('
                INSERT INTO filters (
                    id, name, display_name, description, category, css_filter, 
                    settings, sort_order, tenant_id, created_by_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ');

            $stmt->execute([
                $filterId,
                $data['name'],
                $data['display_name'],
                $data['description'] ?? null,
                $data['category'],
                $data['css_filter'],
                json_encode($data['settings'] ?? []),
                (int)($data['sort_order'] ?? 0),
                $tenantId,
                $userId
            ]);

            // Get the created filter
            $stmt = $this->db->prepare('
                SELECT f.*, u.first_name, u.last_name, u.email as creator_email
                FROM filters f
                LEFT JOIN users u ON f.created_by_id = u.id
                WHERE f.id = ?
            ');
            $stmt->execute([$filterId]);
            $filter = $stmt->fetch();

            $this->logger->info('Filter created successfully', ['filter_id' => $filterId]);

            return $this->jsonResponse($response, [
                'message' => 'Filter created successfully',
                'filter' => $filter
            ], 201);

        } catch (\Exception $e) {
            $this->logger->error('Error creating filter', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function get(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $filterId = $args['id'];

        try {
            $stmt = $this->db->prepare('
                SELECT f.*, u.first_name, u.last_name, u.email as creator_email
                FROM filters f
                LEFT JOIN users u ON f.created_by_id = u.id
                WHERE f.id = ? AND f.tenant_id = ?
            ');
            $stmt->execute([$filterId, $tenantId]);
            $filter = $stmt->fetch();

            if (!$filter) {
                return $this->jsonResponse($response, [
                    'error' => 'Filter not found'
                ], 404);
            }

            return $this->jsonResponse($response, [
                'filter' => $filter
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error getting filter', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $userId = $request->getAttribute('user_id');
        $userRole = $request->getAttribute('role');
        $filterId = $args['id'];
        $data = $request->getParsedBody();

        // Check permissions
        if (!in_array($userRole, ['SUPER_ADMIN', 'TENANT_ADMIN', 'EDITOR'])) {
            return $this->jsonResponse($response, [
                'error' => 'Insufficient permissions'
            ], 403);
        }

        try {
            // Check if filter exists
            $stmt = $this->db->prepare('SELECT created_by_id FROM filters WHERE id = ? AND tenant_id = ?');
            $stmt->execute([$filterId, $tenantId]);
            $filter = $stmt->fetch();
            
            if (!$filter) {
                return $this->jsonResponse($response, [
                    'error' => 'Filter not found'
                ], 404);
            }

            // Check if user can edit this filter
            if (!in_array($userRole, ['SUPER_ADMIN', 'TENANT_ADMIN']) && $filter['created_by_id'] !== $userId) {
                return $this->jsonResponse($response, [
                    'error' => 'You can only edit filters you created'
                ], 403);
            }

            // Build update query
            $updateFields = [];
            $updateParams = [];

            $allowedFields = ['display_name', 'description', 'category', 'css_filter', 'settings', 'sort_order', 'is_active'];
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    if ($field === 'settings') {
                        $updateFields[] = "{$field} = ?";
                        $updateParams[] = json_encode($data[$field]);
                    } elseif ($field === 'is_active') {
                        $updateFields[] = "{$field} = ?";
                        $updateParams[] = filter_var($data[$field], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
                    } else {
                        $updateFields[] = "{$field} = ?";
                        $updateParams[] = $data[$field];
                    }
                }
            }

            if (empty($updateFields)) {
                return $this->jsonResponse($response, [
                    'error' => 'No fields to update'
                ], 400);
            }

            // Check for name uniqueness if name is being updated
            if (isset($data['name'])) {
                $stmt = $this->db->prepare('SELECT id FROM filters WHERE name = ? AND tenant_id = ? AND id != ?');
                $stmt->execute([$data['name'], $tenantId, $filterId]);
                if ($stmt->fetch()) {
                    return $this->jsonResponse($response, [
                        'error' => 'Filter name already exists'
                    ], 409);
                }
                $updateFields[] = 'name = ?';
                $updateParams[] = $data['name'];
            }

            $updateFields[] = 'updated_at = NOW()';
            $updateParams[] = $filterId;
            $updateParams[] = $tenantId;

            $sql = 'UPDATE filters SET ' . implode(', ', $updateFields) . ' WHERE id = ? AND tenant_id = ?';
            $stmt = $this->db->prepare($sql);
            $stmt->execute($updateParams);

            $this->logger->info('Filter updated successfully', ['filter_id' => $filterId]);

            return $this->jsonResponse($response, [
                'message' => 'Filter updated successfully'
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error updating filter', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function delete(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $userId = $request->getAttribute('user_id');
        $userRole = $request->getAttribute('role');
        $filterId = $args['id'];

        // Check permissions
        if (!in_array($userRole, ['SUPER_ADMIN', 'TENANT_ADMIN', 'EDITOR'])) {
            return $this->jsonResponse($response, [
                'error' => 'Insufficient permissions'
            ], 403);
        }

        try {
            // Check if filter exists
            $stmt = $this->db->prepare('SELECT created_by_id FROM filters WHERE id = ? AND tenant_id = ? AND is_active = 1');
            $stmt->execute([$filterId, $tenantId]);
            $filter = $stmt->fetch();
            
            if (!$filter) {
                return $this->jsonResponse($response, [
                    'error' => 'Filter not found'
                ], 404);
            }

            // Check if user can delete this filter
            if (!in_array($userRole, ['SUPER_ADMIN', 'TENANT_ADMIN']) && $filter['created_by_id'] !== $userId) {
                return $this->jsonResponse($response, [
                    'error' => 'You can only delete filters you created'
                ], 403);
            }

            // Check if filter is being used in any sessions
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM session_filters WHERE filter_id = ?');
            $stmt->execute([$filterId]);
            $usageCount = $stmt->fetchColumn();

            if ($usageCount > 0) {
                // Soft delete if filter is being used
                $stmt = $this->db->prepare('UPDATE filters SET is_active = 0, updated_at = NOW() WHERE id = ? AND tenant_id = ?');
                $stmt->execute([$filterId, $tenantId]);
                
                $message = 'Filter deactivated (was in use in ' . $usageCount . ' sessions)';
            } else {
                // Hard delete if not being used
                $stmt = $this->db->prepare('DELETE FROM filters WHERE id = ? AND tenant_id = ?');
                $stmt->execute([$filterId, $tenantId]);
                
                $message = 'Filter deleted successfully';
            }

            $this->logger->info('Filter deleted/deactivated', ['filter_id' => $filterId, 'usage_count' => $usageCount]);

            return $this->jsonResponse($response, [
                'message' => $message
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error deleting filter', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function categories(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');

        try {
            $stmt = $this->db->prepare('
                SELECT category, COUNT(*) as filter_count
                FROM filters 
                WHERE tenant_id = ? AND is_active = 1
                GROUP BY category
                ORDER BY category ASC
            ');
            $stmt->execute([$tenantId]);
            $categories = $stmt->fetchAll();

            return $this->jsonResponse($response, [
                'categories' => $categories
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error getting filter categories', ['error' => $e->getMessage()]);
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
