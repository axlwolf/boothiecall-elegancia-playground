# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BoothieCall Elegancia Playground is a sophisticated web-based photobooth application featuring the "Elegancia Nocturna" design system. The app provides a multi-step workflow for creating professional photo strips with luxury dark aesthetics and gold accents.

## Development Commands

### Core Commands
- `npm run dev` - Start development server (port 8080, accessible on all interfaces)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally

### Testing
No test framework is currently configured. When adding tests, check with the user for their preferred testing approach.

## Architecture Overview

### Tech Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** with custom Elegancia Nocturna design system
- **shadcn/ui** components built on Radix UI
- **React Router** for navigation
- **TanStack Query** for state management
- **gifshot** library for GIF creation
- **MediaRecorder API** for motion capture

### Core Application Flow
The app follows a state machine pattern with 5 main steps:
1. **Landing** (`src/components/Landing.tsx`) - Welcome page with branding
2. **Layout Selection** (`src/components/LayoutSelection.tsx`) - Choose photo strip layout (1, 3, 4, or 6 shots)
3. **Camera Capture** (`src/components/CameraCapture.tsx`) - Take photos with countdown timer and GIF recording
4. **Filter Selection** (`src/components/FilterSelection.tsx`) - Apply filters to individual photos or all at once
5. **Final Result** (`src/components/FinalResult.tsx`) - Display and download photo strips (PNG/GIF)

### Key Components Architecture

**Main Orchestrator:**
- `src/components/Photobooth.tsx` - Central state machine managing the 5-step workflow

**Layout & Routing:**
- `src/App.tsx` - App shell with providers (QueryClient, TooltipProvider, Router)
- `src/components/AppLayout.tsx` - Main layout wrapper with gallery background
- `src/pages/Index.tsx` - Main page component

**Core Features:**
- Camera integration with real-time preview and countdown
- Filter system with 15+ effects and individual/bulk application
- GIF recording during photo sessions for animated strips
- Smart image cropping and frame overlay system
- Responsive design optimized for mobile and desktop

### Design System

**Elegancia Nocturna Theme:**
- Luxury dark theme with sophisticated gold accents (#D8AE48)
- Custom fonts: Cinzel (headings) and Montserrat (body)
- Extensive custom Tailwind configuration in `tailwind.config.ts`
- CSS custom properties in `src/index.css` for theming
- Gallery background system with collage effects

**UI Components:**
- Complete shadcn/ui component library in `src/components/ui/`
- Custom animations and transitions for premium feel
- Responsive pagination controls and interactive elements

### State Management Patterns

**Component State:**
- Each step component manages its own local state
- `Photobooth.tsx` coordinates overall application state
- Props-based communication between parent and child components

**Session Storage (Hybrid Storage System):**
- `HybridStorageService` (`src/lib/hybridStorage.ts`) - Intelligent storage with automatic fallback
- Starts with localStorage for speed, falls back to IndexedDB when quota exceeded
- Automatic data migration between storage systems
- Supports up to 50 recent sessions with automatic cleanup
- Session history, statistics, and export/import functionality

**Types & Interfaces:**
- `Layout` interface for photo strip configurations
- `CapturedPhoto` interface for photo data with metadata
- `PhotoSession` interface for complete session data with metadata
- TypeScript configured with relaxed settings (no strict null checks)

### File Structure Notes

**Assets:** Static images in `src/assets/` including hero gallery background
**Hooks:** Custom React hooks in `src/hooks/` (mobile detection, toast)
**Services:** Core services in `src/lib/` including storage, template, and filter systems
**Utils:** Utility functions in `src/lib/utils.ts` (cn helper for class merging)
**Configuration:** Vite configured for path aliases (`@` -> `src`)

**Admin Panel:** Complete admin interface for content management
- `src/admin/` - Full admin dashboard with analytics, user management, and settings
- Authentication system with JWT tokens
- Data tables with sorting, filtering, and pagination
- Asset management for templates and designs
- User analytics and session tracking

### Development Guidelines

**Code Style:**
- ESLint configured with React hooks and TypeScript rules
- Unused variables warnings disabled for development convenience
- React Refresh enabled for fast development

**Browser APIs:**
- MediaRecorder for GIF capture
- Camera access via getUserMedia
- Canvas for image processing and compositing
- IndexedDB for large data storage (automatic fallback)
- localStorage for session data (primary storage)

### Important Implementation Details

**Photo Processing:**
- Frame mapping system for precise photo positioning in strips
- Smart aspect ratio preservation during cropping
- High-quality output suitable for printing
- Border radius support for rounded photo frames

**GIF System:**
- Motion capture during photo sessions
- Frame-by-frame processing with design overlays
- Cross-browser compatibility optimizations

**Responsive Design:**
- Mobile-first approach with touch-friendly interfaces
- Adaptive camera viewport handling
- Smart pagination that hides when not needed

**Storage System:**
- Hybrid storage automatically handles localStorage quota limits
- Seamless fallback to IndexedDB for unlimited storage capacity
- Session data includes photos, metadata, filters, and user analytics
- Export/import functionality for backup and data portability

## Common Workflows

When adding new features:
1. Follow existing component patterns in the main workflow components
2. Use the established TypeScript interfaces for photo and layout data
3. Maintain the Elegancia Nocturna design system consistency
4. Test camera functionality across different devices/browsers

When modifying the design system:
1. Update CSS custom properties in `src/index.css` first
2. Extend Tailwind configuration in `tailwind.config.ts` if needed
3. Ensure gold accent colors (#D8AE48) remain consistent
4. Test responsive behavior on mobile devices

## Admin Panel (Implemented by Gemini) ✅

### Admin System Architecture (Frontend Implementation Complete with Mock Services) ✅

**Authentication & Authorization:** ✅
- JWT-based authentication system with localStorage persistence
- Role-based access control (Super Admin, Tenant Admin, Editor, Viewer)
- Multi-tenant session management
- Protected admin routes with automatic redirect on unauthorized access

**Data Management (Frontend with Mock Services):** ✅
- RESTful API endpoints for all admin operations (currently interacting with in-memory mock data)
- Complete CRUD operations for assets, users, tenants, analytics (on mock data)
- Advanced data tables with filtering, sorting, and pagination
- Comprehensive data validation and sanitization

**Frontend Persistence (localStorage/IndexedDB/Cache API):** ✅
- HybridStorageService with automatic localStorage to IndexedDB fallback
- Handles storage quota exceeded errors seamlessly
- Session data migration and automatic cleanup
- Export/import functionality for data portability

**Admin Interface Structure:** ✅ COMPLETED
```
/admin
├── /dashboard          # ✅ Analytics overview with metrics and charts
├── /assets            # ✅ Asset management (logos, images) 
├── /filters           # ✅ Filter management with CRUD operations
├── /designs           # ✅ Design template management
├── /users             # ✅ User management with roles and permissions
├── /tenants           # ✅ Multi-tenant management
├── /formats           # ✅ Output format configuration
├── /analytics         # ✅ Detailed analytics with charts and insights
├── /settings          # ✅ App configuration and branding
└── /login             # ✅ Authentication interface
```

### Implemented Components & Services (Frontend with Mock Services) ✅

**Admin Components:** (`src/admin/components/`)
- `AdminLayout.tsx` - Responsive admin shell with mobile navigation
- `DataTable.tsx` - Advanced data table with sorting, filtering, pagination
- `DailySessionsChart.tsx` - Analytics visualization
- `PopularFiltersChart.tsx` - Filter usage analytics
- `LayoutUsageChart.tsx` - Layout popularity tracking
- Complete CRUD dialogs for all entities (Add/Edit/Delete)

**Admin Services:** (`src/admin/services/`)
- `authService.ts` - Authentication and user management (mocked)
- `analyticsService.ts` - Analytics data processing and visualization (mocked)
- `userService.ts` - User CRUD operations (mocked)
- `tenantService.ts` - Multi-tenant support (mocked)
- `outputFormatService.ts` - Export format management (mocked)
- `assetService.ts` - Asset management (mocked)

**Admin Pages:** (`src/admin/pages/`)
- `Dashboard.tsx` - Overview with key metrics and recent activity
- `Analytics.tsx` - Comprehensive analytics with responsive charts
- `Settings.tsx` - System configuration with branding controls
- Individual management pages for Assets, Users, Tenants, etc.

## Recent Bug Fixes & Improvements ✅

### Storage System Fixes
- **QuotaExceededError Resolution**: Implemented `HybridStorageService` to automatically fallback from localStorage to IndexedDB when storage quota is exceeded
- **Data Migration**: Seamless migration of existing session data when switching storage systems
- **Session Management**: Enhanced session storage with automatic cleanup and capacity management

### Environment & Import Fixes  
- **React Hook Imports**: Added missing `useCallback` import in `PrintPreview.tsx`
- **Async Storage Methods**: Updated all storage operations to async/await pattern for better performance

### Admin Panel Enhancements
- **Responsive Design**: Improved mobile navigation and responsive layouts
- **Data Tables**: Enhanced with overflow handling and better mobile experience
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Authentication Flow**: Robust JWT handling with automatic token refresh

### Documentation & Tracking
- **Architecture Updates**: Updated both `CLAUDE.md` and `GEMINI.md` with implemented features
- **Code Quality**: Improved TypeScript usage and component patterns

## Implementation Status: COMPLETE ✅

The admin system has been fully implemented and integrated with the main application. All major features are working, including:
- Full CRUD operations for all entities
- Advanced analytics and reporting
- Responsive design for all screen sizes
- Robust error handling and storage management
- Comprehensive authentication and authorization

When implementing additional admin features, ensure they integrate seamlessly with the existing photobooth functionality while maintaining the sophisticated Elegancia Nocturna design aesthetic.