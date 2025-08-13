-- Supabase (PostgreSQL) Schemas for BoothieCall Elegancia Playground

-- Table: tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Placeholder for hashed password
    role VARCHAR(50) NOT NULL, -- e.g., 'Super Admin', 'Tenant Admin', 'Editor', 'Viewer'
    permissions TEXT[] DEFAULT '{}'::TEXT[], -- Array of permission strings
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: assets
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'Image', 'Logo', 'Design Template'
    filename VARCHAR(255) NOT NULL,
    url TEXT NOT NULL, -- URL to the stored asset (e.g., S3 URL)
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata (e.g., dimensions, original_name)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: filters
CREATE TABLE filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    css_properties TEXT NOT NULL, -- CSS filter properties string
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: designs
CREATE TABLE designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    layout_type VARCHAR(50) NOT NULL, -- e.g., '1-shot', '3-shot', '4-shot', '6-shot'
    template_data JSONB DEFAULT '{}'::jsonb, -- Full template configuration (e.g., background, overlays)
    frame_mappings JSONB NOT NULL, -- JSON array of frame coordinates
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: sessions (for user-facing photobooth sessions)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL, -- Can be NULL if session is not tied to a specific tenant
    layout_id VARCHAR(255) NOT NULL, -- Reference to the layout used (e.g., '4-shot')
    photos_count INTEGER NOT NULL,
    duration_seconds INTEGER,
    final_image_url TEXT, -- URL to the final generated photo strip
    gif_url TEXT, -- URL to the generated GIF (if any)
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional session data (e.g., filters applied, template used)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: analytics
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- e.g., 'session_start', 'photo_captured', 'filter_applied', 'download_png', 'download_gif'
    event_data JSONB DEFAULT '{}'::jsonb, -- Contextual data for the event
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_assets_tenant_id ON assets(tenant_id);
CREATE INDEX idx_filters_tenant_id ON filters(tenant_id);
CREATE INDEX idx_designs_tenant_id ON designs(tenant_id);
CREATE INDEX idx_sessions_tenant_id ON sessions(tenant_id);
CREATE INDEX idx_analytics_tenant_id ON analytics(tenant_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp);
