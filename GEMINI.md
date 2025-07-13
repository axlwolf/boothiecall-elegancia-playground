# GEMINI.md

This file provides guidance to Google Gemini when working on the admin interface and backend management features for this repository.

## Project Overview

BoothieCall Elegancia Playground is a sophisticated web-based photobooth application. Your role is to develop the **admin interface and management system** for controlling assets, users, configuration, and analytics while maintaining the existing Elegancia Nocturna design system.

## Development Commands

### Core Commands
- `npm run dev` - Start development server (port 8080, accessible on all interfaces)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally

### Testing
No test framework is currently configured. When adding tests for admin features, implement a comprehensive testing strategy covering authentication, data validation, and CRUD operations.

## Admin System Architecture

### Your Responsibilities
You will develop the complete admin interface including:
- **Asset Management** - Upload/manage logos, design templates, background images
- **Filter Management** - Create/edit/delete photo filters and effects
- **Design Management** - Manage photo strip templates and layouts
- **User Management** - User roles, permissions, authentication
- **Output Format Management** - Configure export options (PNG, GIF, print formats)
- **Multi-tenant Support** - Multiple client/organization management
- **Analytics Dashboard** - Usage statistics, popular filters, session data
- **Configuration Panel** - App settings, branding, feature toggles

### Proposed Admin Architecture

**Authentication & Authorization:**
- JWT-based authentication system
- Role-based access control (Super Admin, Tenant Admin, Editor, Viewer)
- Multi-tenant session management
- Protected admin routes with middleware

**Data Management:**
- RESTful API endpoints for all admin operations
- Database schema for assets, users, tenants, analytics
- File upload system for images and assets
- Data validation and sanitization

**Admin Interface Structure:**
```
/admin
├── /dashboard          # Analytics overview
├── /assets            # Asset management (logos, images)
├── /filters           # Filter management
├── /designs           # Design template management
├── /users             # User management
├── /tenants           # Multi-tenant management
├── /formats           # Output format configuration
├── /analytics         # Detailed analytics
├── /settings          # App configuration
└── /profile           # Admin profile management
```

## Current Frontend Architecture (Reference)

### Tech Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** with custom Elegancia Nocturna design system
- **shadcn/ui** components built on Radix UI
- **React Router** for navigation
- **TanStack Query** for state management
- **gifshot** library for GIF creation
- **MediaRecorder API** for motion capture

### Current Application Flow (User-Facing)
The main app follows a 5-step workflow:
1. **Landing** - Welcome page with branding
2. **Layout Selection** - Choose photo strip layout (1, 3, 4, or 6 shots)
3. **Camera Capture** - Take photos with countdown timer and GIF recording
4. **Filter Selection** - Apply filters to individual photos or all at once
5. **Final Result** - Display and download photo strips (PNG/GIF)

### Design System Integration

**Elegancia Nocturna Theme (Maintain Consistency):**
- Luxury dark theme with sophisticated gold accents (#D8AE48)
- Custom fonts: Cinzel (headings) and Montserrat (body)
- Extensive custom Tailwind configuration in `tailwind.config.ts`
- CSS custom properties in `src/index.css` for theming
- Gallery background system with collage effects

**Admin UI Guidelines:**
- Extend the existing design system for admin interfaces
- Use sophisticated data tables and forms
- Implement dark theme admin dashboards
- Maintain gold accent colors throughout admin UI
- Ensure responsive design for admin panel

## Backend Integration Strategy

### Recommended Tech Stack for Admin Backend
- **Database**: PostgreSQL or MongoDB for multi-tenant data
- **Backend Framework**: Node.js with Express/Fastify or Next.js API routes
- **Authentication**: JWT with refresh tokens, role-based permissions
- **File Storage**: AWS S3 or similar for asset management
- **Analytics**: Custom analytics tables or integration with analytics services

### Database Schema Considerations

**Core Entities:**
```sql
tenants (id, name, domain, settings, created_at)
users (id, tenant_id, email, role, permissions, created_at)
assets (id, tenant_id, type, filename, url, metadata)
filters (id, tenant_id, name, css_properties, is_active)
designs (id, tenant_id, layout_type, template_data, frame_mappings)
sessions (id, tenant_id, layout_id, photos_count, created_at)
analytics (id, tenant_id, event_type, metadata, timestamp)
```

### API Endpoints Structure
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/admin/dashboard
GET    /api/admin/tenants
POST   /api/admin/tenants
GET    /api/admin/assets
POST   /api/admin/assets/upload
GET    /api/admin/filters
POST   /api/admin/filters
GET    /api/admin/designs
POST   /api/admin/designs
GET    /api/admin/users
POST   /api/admin/users
GET    /api/admin/analytics
```

## Development Guidelines

### Admin Feature Development Process
1. **Design First**: Create wireframes/mockups maintaining Elegancia Nocturna aesthetic
2. **Data Modeling**: Design database schema for multi-tenant architecture
3. **API Development**: Build RESTful endpoints with proper validation
4. **Frontend Implementation**: Build React components using existing UI library
5. **Integration Testing**: Ensure admin changes reflect in user-facing app
6. **Security Review**: Implement proper authentication and authorization

### Code Organization for Admin
```
src/
├── admin/                 # Admin-specific code
│   ├── components/       # Admin UI components
│   ├── pages/           # Admin page components
│   ├── hooks/           # Admin-specific hooks
│   ├── services/        # API services for admin
│   └── types/           # Admin TypeScript types
├── api/                  # Backend API routes (if using Next.js)
├── components/          # Existing user-facing components
└── ...existing structure
```

### Security Considerations
- Implement proper CSRF protection
- Validate all file uploads (type, size, content)
- Sanitize user inputs to prevent XSS
- Use parameterized queries to prevent SQL injection
- Implement rate limiting for API endpoints
- Audit trail for all admin actions

### Multi-Tenant Considerations
- Tenant isolation at database level
- Subdomain or path-based tenant routing
- Tenant-specific asset storage and access
- Cross-tenant data prevention
- Tenant usage quotas and billing integration

## Integration with Existing App

### Asset Management Integration
- Dynamically load tenant-specific logos and designs
- Real-time filter updates without app restart
- Tenant-specific branding and color schemes
- Asset versioning and rollback capabilities

### Analytics Integration
- Track user sessions and photo creation events
- Monitor filter usage and popular layouts
- Performance metrics and error tracking
- Export capabilities for reporting

### Configuration Management
- Feature flags for A/B testing
- Tenant-specific app configurations
- Output format customization per tenant
- Branding customization interface

## Common Admin Workflows

**Asset Management:**
1. Upload new design templates or logos
2. Organize assets by tenant and category
3. Preview assets before publishing
4. Version control for asset updates

**Filter Management:**
1. Create new CSS-based filters
2. Test filters with sample images
3. Organize filters by categories
4. Enable/disable filters per tenant

**User Management:**
1. Invite new admin users
2. Assign roles and permissions
3. Monitor user activity and sessions
4. Deactivate or remove users

**Analytics Management:**
1. Generate usage reports by date range
2. Track popular features and filters
3. Monitor system performance metrics
4. Export data for external analysis

When implementing admin features, ensure they integrate seamlessly with the existing photobooth functionality while maintaining the sophisticated Elegancia Nocturna design aesthetic.