-- BoothieCall Elegancia API - MySQL Database Schema
-- Compatible with GoDaddy MySQL hosting

SET FOREIGN_KEY_CHECKS = 0;

-- Tenants table for multi-tenancy
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    settings JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tenants_domain (domain),
    INDEX idx_tenants_subdomain (subdomain),
    INDEX idx_tenants_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table with role-based access control
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN', 'TENANT_ADMIN', 'EDITOR', 'VIEWER') DEFAULT 'VIEWER',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    tenant_id VARCHAR(36) NOT NULL,
    
    INDEX idx_users_email (email),
    INDEX idx_users_tenant (tenant_id),
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assets table for managing uploaded files
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INT UNSIGNED NOT NULL,
    path VARCHAR(500) NOT NULL,
    url VARCHAR(500),
    type ENUM('LOGO', 'BACKGROUND', 'TEMPLATE', 'FRAME', 'WATERMARK', 'OTHER') NOT NULL,
    category VARCHAR(100),
    metadata JSON,
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    tenant_id VARCHAR(36) NOT NULL,
    created_by_id VARCHAR(36) NOT NULL,
    
    INDEX idx_assets_tenant (tenant_id),
    INDEX idx_assets_type (type),
    INDEX idx_assets_category (category),
    INDEX idx_assets_active (is_active),
    INDEX idx_assets_created_by (created_by_id),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Filters table for photo effects
CREATE TABLE IF NOT EXISTS filters (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    css_filter TEXT NOT NULL,
    settings JSON,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    tenant_id VARCHAR(36) NOT NULL,
    created_by_id VARCHAR(36) NOT NULL,
    
    INDEX idx_filters_tenant (tenant_id),
    INDEX idx_filters_category (category),
    INDEX idx_filters_active (is_active),
    INDEX idx_filters_sort (sort_order),
    INDEX idx_filters_created_by (created_by_id),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Photo sessions table
CREATE TABLE IF NOT EXISTS photo_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    layout VARCHAR(10) NOT NULL, -- "1", "3", "4", "6"
    template VARCHAR(255),
    status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED') DEFAULT 'ACTIVE',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    tenant_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36), -- Optional for anonymous sessions
    asset_id VARCHAR(36), -- Background/template asset
    
    INDEX idx_sessions_tenant (tenant_id),
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_status (status),
    INDEX idx_sessions_layout (layout),
    INDEX idx_sessions_session_id (session_id),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Photos table for individual photos in a session
CREATE TABLE IF NOT EXISTS photos (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    path VARCHAR(500) NOT NULL,
    url VARCHAR(500),
    position INT NOT NULL, -- Position in the layout (0, 1, 2, etc.)
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    session_id VARCHAR(36) NOT NULL,
    
    INDEX idx_photos_session (session_id),
    INDEX idx_photos_position (position),
    
    FOREIGN KEY (session_id) REFERENCES photo_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session filters junction table
CREATE TABLE IF NOT EXISTS session_filters (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    photo_position INT, -- NULL means applied to all photos
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    session_id VARCHAR(36) NOT NULL,
    filter_id VARCHAR(36) NOT NULL,
    
    INDEX idx_session_filters_session (session_id),
    INDEX idx_session_filters_filter (filter_id),
    INDEX idx_session_filters_position (photo_position),
    
    UNIQUE KEY unique_session_filter_position (session_id, filter_id, photo_position),
    
    FOREIGN KEY (session_id) REFERENCES photo_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (filter_id) REFERENCES filters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session outputs table (final generated images/GIFs)
CREATE TABLE IF NOT EXISTS session_outputs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    filename VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    url VARCHAR(500),
    format ENUM('PNG', 'JPEG', 'GIF', 'PDF') NOT NULL,
    size INT UNSIGNED NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    session_id VARCHAR(36) NOT NULL,
    
    INDEX idx_outputs_session (session_id),
    INDEX idx_outputs_format (format),
    
    FOREIGN KEY (session_id) REFERENCES photo_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics table for tracking usage
CREATE TABLE IF NOT EXISTS analytics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    event VARCHAR(255) NOT NULL, -- "session_created", "photo_taken", "filter_applied", etc.
    data JSON,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    tenant_id VARCHAR(36) NOT NULL,
    
    INDEX idx_analytics_tenant (tenant_id),
    INDEX idx_analytics_event (event),
    INDEX idx_analytics_created (created_at),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Insert default tenant
INSERT IGNORE INTO tenants (id, name, domain, subdomain, is_active) 
VALUES ('default-tenant-id', 'Default Tenant', 'localhost', 'default', TRUE);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (id, email, username, first_name, last_name, password, role, tenant_id) 
VALUES (
    'default-admin-id', 
    'admin@boothiecall.net', 
    'admin', 
    'Admin', 
    'User', 
    '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqyc6/8.ykzxkMy8Ug8mi4S', -- admin123
    'SUPER_ADMIN', 
    'default-tenant-id'
);

-- Insert default filters
INSERT IGNORE INTO filters (id, name, display_name, description, category, css_filter, tenant_id, created_by_id) VALUES
('filter-noir', 'noir', 'Noir', 'Classic black and white effect', 'Classic', 'grayscale(100%) contrast(1.2)', 'default-tenant-id', 'default-admin-id'),
('filter-vintage', 'vintage', 'Vintage', 'Warm vintage look', 'Vintage', 'sepia(0.8) saturate(1.4) contrast(0.9)', 'default-tenant-id', 'default-admin-id'),
('filter-glam', 'glam', 'Glam', 'High contrast glamour', 'Glamour', 'contrast(1.3) brightness(1.1) saturate(1.2)', 'default-tenant-id', 'default-admin-id'),
('filter-cool', 'cool', 'Cool', 'Cool blue tones', 'Modern', 'hue-rotate(180deg) saturate(1.1)', 'default-tenant-id', 'default-admin-id'),
('filter-warm', 'warm', 'Warm', 'Warm orange tones', 'Modern', 'hue-rotate(15deg) saturate(1.2) brightness(1.05)', 'default-tenant-id', 'default-admin-id');
