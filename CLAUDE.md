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

**Types & Interfaces:**
- `Layout` interface for photo strip configurations
- `CapturedPhoto` interface for photo data with metadata
- TypeScript configured with relaxed settings (no strict null checks)

### File Structure Notes

**Assets:** Static images in `src/assets/` including hero gallery background
**Hooks:** Custom React hooks in `src/hooks/` (mobile detection, toast)
**Utils:** Utility functions in `src/lib/utils.ts` (cn helper for class merging)
**Configuration:** Vite configured for path aliases (`@` -> `src`)

### Development Guidelines

**Code Style:**
- ESLint configured with React hooks and TypeScript rules
- Unused variables warnings disabled for development convenience
- React Refresh enabled for fast development

**Browser APIs:**
- MediaRecorder for GIF capture
- Camera access via getUserMedia
- Canvas for image processing and compositing

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