# BoothieCall Backend Architecture - Milestone 6

## 🎯 **Overview**
This document outlines the backend architecture for BoothieCall Elegancia Playground, designed to support the existing frontend with a robust, scalable API infrastructure.

## 🏗️ **Architecture Stack**

### **Core Technologies**
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with Helmet security middleware
- **Database**: PostgreSQL 15+ (primary) + Redis (caching/sessions)
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 compatible (MinIO for development)
- **API Documentation**: OpenAPI 3.0 with Swagger UI
- **Testing**: Jest + Supertest
- **Deployment**: Docker containers with Docker Compose

### **Project Structure**
```
boothiecall-backend/
├── src/
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Custom middleware
│   ├── models/              # Database models (Prisma)
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic
│   ├── utils/               # Helper functions
│   ├── types/               # TypeScript definitions
│   └── config/              # Configuration files
├── prisma/                  # Database schema and migrations
├── tests/                   # Test files
├── docker/                  # Docker configuration
├── docs/                    # API documentation
└── scripts/                 # Utility scripts
```

## 🗄️ **Database Schema Design**

### **Core Entities**

#### **Users & Authentication**
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    tenant_id UUID REFERENCES tenants(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tenants table (multi-tenant support)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User roles enum
CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'editor', 'viewer');
```

#### **Assets & Media**
```sql
-- Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    type asset_type NOT NULL,
    category VARCHAR(100),
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Asset types enum
CREATE TYPE asset_type AS ENUM ('template', 'filter', 'font', 'image', 'icon');

-- Asset versions for rollback support
CREATE TABLE asset_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Photo Sessions & Analytics**
```sql
-- Photo sessions
CREATE TABLE photo_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    session_token VARCHAR(255) UNIQUE,
    layout_type VARCHAR(50) NOT NULL,
    template_id UUID REFERENCES assets(id),
    photos JSONB NOT NULL DEFAULT '[]',
    filters_applied JSONB DEFAULT '{}',
    final_output_url TEXT,
    gif_output_url TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id UUID REFERENCES photo_sessions(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 **API Endpoints Specification**

### **Authentication Endpoints**
```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
  tenant?: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

// POST /api/auth/logout
interface LogoutRequest {
  refreshToken: string;
}
```

### **Asset Management Endpoints**
```typescript
// GET /api/assets
interface AssetListQuery {
  type?: AssetType;
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// POST /api/assets
interface CreateAssetRequest {
  name: string;
  type: AssetType;
  category?: string;
  file: File; // multipart/form-data
  metadata?: Record<string, any>;
}

// PUT /api/assets/:id
interface UpdateAssetRequest {
  name?: string;
  category?: string;
  metadata?: Record<string, any>;
  file?: File; // optional file update
}

// GET /api/assets/:id/versions
interface AssetVersionsResponse {
  versions: AssetVersion[];
  current: number;
}

// POST /api/assets/:id/rollback/:version
interface RollbackAssetRequest {
  version: number;
}
```

### **Photo Session Endpoints**
```typescript
// POST /api/sessions
interface CreateSessionRequest {
  layoutType: '1shot' | '3shot' | '4shot' | '6shot';
  templateId?: string;
}

interface CreateSessionResponse {
  sessionId: string;
  sessionToken: string;
  expiresAt: string;
}

// PUT /api/sessions/:id/photos
interface UpdatePhotosRequest {
  photos: PhotoData[];
  filters?: Record<string, string>;
}

// POST /api/sessions/:id/generate
interface GenerateOutputRequest {
  format: 'png' | 'gif' | 'both';
  quality?: number;
}

interface GenerateOutputResponse {
  pngUrl?: string;
  gifUrl?: string;
  downloadUrls: {
    png?: string;
    gif?: string;
  };
}
```

### **Analytics Endpoints**
```typescript
// GET /api/analytics/dashboard
interface AnalyticsDashboardQuery {
  startDate?: string;
  endDate?: string;
  tenant?: string;
}

interface AnalyticsDashboardResponse {
  totalSessions: number;
  totalPhotos: number;
  popularLayouts: LayoutStats[];
  popularFilters: FilterStats[];
  dailyStats: DailyStats[];
  realtimeStats: RealtimeStats;
}

// POST /api/analytics/events
interface TrackEventRequest {
  eventType: string;
  eventData?: Record<string, any>;
  sessionId?: string;
}
```

## 🔐 **Security Implementation**

### **Authentication & Authorization**
- JWT tokens with 15-minute expiry
- Refresh tokens with 7-day expiry
- Role-based access control (RBAC)
- Multi-tenant isolation
- Rate limiting per endpoint
- CORS configuration for frontend domains

### **Data Protection**
- Input validation with Joi/Zod
- SQL injection prevention (Prisma ORM)
- XSS protection with Helmet
- File upload validation and scanning
- Encrypted sensitive data at rest
- HTTPS enforcement in production

### **File Security**
- Virus scanning for uploaded files
- File type validation
- Size limits per asset type
- Secure file naming and storage
- CDN integration for public assets

## 🚀 **Deployment Strategy**

### **Development Environment**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/boothiecall_dev
    volumes:
      - ./src:/app/src
    depends_on:
      - db
      - redis
      - minio

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: boothiecall_dev
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
```

### **Production Deployment**
- Docker containers with multi-stage builds
- Kubernetes deployment with auto-scaling
- Load balancer with SSL termination
- Database connection pooling
- Redis cluster for session storage
- AWS S3 for file storage
- CloudFront CDN for asset delivery
- Monitoring with Prometheus + Grafana

## 📊 **Performance Considerations**

### **Database Optimization**
- Proper indexing strategy
- Connection pooling
- Read replicas for analytics
- Partitioning for large tables
- Query optimization and monitoring

### **Caching Strategy**
- Redis for session storage
- API response caching
- Asset metadata caching
- Database query result caching
- CDN for static assets

### **File Processing**
- Asynchronous image processing
- Queue system for heavy operations
- Image optimization and compression
- Multiple format generation
- Progressive loading support

## 🧪 **Testing Strategy**

### **Test Types**
- Unit tests for services and utilities
- Integration tests for API endpoints
- End-to-end tests for critical flows
- Load testing for performance validation
- Security testing for vulnerabilities

### **Test Coverage**
- Minimum 80% code coverage
- Critical path 100% coverage
- Database transaction testing
- File upload/download testing
- Authentication flow testing

## 📈 **Monitoring & Logging**

### **Application Monitoring**
- Health check endpoints
- Performance metrics collection
- Error tracking and alerting
- User activity monitoring
- Resource usage tracking

### **Logging Strategy**
- Structured logging with Winston
- Log levels: error, warn, info, debug
- Request/response logging
- Security event logging
- Performance bottleneck logging

## 🔄 **Migration Strategy**

### **Frontend Integration**
1. **Phase 1**: Mock service replacement
2. **Phase 2**: Authentication integration
3. **Phase 3**: Asset management migration
4. **Phase 4**: Photo session backend
5. **Phase 5**: Analytics implementation
6. **Phase 6**: Full production deployment

### **Data Migration**
- Export existing mock data
- Transform to new schema
- Validate data integrity
- Gradual rollout strategy
- Rollback procedures

## 📋 **Implementation Timeline**

### **Week 1-2: Foundation**
- Project setup and configuration
- Database schema implementation
- Basic authentication system
- Docker development environment

### **Week 3-4: Core APIs**
- Asset management endpoints
- Photo session management
- File upload/storage system
- Basic security implementation

### **Week 5-6: Advanced Features**
- Analytics system
- Admin panel APIs
- Performance optimization
- Comprehensive testing

### **Week 7-8: Integration & Deployment**
- Frontend integration
- Production deployment setup
- Performance testing
- Security audit
- Documentation completion

This architecture provides a solid foundation for scaling BoothieCall while maintaining the elegant user experience of the frontend application.
