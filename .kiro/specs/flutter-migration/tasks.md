# Implementation Plan - Flutter Migration

Plan de implementación para migrar BoothieCall Elegancia de React a Flutter. Cada tarea está diseñada para ser ejecutada por agentes especializados del orquestador.

## Task List

- [ ] 1. Flutter Project Foundation (Agent: flutter-architect)
  - Create Flutter project with clean architecture structure
  - Configure state management, routing, and dependency injection
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 1.1 Scaffold Flutter project with clean architecture
  - Run `flutter create boothiecall_flutter`
  - Create folder structure: features/, core/, shared/, app/
  - Configure pubspec.yaml with all required dependencies
  - Setup analysis_options.yaml with strict linting rules
  - _Agent: flutter-architect_

- [ ] 1.2 Configure state management with Riverpod
  - Setup flutter_riverpod and riverpod_annotation
  - Create ProviderScope in main.dart
  - Configure riverpod_generator with build_runner
  - Create base provider patterns for features
  - _Agent: flutter-architect_

- [ ] 1.3 Setup GoRouter navigation
  - Create router.dart with all app routes
  - Configure route guards for authentication
  - Setup nested navigation for admin panel
  - Implement deep linking support
  - _Agent: flutter-architect_

- [ ] 1.4 Configure API client and dependency injection
  - Setup Dio with base URL, interceptors, and error handling
  - Create JWT interceptor for token management
  - Configure get_it or Riverpod for dependency injection
  - Create repository interfaces in domain layer
  - _Agent: flutter-architect, api-integration-agent_

- [ ] 2. Elegancia Nocturna Theme Migration (Agent: ui-migration-agent)
  - Replicate the complete design system in Flutter
  - Migrate typography, colors, animations, and responsive layouts
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 2.1 Implement color palette and ThemeData
  - Create EleganciaTheme class with dark theme
  - Define gold accent (#D8AE48) and dark palette colors
  - Configure ColorScheme for Material 3
  - Create custom extension for brand-specific colors
  - _Agent: ui-migration-agent_

- [ ] 2.2 Configure typography with Cinzel and Montserrat
  - Add google_fonts dependency
  - Create TextTheme with Montserrat for body text
  - Create custom TextStyles with Cinzel for headings
  - Ensure font loading works on all platforms
  - _Agent: ui-migration-agent_

- [ ] 2.3 Create reusable UI components library
  - Build EleganciaButton, EleganciaCard, EleganciaAppBar widgets
  - Create gold gradient decorations and border styles
  - Implement shimmer loading effects
  - Build pagination controls matching current design
  - _Agent: ui-migration-agent_

- [ ] 2.4 Implement animations and transitions
  - Create shooting star cursor animation (web only)
  - Build page transition animations
  - Implement hover effects and interactive feedback
  - Create countdown timer animation widget
  - _Agent: ui-migration-agent_

- [ ] 3. Landing and Layout Selection (Agent: ui-migration-agent)
  - Migrate landing page and layout selection screens
  - _Requirements: 2.6, 3.3_

- [ ] 3.1 Build Landing screen
  - Create animated hero section with gallery background
  - Implement branding and logo display
  - Build "Start Playground" CTA button with animations
  - Responsive layout for mobile and desktop
  - _Agent: ui-migration-agent_

- [ ] 3.2 Build Layout Selection screen
  - Create layout option cards (1, 3, 4, 6 shots)
  - Implement visual preview for each layout
  - Add selection animation feedback
  - Responsive grid layout
  - _Agent: ui-migration-agent_

- [ ] 4. Camera Capture System (Agent: camera-agent)
  - Implement native camera integration with countdown and multi-shot support
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 4.1 Implement platform-adaptive camera service
  - Create CameraService abstract class
  - Implement NativeCameraService using camera plugin (iOS/Android)
  - Implement WebCameraService using dart:html getUserMedia (Web)
  - Handle camera permissions and error states
  - _Agent: camera-agent_

- [ ] 4.2 Build Camera Capture screen
  - Create real-time camera preview widget
  - Implement countdown timer with visual feedback (3-2-1)
  - Build auto-capture functionality
  - Add retake option for individual photos
  - Show progress indicator for current photo number
  - _Agent: camera-agent, ui-migration-agent_

- [ ] 4.3 Implement GIF recording during capture
  - Capture frame sequences during photo sessions
  - Store frames for later GIF generation
  - Handle memory management for frame buffers
  - Platform-specific optimizations
  - _Agent: camera-agent_

- [ ] 5. Photo Filter and Editor System (Agent: camera-agent)
  - Implement filter engine and photo editing tools
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 5.1 Build filter engine with ColorFilter matrices
  - Create PhotoFilter class with ColorFilter support
  - Implement 15+ filter presets (Noir, Vintage, Glam, etc.)
  - Map CSS filter equivalents to Dart color matrices
  - Create filter category system
  - _Agent: camera-agent_

- [ ] 5.2 Build Filter Selection screen
  - Create paginated filter grid with thumbnails
  - Implement individual photo filter selection
  - Add "All Photos" bulk application option
  - Show real-time filter preview on photo thumbnails
  - _Agent: camera-agent, ui-migration-agent_

- [ ] 5.3 Build Photo Editor with adjustment tools
  - Implement brightness, contrast, saturation, hue sliders
  - Add exposure, highlights, shadows controls
  - Create transform tools (rotation, flip H/V)
  - Build before/after comparison view
  - Tabbed interface matching current PhotoEditor component
  - _Agent: camera-agent, ui-migration-agent_

- [ ] 6. Photo Strip Generation and Export (Agent: camera-agent)
  - Implement strip composition, GIF creation, and export
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 6.1 Implement strip composition with CustomPainter
  - Create PhotoStripPainter using Canvas API
  - Implement frame mapping system for precise photo positioning
  - Support smart cropping with aspect ratio preservation
  - Apply border radius for rounded photo frames
  - _Agent: camera-agent_

- [ ] 6.2 Build Design Template selection system
  - Create template data models with frame mappings
  - Build paginated design selection interface
  - Implement visual template preview
  - Support multiple templates per layout type
  - _Agent: camera-agent, ui-migration-agent_

- [ ] 6.3 Implement GIF generation
  - Use image package to encode animated GIFs
  - Composite GIF frames with design overlays
  - Optimize file sizes for sharing
  - _Agent: camera-agent_

- [ ] 6.4 Build Final Result screen with export options
  - Display generated photo strip preview
  - Implement PNG download to device gallery
  - Implement GIF download option
  - Add share functionality using share_plus
  - Build print-ready format option
  - Add "Start Over" and "Back to Filters" navigation
  - _Agent: camera-agent, ui-migration-agent_

- [ ] 7. Backend API Integration (Agent: api-integration-agent)
  - Connect Flutter app to existing PHP backend
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 7.1 Implement API client with Dio
  - Configure Dio with base URL and default headers
  - Create JWT interceptor for automatic token injection
  - Implement token refresh flow
  - Add request/response logging interceptor
  - Create error handling with custom exceptions
  - _Agent: api-integration-agent_

- [ ] 7.2 Implement authentication repository
  - Create AuthRepository with login, register, logout, refresh
  - Implement secure token storage with flutter_secure_storage
  - Create AuthState provider with Riverpod
  - Handle session expiration and auto-logout
  - _Agent: api-integration-agent_

- [ ] 7.3 Implement data repositories
  - Create SessionRepository for photo sessions
  - Create AssetRepository for design assets
  - Create FilterRepository for photo filters
  - Create AnalyticsRepository for dashboard data
  - Implement repository pattern with remote + local data sources
  - _Agent: api-integration-agent_

- [ ] 8. Local Storage and Offline Support (Agent: api-integration-agent)
  - Implement offline-first data strategy
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 8.1 Setup SQLite database with Drift
  - Create database schema matching backend models
  - Implement DAOs for sessions, filters, assets
  - Configure database migrations
  - _Agent: api-integration-agent_

- [ ] 8.2 Implement offline-first sync engine
  - Create SyncService for pending operations queue
  - Implement conflict resolution strategy
  - Handle automatic sync on connectivity change
  - Create connectivity monitoring provider
  - _Agent: api-integration-agent_

- [ ] 8.3 Implement image caching
  - Configure cached_network_image for remote images
  - Create file-based cache for captured photos
  - Implement cache size limits and cleanup
  - Handle session history storage
  - _Agent: api-integration-agent_

- [ ] 9. Admin Panel Migration (Agent: admin-migration-agent)
  - Migrate complete admin interface to Flutter
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 9.1 Build Admin Dashboard
  - Create dashboard with key metrics cards
  - Implement DailySessionsChart using fl_chart
  - Build PopularFiltersChart and LayoutUsageChart
  - Add recent activity feed
  - _Agent: admin-migration-agent_

- [ ] 9.2 Build Asset Management screens
  - Create asset list with DataTable
  - Implement asset upload with image_picker
  - Build asset preview and detail views
  - Add CRUD dialogs (create, edit, delete)
  - _Agent: admin-migration-agent_

- [ ] 9.3 Build Filter Management screens
  - Create filter list with category grouping
  - Implement CSS filter editor with live preview
  - Build filter CRUD operations
  - Add filter sorting and activation toggles
  - _Agent: admin-migration-agent_

- [ ] 9.4 Build User and Tenant Management
  - Create user list with role badges
  - Implement user CRUD with role assignment
  - Build tenant management interface
  - Add tenant-specific settings configuration
  - _Agent: admin-migration-agent_

- [ ] 9.5 Build Analytics screens
  - Create detailed analytics with date range filters
  - Implement session analytics charts
  - Build filter usage and layout popularity views
  - Add export functionality for reports
  - _Agent: admin-migration-agent_

- [ ] 10. Testing Suite (Agent: testing-agent)
  - Implement comprehensive test coverage
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 10.1 Setup testing infrastructure
  - Configure test directory structure (unit, widget, integration)
  - Setup mockito for dependency mocking
  - Create test fixtures and factories
  - Configure code coverage reporting
  - _Agent: testing-agent_

- [ ] 10.2 Write unit tests for business logic
  - Test filter engine color matrix calculations
  - Test photo strip layout calculations
  - Test authentication flow and token management
  - Test repository data transformations
  - Target 80%+ coverage on domain layer
  - _Agent: testing-agent_

- [ ] 10.3 Write widget tests for main screens
  - Test Landing screen rendering and navigation
  - Test Layout Selection interaction
  - Test Filter Selection and application
  - Test Final Result export options
  - Test Admin Dashboard rendering
  - _Agent: testing-agent_

- [ ] 10.4 Write integration tests for critical flows
  - Test complete photo capture → filter → export flow
  - Test authentication → admin panel flow
  - Test offline capture → sync flow
  - Run on iOS, Android, and Web targets
  - _Agent: testing-agent_

- [ ] 11. CI/CD and Deployment (Agent: deployment-agent)
  - Configure automated build, test, and deployment pipelines
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 11.1 Configure GitHub Actions CI pipeline
  - Create workflow for automated testing on PR
  - Add code coverage reporting
  - Configure linting and static analysis
  - Setup build verification for all platforms
  - _Agent: deployment-agent_

- [ ] 11.2 Configure iOS deployment
  - Setup Xcode project signing and certificates
  - Create Fastlane configuration for iOS
  - Configure TestFlight distribution
  - Prepare App Store listing metadata
  - _Agent: deployment-agent_

- [ ] 11.3 Configure Android deployment
  - Setup keystore and signing configuration
  - Create Fastlane configuration for Android
  - Configure Play Store internal testing track
  - Prepare Play Store listing metadata
  - _Agent: deployment-agent_

- [ ] 11.4 Configure Web deployment
  - Create optimized web build configuration
  - Setup deployment to hosting (GoDaddy/Vercel)
  - Configure PWA manifest and service worker
  - Optimize bundle size and loading performance
  - _Agent: deployment-agent_
