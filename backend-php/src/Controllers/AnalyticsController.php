<?php

declare(strict_types=1);

namespace BoothieCall\Api\Controllers;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;

class AnalyticsController
{
    private \PDO $db;
    private LoggerInterface $logger;

    public function __construct(\PDO $db, LoggerInterface $logger)
    {
        $this->db = $db;
        $this->logger = $logger;
    }

    public function dashboard(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $params = $request->getQueryParams();
        
        $startDate = $params['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
        $endDate = $params['end_date'] ?? date('Y-m-d');

        try {
            $analytics = [
                'overview' => $this->getOverviewStats($tenantId, $startDate, $endDate),
                'sessions' => $this->getSessionStats($tenantId, $startDate, $endDate),
                'assets' => $this->getAssetStats($tenantId, $startDate, $endDate),
                'filters' => $this->getFilterStats($tenantId, $startDate, $endDate),
                'users' => $this->getUserStats($tenantId, $startDate, $endDate),
                'timeline' => $this->getTimelineStats($tenantId, $startDate, $endDate)
            ];

            return $this->jsonResponse($response, [
                'analytics' => $analytics,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error getting analytics dashboard', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function sessions(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $params = $request->getQueryParams();
        
        $startDate = $params['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
        $endDate = $params['end_date'] ?? date('Y-m-d');
        $groupBy = $params['group_by'] ?? 'day'; // day, week, month

        try {
            $stats = $this->getDetailedSessionStats($tenantId, $startDate, $endDate, $groupBy);

            return $this->jsonResponse($response, [
                'sessions' => $stats,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'group_by' => $groupBy
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error getting session analytics', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function assets(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $params = $request->getQueryParams();
        
        $startDate = $params['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
        $endDate = $params['end_date'] ?? date('Y-m-d');

        try {
            $stats = $this->getDetailedAssetStats($tenantId, $startDate, $endDate);

            return $this->jsonResponse($response, [
                'assets' => $stats,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error getting asset analytics', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    public function filters(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $tenantId = $request->getAttribute('tenant_id');
        $params = $request->getQueryParams();
        
        $startDate = $params['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
        $endDate = $params['end_date'] ?? date('Y-m-d');

        try {
            $stats = $this->getDetailedFilterStats($tenantId, $startDate, $endDate);

            return $this->jsonResponse($response, [
                'filters' => $stats,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error getting filter analytics', ['error' => $e->getMessage()]);
            return $this->jsonResponse($response, [
                'error' => 'Internal server error'
            ], 500);
        }
    }

    private function getOverviewStats(string $tenantId, string $startDate, string $endDate): array
    {
        $stmt = $this->db->prepare('
            SELECT 
                (SELECT COUNT(*) FROM sessions WHERE tenant_id = ? AND DATE(created_at) BETWEEN ? AND ?) as total_sessions,
                (SELECT COUNT(*) FROM session_photos sp 
                 JOIN sessions s ON sp.session_id = s.id 
                 WHERE s.tenant_id = ? AND DATE(sp.created_at) BETWEEN ? AND ?) as total_photos,
                (SELECT COUNT(*) FROM assets WHERE tenant_id = ? AND DATE(created_at) BETWEEN ? AND ?) as total_assets,
                (SELECT COUNT(DISTINCT user_id) FROM sessions WHERE tenant_id = ? AND DATE(created_at) BETWEEN ? AND ?) as active_users
        ');
        
        $stmt->execute([
            $tenantId, $startDate, $endDate,
            $tenantId, $startDate, $endDate,
            $tenantId, $startDate, $endDate,
            $tenantId, $startDate, $endDate
        ]);
        
        return $stmt->fetch() ?: [];
    }

    private function getSessionStats(string $tenantId, string $startDate, string $endDate): array
    {
        $stmt = $this->db->prepare('
            SELECT 
                status,
                COUNT(*) as count,
                AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)) as avg_duration_minutes
            FROM sessions 
            WHERE tenant_id = ? AND DATE(created_at) BETWEEN ? AND ?
            GROUP BY status
        ');
        
        $stmt->execute([$tenantId, $startDate, $endDate]);
        return $stmt->fetchAll();
    }

    private function getAssetStats(string $tenantId, string $startDate, string $endDate): array
    {
        $stmt = $this->db->prepare('
            SELECT 
                type,
                COUNT(*) as count,
                AVG(file_size) as avg_size,
                SUM(file_size) as total_size
            FROM assets 
            WHERE tenant_id = ? AND DATE(created_at) BETWEEN ? AND ?
            GROUP BY type
        ');
        
        $stmt->execute([$tenantId, $startDate, $endDate]);
        return $stmt->fetchAll();
    }

    private function getFilterStats(string $tenantId, string $startDate, string $endDate): array
    {
        $stmt = $this->db->prepare('
            SELECT 
                f.name,
                f.display_name,
                f.category,
                COUNT(sf.filter_id) as usage_count
            FROM filters f
            LEFT JOIN session_filters sf ON f.id = sf.filter_id
            LEFT JOIN sessions s ON sf.session_id = s.id
            WHERE f.tenant_id = ? AND (s.id IS NULL OR DATE(s.created_at) BETWEEN ? AND ?)
            GROUP BY f.id, f.name, f.display_name, f.category
            ORDER BY usage_count DESC
            LIMIT 20
        ');
        
        $stmt->execute([$tenantId, $startDate, $endDate]);
        return $stmt->fetchAll();
    }

    private function getUserStats(string $tenantId, string $startDate, string $endDate): array
    {
        $stmt = $this->db->prepare('
            SELECT 
                u.first_name,
                u.last_name,
                u.email,
                COUNT(s.id) as session_count,
                COUNT(sp.id) as photo_count
            FROM users u
            LEFT JOIN sessions s ON u.id = s.user_id AND DATE(s.created_at) BETWEEN ? AND ?
            LEFT JOIN session_photos sp ON s.id = sp.session_id
            WHERE u.tenant_id = ?
            GROUP BY u.id, u.first_name, u.last_name, u.email
            HAVING session_count > 0
            ORDER BY session_count DESC
            LIMIT 20
        ');
        
        $stmt->execute([$startDate, $endDate, $tenantId]);
        return $stmt->fetchAll();
    }

    private function getTimelineStats(string $tenantId, string $startDate, string $endDate): array
    {
        $stmt = $this->db->prepare('
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as sessions,
                COUNT(DISTINCT user_id) as unique_users
            FROM sessions 
            WHERE tenant_id = ? AND DATE(created_at) BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ');
        
        $stmt->execute([$tenantId, $startDate, $endDate]);
        return $stmt->fetchAll();
    }

    private function getDetailedSessionStats(string $tenantId, string $startDate, string $endDate, string $groupBy): array
    {
        $dateFormat = match($groupBy) {
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d'
        };

        $stmt = $this->db->prepare("
            SELECT 
                DATE_FORMAT(created_at, '{$dateFormat}') as period,
                status,
                COUNT(*) as count,
                AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)) as avg_duration
            FROM sessions 
            WHERE tenant_id = ? AND DATE(created_at) BETWEEN ? AND ?
            GROUP BY period, status
            ORDER BY period ASC
        ");
        
        $stmt->execute([$tenantId, $startDate, $endDate]);
        return $stmt->fetchAll();
    }

    private function getDetailedAssetStats(string $tenantId, string $startDate, string $endDate): array
    {
        $stmt = $this->db->prepare('
            SELECT 
                DATE(created_at) as date,
                type,
                COUNT(*) as count,
                AVG(file_size) as avg_size,
                SUM(file_size) as total_size
            FROM assets 
            WHERE tenant_id = ? AND DATE(created_at) BETWEEN ? AND ?
            GROUP BY DATE(created_at), type
            ORDER BY date ASC
        ');
        
        $stmt->execute([$tenantId, $startDate, $endDate]);
        return $stmt->fetchAll();
    }

    private function getDetailedFilterStats(string $tenantId, string $startDate, string $endDate): array
    {
        $stmt = $this->db->prepare('
            SELECT 
                f.id,
                f.name,
                f.display_name,
                f.category,
                DATE(s.created_at) as date,
                COUNT(sf.filter_id) as usage_count
            FROM filters f
            LEFT JOIN session_filters sf ON f.id = sf.filter_id
            LEFT JOIN sessions s ON sf.session_id = s.id
            WHERE f.tenant_id = ? AND DATE(s.created_at) BETWEEN ? AND ?
            GROUP BY f.id, f.name, f.display_name, f.category, DATE(s.created_at)
            ORDER BY date ASC, usage_count DESC
        ');
        
        $stmt->execute([$tenantId, $startDate, $endDate]);
        return $stmt->fetchAll();
    }

    private function jsonResponse(ResponseInterface $response, array $data, int $status = 200): ResponseInterface
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
