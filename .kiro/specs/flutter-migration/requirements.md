# Requirements Document - Flutter Migration

## Introduction

Este documento define los requerimientos para migrar la aplicación BoothieCall Elegancia de React (web) a Dart/Flutter, creando una aplicación multiplataforma (iOS, Android, Web) que mantenga todas las funcionalidades existentes y el sistema de diseño Elegancia Nocturna.

## Contexto del Proyecto Actual

### Stack Actual (React PWA)

- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: PHP 8.1 + Slim Framework 4 + MySQL
- Diseño: Elegancia Nocturna (tema oscuro + oro #D8AE48)
- Funcionalidades: Captura de fotos, filtros CSS, GIF, photo strips, admin panel

### Funcionalidades Core a Migrar

- Captura de fotos con cámara en tiempo real
- 15+ filtros de imagen
- Generación de photo strips (1, 3, 4, 6 fotos)
- Creación de GIF animados
- Sistema de plantillas de diseño
- Panel de administración completo
- Almacenamiento híbrido (local + cloud)
- PWA con funcionalidad offline

## Requirements

### Requirement 1: Flutter Project Architecture

**User Story:** Como arquitecto de software, quiero una estructura de proyecto Flutter bien organizada con clean architecture, para que el código sea mantenible, testeable y escalable.

#### Acceptance Criteria

1. WHEN the project is created THEN it SHALL use Flutter 3.x with Dart 3.x and null safety
2. WHEN organizing code THEN it SHALL follow clean architecture (presentation, domain, data layers)
3. WHEN managing state THEN it SHALL use Riverpod or BLoC pattern consistently
4. WHEN navigating THEN it SHALL use GoRouter for declarative routing
5. WHEN managing dependencies THEN it SHALL use dependency injection with get_it or riverpod
6. WHEN building THEN it SHALL compile for iOS, Android, and Web platforms

### Requirement 2: Elegancia Nocturna Design System Migration

**User Story:** Como diseñador, quiero que el sistema de diseño Elegancia Nocturna se replique fielmente en Flutter, para mantener la identidad visual premium de la aplicación.

#### Acceptance Criteria

1. WHEN rendering the UI THEN it SHALL use the luxury dark theme with gold accents (#D8AE48)
2. WHEN displaying text THEN it SHALL use Cinzel (headings) and Montserrat (body) fonts
3. WHEN animating elements THEN it SHALL replicate CSS animations using Flutter's animation framework
4. WHEN adapting to screens THEN it SHALL be responsive across mobile, tablet, and desktop
5. WHEN theming THEN it SHALL support ThemeData with custom color schemes and typography
6. WHEN displaying the landing page THEN it SHALL include animated hero section and gallery background

### Requirement 3: Camera and Photo Capture System

**User Story:** Como usuario, quiero capturar fotos con la cámara del dispositivo con la misma calidad y experiencia que la versión web, para crear photo strips profesionales.

#### Acceptance Criteria

1. WHEN accessing the camera THEN it SHALL use the camera plugin for native camera access
2. WHEN capturing photos THEN it SHALL support countdown timer with visual feedback
3. WHEN taking multiple shots THEN it SHALL support layouts of 1, 3, 4, and 6 photos
4. WHEN previewing THEN it SHALL show real-time camera preview with high quality
5. WHEN retaking THEN it SHALL allow retaking individual photos
6. WHEN capturing on web THEN it SHALL fallback to WebRTC/getUserMedia

### Requirement 4: Photo Filter and Processing System

**User Story:** Como usuario, quiero aplicar filtros y editar mis fotos con las mismas herramientas disponibles en la versión web, para personalizar mis photo strips.

#### Acceptance Criteria

1. WHEN applying filters THEN it SHALL support 15+ filter effects equivalent to CSS filters
2. WHEN editing photos THEN it SHALL provide brightness, contrast, saturation, hue controls
3. WHEN transforming THEN it SHALL support rotation and flip (horizontal/vertical)
4. WHEN previewing filters THEN it SHALL show real-time preview on thumbnails
5. WHEN applying to all THEN it SHALL support bulk filter application to all photos
6. WHEN processing images THEN it SHALL use the image package for server-side and GPU shaders for client-side

### Requirement 5: Photo Strip Generation and Export

**User Story:** Como usuario, quiero generar photo strips con plantillas de diseño y exportarlos en múltiples formatos, para compartir y imprimir mis fotos.

#### Acceptance Criteria

1. WHEN generating strips THEN it SHALL compose photos into strip layouts with frame overlays
2. WHEN selecting designs THEN it SHALL offer multiple design templates per layout type
3. WHEN exporting THEN it SHALL support PNG and GIF output formats
4. WHEN downloading THEN it SHALL save to device gallery or share via system share sheet
5. WHEN creating GIFs THEN it SHALL generate animated GIFs from captured sequences
6. WHEN rendering THEN it SHALL use Canvas/CustomPainter for precise photo positioning

### Requirement 6: Backend API Integration

**User Story:** Como desarrollador, quiero que la app Flutter se conecte al backend PHP existente, para mantener la funcionalidad completa sin reescribir el servidor.

#### Acceptance Criteria

1. WHEN making API calls THEN it SHALL use Dio or http package with interceptors
2. WHEN authenticating THEN it SHALL implement JWT token management with refresh flow
3. WHEN handling errors THEN it SHALL provide user-friendly error messages and retry logic
4. WHEN caching THEN it SHALL implement offline-first strategy with local database
5. WHEN syncing THEN it SHALL handle data synchronization between local and remote
6. WHEN managing state THEN it SHALL use repository pattern for data access abstraction

### Requirement 7: Admin Panel Migration

**User Story:** Como administrador, quiero acceder al panel de administración desde la app Flutter, para gestionar activos, usuarios, filtros y analíticas.

#### Acceptance Criteria

1. WHEN accessing admin THEN it SHALL provide role-based access (Super Admin, Tenant Admin, Editor, Viewer)
2. WHEN managing assets THEN it SHALL support upload, CRUD, and preview of design assets
3. WHEN managing filters THEN it SHALL provide filter creation, editing, and categorization
4. WHEN viewing analytics THEN it SHALL display charts and metrics using fl_chart
5. WHEN managing users THEN it SHALL support user CRUD with role assignment
6. WHEN managing tenants THEN it SHALL support multi-tenant configuration

### Requirement 8: Offline and Storage

**User Story:** Como usuario, quiero usar la app sin conexión a internet y que mis datos se sincronicen cuando vuelva a estar online.

#### Acceptance Criteria

1. WHEN offline THEN it SHALL allow photo capture and basic editing
2. WHEN storing data THEN it SHALL use SQLite (drift/sqflite) for structured data
3. WHEN caching images THEN it SHALL use file system cache with size limits
4. WHEN reconnecting THEN it SHALL sync pending operations automatically
5. WHEN managing sessions THEN it SHALL store session history locally
6. WHEN exporting THEN it SHALL work offline for local exports

### Requirement 9: Testing and Quality Assurance

**User Story:** Como QA engineer, quiero una suite de tests completa para garantizar la calidad de la migración.

#### Acceptance Criteria

1. WHEN testing units THEN it SHALL have 80%+ code coverage on business logic
2. WHEN testing widgets THEN it SHALL have widget tests for all main screens
3. WHEN testing integration THEN it SHALL have integration tests for critical flows
4. WHEN testing performance THEN it SHALL meet 60fps rendering on target devices
5. WHEN testing accessibility THEN it SHALL comply with platform accessibility guidelines
6. WHEN testing platforms THEN it SHALL pass tests on iOS, Android, and Web

### Requirement 10: CI/CD and Deployment

**User Story:** Como DevOps, quiero pipelines automatizados para build, test y deploy de la app Flutter en todas las plataformas.

#### Acceptance Criteria

1. WHEN building THEN it SHALL use GitHub Actions for CI/CD pipelines
2. WHEN deploying iOS THEN it SHALL generate IPA and publish to TestFlight/App Store
3. WHEN deploying Android THEN it SHALL generate APK/AAB and publish to Play Store
4. WHEN deploying web THEN it SHALL generate optimized web build for hosting
5. WHEN versioning THEN it SHALL use semantic versioning with automated changelog
6. WHEN testing in CI THEN it SHALL run unit, widget, and integration tests automatically
