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

## Admin Panel (GEMINI Implementation)

The admin panel provides comprehensive content management and analytics:

### Admin Architecture
- **Authentication:** JWT-based auth with localStorage persistence
- **Routing:** Protected routes with automatic redirect on unauthorized access
- **State Management:** TanStack Query for server state, React Context for auth
- **UI Framework:** shadcn/ui components with custom admin styling

### Admin Features
- **Dashboard:** Overview with key metrics, recent activity, and quick actions
- **Analytics:** Session tracking, user behavior analysis, usage statistics
- **User Management:** CRUD operations for user accounts with role-based access
- **Asset Management:** Template and design management with file upload
- **Settings:** System configuration, output formats, tenant management
- **Data Tables:** Advanced filtering, sorting, pagination with export capabilities

### Admin Services
- `src/admin/services/apiClient.ts` - Axios client with auth interceptors
- `src/admin/services/authService.ts` - Authentication and user management
- `src/admin/services/analyticsService.ts` - Analytics data processing
- `src/admin/services/userService.ts` - User CRUD operations
- `src/admin/services/tenantService.ts` - Multi-tenant support
- `src/admin/services/outputFormatService.ts` - Export format management

### Admin Components
- `src/admin/components/AdminLayout.tsx` - Admin shell with navigation
- `src/admin/components/DataTable.tsx` - Reusable data table with advanced features
- `src/admin/pages/` - Individual admin pages (Dashboard, Analytics, Settings, etc.)

### Environment Variables for Admin
- `VITE_API_URL` - API base URL (automatically falls back to '/api')
- Admin auth tokens stored in localStorage as 'authToken'

### Admin Development Notes
- Uses Vite environment variables (`import.meta.env` not `process.env`)
- Implements automatic localStorage quota handling via HybridStorageService
- Real-time updates using TanStack Query with background refetching
- Responsive design optimized for desktop admin workflows