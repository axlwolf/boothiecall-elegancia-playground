<?php

declare(strict_types=1);

namespace BoothieCall\Api\Controllers;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;

class AdminController
{
    private \PDO $db;
    private LoggerInterface $logger;

    public function __construct(\PDO $db, LoggerInterface $logger)
    {
        $this->db = $db;
        $this->logger = $logger;
    }

    public function listTenants(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $userRole = $request->getAttribute('role');
        
        if ($userRole !== 'SUPER_ADMIN') {
            return $this->jsonResponse($response, [
                'error' => 'Super admin access required'
            ], 403);
        }

        try {
            $stmt = $this->db->prepare('
                SELECT t.*, 
                       COUNT(DISTINCT u.id) as user_count,
                       COUNT(DISTINCT s.id) as session_count,
                       COUNT(DISTINCT a.id) as asset_count
                FROM tenants t
                LEFT JOIN users u ON t.id = u.tenant_id
                LEFT JOIN sessions s ON t.id = s.tenant_id
                LEFT JOIN assets a ON t.id = a.tenant_id
                GROUP BY t.id
                ORDER BY t.created_at DESC
            ');
            $stmt->execute();
            $tenants = $stmt->fetchAll();

            return $this->jsonResponse($response, [
                'tenants' => $tenants
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error listing tenants', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function createTenant(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $userRole = $request->getAttribute('role');
        $data = $request->getParsedBody();
        
        if ($userRole !== 'SUPER_ADMIN') {
            return $this->jsonResponse($response, [
                'error' => 'Super admin access required'
            ], 403);
        }

        // Validate required fields
        $required = ['name', 'domain'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->jsonResponse($response, [
                    'error' => "Missing required field: {$field}"
                ], 400);
            }
        }

        try {
            // Check if domain already exists
            $stmt = $this->db->prepare('SELECT id FROM tenants WHERE domain = ?');
            $stmt->execute([$data['domain']]);
            if ($stmt->fetch()) {
                return $this->jsonResponse($response, [
                    'error' => 'Domain already exists'
                ], 409);
            }

            // Create tenant
            $tenantId = Uuid::uuid4()->toString();
            $stmt = $this->db->prepare('
                INSERT INTO tenants (id, name, domain, settings, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, 1, NOW(), NOW())
            ');

            $stmt->execute([
                $tenantId,
                $data['name'],
                $data['domain'],
                json_encode($data['settings'] ?? [])
            ]);

            $this->logger->info('Tenant created successfully', ['tenant_id' => $tenantId]);

            return $this->jsonResponse($response, [
                'message' => 'Tenant created successfully',
                'tenant_id' => $tenantId
            ], 201);

        } catch (\Exception $e) {
            $this->logger->error('Error creating tenant', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function updateTenant(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $userRole = $request->getAttribute('role');
        $tenantId = $args['id'];
        $data = $request->getParsedBody();
        
        if ($userRole !== 'SUPER_ADMIN') {
            return $this->jsonResponse($response, [
                'error' => 'Super admin access required'
            ], 403);
        }

        try {
            // Check if tenant exists
            $stmt = $this->db->prepare('SELECT id FROM tenants WHERE id = ?');
            $stmt->execute([$tenantId]);
            if (!$stmt->fetch()) {
                return $this->jsonResponse($response, [
                    'error' => 'Tenant not found'
                ], 404);
            }

            // Build update query
            $updateFields = [];
            $updateParams = [];

            $allowedFields = ['name', 'domain', 'settings', 'is_active'];
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

            $updateFields[] = 'updated_at = NOW()';
            $updateParams[] = $tenantId;

            $sql = 'UPDATE tenants SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
            $stmt = $this->db->prepare($sql);
            $stmt->execute($updateParams);

            $this->logger->info('Tenant updated successfully', ['tenant_id' => $tenantId]);

            return $this->jsonResponse($response, [
                'message' => 'Tenant updated successfully'
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error updating tenant', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function listUsers(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $userRole = $request->getAttribute('role');
        $currentTenantId = $request->getAttribute('tenant_id');
        $params = $request->getQueryParams();
        
        if (!in_array($userRole, ['SUPER_ADMIN', 'TENANT_ADMIN'])) {
            return $this->jsonResponse($response, [
                'error' => 'Admin access required'
            ], 403);
        }

        try {
            $whereConditions = [];
            $queryParams = [];

            // Super admin can see all users, tenant admin only their tenant
            if ($userRole === 'TENANT_ADMIN') {
                $whereConditions[] = 'u.tenant_id = ?';
                $queryParams[] = $currentTenantId;
            } elseif (isset($params['tenant_id'])) {
                $whereConditions[] = 'u.tenant_id = ?';
                $queryParams[] = $params['tenant_id'];
            }

            if (isset($params['role'])) {
                $whereConditions[] = 'u.role = ?';
                $queryParams[] = $params['role'];
            }

            if (isset($params['active'])) {
                $whereConditions[] = 'u.is_active = ?';
                $queryParams[] = filter_var($params['active'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
            }

            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

            $stmt = $this->db->prepare("
                SELECT u.*, t.name as tenant_name, t.domain as tenant_domain,
                       COUNT(DISTINCT s.id) as session_count
                FROM users u
                LEFT JOIN tenants t ON u.tenant_id = t.id
                LEFT JOIN sessions s ON u.id = s.user_id
                {$whereClause}
                GROUP BY u.id
                ORDER BY u.created_at DESC
            ");
            
            $stmt->execute($queryParams);
            $users = $stmt->fetchAll();

            return $this->jsonResponse($response, [
                'users' => $users
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error listing users', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function updateUser(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $userRole = $request->getAttribute('role');
        $currentTenantId = $request->getAttribute('tenant_id');
        $userId = $args['id'];
        $data = $request->getParsedBody();
        
        if (!in_array($userRole, ['SUPER_ADMIN', 'TENANT_ADMIN'])) {
            return $this->jsonResponse($response, [
                'error' => 'Admin access required'
            ], 403);
        }

        try {
            // Check if user exists and get their tenant
            $stmt = $this->db->prepare('SELECT tenant_id, role FROM users WHERE id = ?');
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return $this->jsonResponse($response, [
                    'error' => 'User not found'
                ], 404);
            }

            // Tenant admin can only update users in their tenant
            if ($userRole === 'TENANT_ADMIN' && $user['tenant_id'] !== $currentTenantId) {
                return $this->jsonResponse($response, [
                    'error' => 'You can only manage users in your tenant'
                ], 403);
            }

            // Build update query
            $updateFields = [];
            $updateParams = [];

            $allowedFields = ['first_name', 'last_name', 'email', 'role', 'is_active'];
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    if ($field === 'is_active') {
                        $updateFields[] = "{$field} = ?";
                        $updateParams[] = filter_var($data[$field], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
                    } elseif ($field === 'role') {
                        // Tenant admin cannot set SUPER_ADMIN role
                        if ($userRole === 'TENANT_ADMIN' && $data[$field] === 'SUPER_ADMIN') {
                            return $this->jsonResponse($response, [
                                'error' => 'Cannot assign super admin role'
                            ], 403);
                        }
                        $updateFields[] = "{$field} = ?";
                        $updateParams[] = $data[$field];
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

            $updateFields[] = 'updated_at = NOW()';
            $updateParams[] = $userId;

            $sql = 'UPDATE users SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
            $stmt = $this->db->prepare($sql);
            $stmt->execute($updateParams);

            $this->logger->info('User updated successfully', ['user_id' => $userId]);

            return $this->jsonResponse($response, [
                'message' => 'User updated successfully'
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error updating user', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function systemStats(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $userRole = $request->getAttribute('role');
        
        if ($userRole !== 'SUPER_ADMIN') {
            return $this->jsonResponse($response, [
                'error' => 'Super admin access required'
            ], 403);
        }

        try {
            $stmt = $this->db->prepare('
                SELECT 
                    (SELECT COUNT(*) FROM tenants WHERE is_active = 1) as active_tenants,
                    (SELECT COUNT(*) FROM users WHERE is_active = 1) as active_users,
                    (SELECT COUNT(*) FROM sessions WHERE DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as sessions_last_30_days,
                    (SELECT COUNT(*) FROM assets) as total_assets,
                    (SELECT SUM(file_size) FROM assets) as total_storage_bytes,
                    (SELECT COUNT(*) FROM filters WHERE is_active = 1) as active_filters
            ');
            $stmt->execute();
            $stats = $stmt->fetch();

            // Get tenant activity
            $stmt = $this->db->prepare('
                SELECT t.name, t.domain, COUNT(s.id) as recent_sessions
                FROM tenants t
                LEFT JOIN sessions s ON t.id = s.tenant_id AND DATE(s.created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                WHERE t.is_active = 1
                GROUP BY t.id, t.name, t.domain
                ORDER BY recent_sessions DESC
                LIMIT 10
            ');
            $stmt->execute();
            $tenantActivity = $stmt->fetchAll();

            return $this->jsonResponse($response, [
                'stats' => $stats,
                'tenant_activity' => $tenantActivity
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error getting system stats', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function cleanup(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $userRole = $request->getAttribute('role');
        $data = $request->getParsedBody();
        
        if ($userRole !== 'SUPER_ADMIN') {
            return $this->jsonResponse($response, [
                'error' => 'Super admin access required'
            ], 403);
        }

        $daysOld = (int)($data['days_old'] ?? 30);
        $dryRun = filter_var($data['dry_run'] ?? true, FILTER_VALIDATE_BOOLEAN);

        try {
            $this->db->beginTransaction();

            $results = [];

            // Clean up old sessions
            $stmt = $this->db->prepare('
                SELECT COUNT(*) FROM sessions 
                WHERE status = "COMPLETED" AND DATE(updated_at) < DATE_SUB(NOW(), INTERVAL ? DAY)
            ');
            $stmt->execute([$daysOld]);
            $oldSessions = $stmt->fetchColumn();

            if (!$dryRun && $oldSessions > 0) {
                $stmt = $this->db->prepare('
                    DELETE FROM sessions 
                    WHERE status = "COMPLETED" AND DATE(updated_at) < DATE_SUB(NOW(), INTERVAL ? DAY)
                ');
                $stmt->execute([$daysOld]);
            }
            $results['old_sessions'] = $oldSessions;

            // Clean up orphaned assets
            $stmt = $this->db->prepare('
                SELECT COUNT(*) FROM assets a
                LEFT JOIN sessions s ON a.id = s.background_asset_id
                LEFT JOIN session_photos sp ON a.id = sp.asset_id
                WHERE s.id IS NULL AND sp.id IS NULL 
                AND DATE(a.created_at) < DATE_SUB(NOW(), INTERVAL ? DAY)
            ');
            $stmt->execute([$daysOld]);
            $orphanedAssets = $stmt->fetchColumn();

            if (!$dryRun && $orphanedAssets > 0) {
                $stmt = $this->db->prepare('
                    DELETE a FROM assets a
                    LEFT JOIN sessions s ON a.id = s.background_asset_id
                    LEFT JOIN session_photos sp ON a.id = sp.asset_id
                    WHERE s.id IS NULL AND sp.id IS NULL 
                    AND DATE(a.created_at) < DATE_SUB(NOW(), INTERVAL ? DAY)
                ');
                $stmt->execute([$daysOld]);
            }
            $results['orphaned_assets'] = $orphanedAssets;

            $this->db->commit();

            $this->logger->info('Cleanup completed', [
                'dry_run' => $dryRun,
                'days_old' => $daysOld,
                'results' => $results
            ]);

            return $this->jsonResponse($response, [
                'message' => $dryRun ? 'Cleanup preview completed' : 'Cleanup completed',
                'results' => $results,
                'dry_run' => $dryRun
            ]);

        } catch (\Exception $e) {
            $this->db->rollBack();
            $this->logger->error('Error during cleanup', ['error' => $e->getMessage()]);
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
