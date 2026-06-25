# Design Document - Flutter Migration

## Overview

Diseño técnico para migrar BoothieCall Elegancia de React a Flutter, creando una aplicación multiplataforma con clean architecture, manteniendo el backend PHP existente y replicando fielmente el sistema de diseño Elegancia Nocturna.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Flutter App                         │
│                                                     │
│  ┌─────────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Presentation│  │  Domain  │  │    Data      │  │
│  │   (UI)      │──│ (Logic)  │──│ (Repository) │  │
│  │  Screens    │  │ UseCases │  │  API + Local │  │
│  │  Widgets    │  │ Entities │  │  Models      │  │
│  └─────────────┘  └──────────┘  └──────────────┘  │
│         │                              │            │
│         ▼                              ▼            │
│  ┌─────────────┐              ┌──────────────┐     │
│  │   State     │              │   Storage    │     │
│  │ Management  │              │  SQLite +    │     │
│  │ (Riverpod)  │              │  File Cache  │     │
│  └─────────────┘              └──────────────┘     │
│                                       │            │
└───────────────────────────────────────│────────────┘
                                        │
                                        ▼
                               ┌──────────────┐
                               │  Backend PHP │
                               │  (Existing)  │
                               │  REST API    │
                               └──────────────┘
```

### Project Structure

```
boothiecall_flutter/
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── app.dart                    # MaterialApp config
│   │   ├── router.dart                 # GoRouter config
│   │   └── theme/
│   │       ├── elegancia_theme.dart    # ThemeData
│   │       ├── colors.dart             # Color palette
│   │       └── typography.dart         # Font styles
│   ├── core/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── network/
│   │   │   ├── api_client.dart         # Dio HTTP client
│   │   │   ├── api_interceptors.dart   # JWT, logging
│   │   │   └── endpoints.dart
│   │   └── utils/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/                   # Repository impl, models
│   │   │   ├── domain/                 # Entities, use cases
│   │   │   └── presentation/           # Screens, widgets, providers
│   │   ├── landing/
│   │   ├── layout_selection/
│   │   ├── camera_capture/
│   │   ├── filter_selection/
│   │   ├── photo_editor/
│   │   ├── final_result/
│   │   ├── session_history/
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── assets/
│   │       ├── filters/
│   │       ├── users/
│   │       ├── tenants/
│   │       ├── analytics/
│   │       └── settings/
│   └── shared/
│       ├── widgets/                    # Reusable widgets
│       ├── providers/                  # Global providers
│       └── services/                   # Shared services
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
├── assets/
│   ├── fonts/
│   ├── images/
│   └── designs/
├── ios/
├── android/
├── web/
└── pubspec.yaml
```

## Technology Stack

### Core Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.0
  riverpod_annotation: ^2.3.0

  # Navigation
  go_router: ^13.0.0

  # Networking
  dio: ^5.4.0
  retrofit: ^4.0.0

  # Local Storage
  drift: ^2.14.0 # SQLite ORM
  shared_preferences: ^2.2.0
  path_provider: ^2.1.0

  # Camera
  camera: ^0.10.5
  image_picker: ^1.0.0

  # Image Processing
  image: ^4.1.0 # Dart image manipulation
  flutter_image_compress: ^2.1.0

  # Charts (Admin)
  fl_chart: ^0.66.0

  # UI
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  google_fonts: ^6.1.0

  # Auth
  flutter_secure_storage: ^9.0.0

  # Sharing
  share_plus: ^7.2.0

  # GIF
  image_gallery_saver: ^2.0.3

dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.0
  build_runner: ^2.4.0
  riverpod_generator: ^2.3.0
  retrofit_generator: ^8.0.0
  drift_dev: ^2.14.0
  integration_test:
    sdk: flutter
```

## Component Design

### Elegancia Nocturna Theme

```dart
class EleganciaTheme {
  static const goldAccent = Color(0xFFD8AE48);
  static const darkBg = Color(0xFF0A0A0A);
  static const darkSurface = Color(0xFF1A1A1A);
  static const darkCard = Color(0xFF2A2A2A);

  static ThemeData get darkTheme => ThemeData(
    brightness: Brightness.dark,
    colorScheme: ColorScheme.dark(
      primary: goldAccent,
      secondary: goldAccent.withOpacity(0.7),
      surface: darkSurface,
      background: darkBg,
    ),
    textTheme: GoogleFonts.montserratTextTheme().apply(
      bodyColor: Colors.white,
      displayColor: goldAccent,
    ),
    // Cinzel for headings via custom TextStyle
  );
}
```

### Camera Capture Flow

```dart
// Platform-adaptive camera implementation
abstract class CameraService {
  Future<void> initialize();
  Stream<CameraImage> get previewStream;
  Future<XFile> capturePhoto();
  Future<List<XFile>> captureSequence(int count, Duration interval);
  void dispose();
}

class NativeCameraService implements CameraService { /* camera plugin */ }
class WebCameraService implements CameraService { /* dart:html getUserMedia */ }
```

### Filter System

```dart
// Filter engine using ColorFilter and custom shaders
class PhotoFilter {
  final String name;
  final String displayName;
  final String category;
  final ColorFilter? colorFilter;
  final List<double>? colorMatrix;

  Widget apply(Widget child) => ColorFiltered(
    colorFilter: colorFilter ?? ColorFilter.matrix(colorMatrix!),
    child: child,
  );
}

// Predefined filters matching CSS equivalents
class FilterPresets {
  static final noir = PhotoFilter(
    name: 'noir',
    colorMatrix: grayscaleMatrix(contrast: 1.2),
  );
  static final vintage = PhotoFilter(
    name: 'vintage',
    colorMatrix: sepiaMatrix(intensity: 0.8, saturation: 1.4),
  );
  // ... 15+ filters
}
```

### Photo Strip Generation

```dart
// Canvas-based strip generation using CustomPainter
class PhotoStripPainter extends CustomPainter {
  final List<ui.Image> photos;
  final StripLayout layout;
  final DesignTemplate template;
  final Map<int, PhotoFilter> filters;

  @override
  void paint(Canvas canvas, Size size) {
    // Draw template background
    // Position photos using frame mappings
    // Apply filters
    // Draw frame overlays
  }
}
```

## Data Flow

### API Integration

```dart
// Repository pattern with offline-first strategy
class SessionRepository {
  final ApiClient remote;
  final LocalDatabase local;

  Future<List<PhotoSession>> getSessions() async {
    try {
      final remote = await api.getSessions();
      await local.cacheSessions(remote);
      return remote;
    } catch (e) {
      return local.getCachedSessions(); // Offline fallback
    }
  }
}
```

### State Management (Riverpod)

```dart
// Feature-scoped providers
@riverpod
class PhotoboothState extends _$PhotoboothState {
  @override
  PhotoboothData build() => PhotoboothData.initial();

  void selectLayout(StripLayout layout) { ... }
  void addPhoto(XFile photo) { ... }
  void applyFilter(int index, PhotoFilter filter) { ... }
  Future<File> generateStrip() { ... }
}
```

## Migration Strategy

### Phase 1: Core Foundation (2 weeks)

- Flutter project setup with clean architecture
- Elegancia Nocturna theme implementation
- Navigation and routing
- API client and authentication

### Phase 2: Camera and Capture (2 weeks)

- Camera integration (native + web)
- Photo capture workflow
- Layout selection
- Countdown timer

### Phase 3: Filters and Processing (2 weeks)

- Filter engine with ColorFilter/matrices
- Photo editor (brightness, contrast, etc.)
- Transform tools (rotate, flip)
- Real-time preview

### Phase 4: Strip Generation (1 week)

- Canvas-based strip composition
- Design template system
- GIF generation
- Export and sharing

### Phase 5: Admin Panel (2 weeks)

- Dashboard with charts
- Asset management
- User/tenant management
- Analytics views

### Phase 6: Offline and Polish (1 week)

- SQLite local storage
- Offline-first sync
- Performance optimization
- Platform-specific polish

### Phase 7: Testing and Deployment (2 weeks)

- Unit and widget tests
- Integration tests
- CI/CD pipelines
- App Store / Play Store submission

## Orchestrator Configuration

### Agentes Especializados

```yaml
agents:
  flutter-architect:
    role: "Flutter Architecture Agent"
    skills:
      - Clean architecture setup
      - Dependency injection configuration
      - Project scaffolding
    tasks:
      - Create project structure
      - Configure Riverpod/BLoC
      - Setup GoRouter
      - Configure build flavors

  ui-migration-agent:
    role: "UI/UX Migration Agent"
    skills:
      - React to Flutter widget mapping
      - Tailwind to Flutter styling
      - Animation migration
      - Responsive design
    tasks:
      - Migrate Elegancia Nocturna theme
      - Convert React components to Flutter widgets
      - Implement animations
      - Responsive layouts

  camera-agent:
    role: "Camera & Media Agent"
    skills:
      - Camera plugin integration
      - Image processing
      - GIF generation
      - Platform-specific media handling
    tasks:
      - Camera capture system
      - Filter engine
      - Photo strip generation
      - GIF creation

  api-integration-agent:
    role: "Backend Integration Agent"
    skills:
      - REST API client setup
      - JWT authentication
      - Offline-first patterns
      - Data synchronization
    tasks:
      - Dio client configuration
      - Repository pattern implementation
      - Local database setup
      - Sync engine

  admin-migration-agent:
    role: "Admin Panel Migration Agent"
    skills:
      - Data tables in Flutter
      - Chart visualization
      - CRUD interfaces
      - Role-based UI
    tasks:
      - Dashboard migration
      - Asset management UI
      - User management UI
      - Analytics charts

  testing-agent:
    role: "Testing & QA Agent"
    skills:
      - Unit testing
      - Widget testing
      - Integration testing
      - CI/CD configuration
    tasks:
      - Test suite setup
      - Unit tests for business logic
      - Widget tests for screens
      - CI/CD pipeline configuration

  deployment-agent:
    role: "Deployment & Release Agent"
    skills:
      - iOS deployment
      - Android deployment
      - Web deployment
      - Store submission
    tasks:
      - Build configurations
      - Signing and certificates
      - Store listings
      - Release automation
```

### Orchestrator Workflow

```
┌──────────────┐
│ Orchestrator │
└──────┬───────┘
       │
       ├──▶ Phase 1: flutter-architect → Project setup
       │
       ├──▶ Phase 2: ui-migration-agent → Theme + Landing + Layout
       │         └──▶ camera-agent → Camera capture system
       │
       ├──▶ Phase 3: camera-agent → Filter engine
       │         └──▶ ui-migration-agent → Photo editor UI
       │
       ├──▶ Phase 4: camera-agent → Strip generation + GIF
       │         └──▶ api-integration-agent → Backend connection
       │
       ├──▶ Phase 5: admin-migration-agent → Admin panel
       │         └──▶ api-integration-agent → Admin API integration
       │
       ├──▶ Phase 6: api-integration-agent → Offline + sync
       │         └──▶ ui-migration-agent → Polish + animations
       │
       └──▶ Phase 7: testing-agent → Test suite
                 └──▶ deployment-agent → CI/CD + stores
```
