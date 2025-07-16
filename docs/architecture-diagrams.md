# BoothieCall Elegancia - Diagramas de Arquitectura

## 1. Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "Frontend Application"
        subgraph "Principal App"
            A[App.tsx] --> B[Index.tsx]
            B --> C[AppLayout]
            C --> D[Photobooth]
            
            D --> E[Landing]
            D --> F[LayoutSelection]
            D --> G[DesignSelection]
            D --> H[CameraCapture]
            D --> I[FilterSelection]
            D --> J[PhotoEditor]
            D --> K[FinalResult]
        end
        
        subgraph "Admin Panel"
            A --> L[Admin Routes]
            L --> M[ProtectedRoute]
            M --> N[AdminLayout]
            
            N --> O[Dashboard]
            N --> P[Assets]
            N --> Q[Filters]
            N --> R[Designs]
            N --> S[Users]
            N --> T[Tenants]
            N --> U[Analytics]
            N --> V[Settings]
        end
    end
    
    subgraph "Core Libraries"
        W[FilterEngine]
        X[TemplateService]
        Y[ImageProcessing]
        Z[AuthService]
        AA[AssetService]
    end
    
    subgraph "UI Components"
        BB[shadcn/ui]
        CC[Elegancia Design System]
    end
    
    subgraph "External Dependencies"
        DD[React Router]
        EE[TanStack Query]
        FF[Radix UI]
        GG[Tailwind CSS]
    end
    
    D --> W
    D --> X
    D --> Y
    P --> AA
    L --> Z
    
    A --> DD
    A --> EE
    BB --> FF
    CC --> GG
```

## 2. Flujo de Workflow del Photobooth

```mermaid
stateDiagram-v2
    [*] --> landing
    landing --> layout : handleStart()
    layout --> design : handleLayoutSelect()
    design --> capture : handleDesignSelect()
    capture --> filters : handlePhotosComplete()
    filters --> edit : handleOpenPhotoEditor()
    edit --> filters : handlePhotoEdited()
    filters --> result : handleFiltersComplete()
    result --> landing : handleStartOver()
    
    layout --> landing : onBack()
    design --> layout : onBack()
    capture --> design : onBack()
    filters --> capture : onBack()
    edit --> filters : onCancel()
    result --> filters : onBack()
    
    note right of edit
        Nuevo paso añadido para
        edición avanzada de fotos
    end note
```

## 3. Arquitectura de Componentes - Principal

```mermaid
graph TD
    subgraph "Photobooth Workflow"
        A[Photobooth] --> B[Landing]
        A --> C[LayoutSelection]
        A --> D[DesignSelection]
        A --> E[CameraCapture]
        A --> F[FilterSelection]
        A --> G[PhotoEditor]
        A --> H[ImageEditor]
        A --> I[FinalResult]
    end
    
    subgraph "State Management"
        J[Step State] --> A
        K[Layout State] --> A
        L[Template State] --> A
        M[Photos State] --> A
        N[Editing State] --> A
    end
    
    subgraph "Core Services"
        O[TemplateService]
        P[FilterEngine]
        Q[ImageProcessing]
    end
    
    subgraph "Type Definitions"
        R[Layout Types]
        S[Template Types]
        T[Filter Types]
        U[Photo Types]
    end
    
    D --> O
    F --> P
    G --> P
    H --> Q
    
    A --> R
    A --> S
    F --> T
    A --> U
    
    O --> S
    P --> T
    Q --> U
```

## 4. Arquitectura de Componentes - Admin

```mermaid
graph TD
    subgraph "Admin Panel"
        A[AdminLayout] --> B[Dashboard]
        A --> C[Assets]
        A --> D[Filters]
        A --> E[Designs]
        A --> F[Users]
        A --> G[Tenants]
        A --> H[Analytics]
        A --> I[Settings]
    end
    
    subgraph "Auth System"
        J[AuthProvider] --> K[useAuth]
        K --> L[ProtectedRoute]
        L --> A
        M[Login] --> J
    end
    
    subgraph "Asset Management"
        C --> N[DataTable]
        C --> O[UploadAssetDialog]
        C --> P[EditAssetDialog]
        C --> Q[DeleteAssetDialog]
        C --> R[AssetService]
    end
    
    subgraph "Shared Components"
        S[PageHeader]
        T[UI Components]
    end
    
    B --> S
    C --> S
    D --> S
    E --> S
    F --> S
    G --> S
    H --> S
    I --> S
    
    N --> T
    O --> T
    P --> T
    Q --> T
```

## 5. Arquitectura de Datos

```mermaid
erDiagram
    Layout ||--o{ Template : "has many"
    Template ||--o{ FrameMapping : "contains"
    Layout ||--o{ CapturedPhoto : "captures"
    CapturedPhoto ||--o{ PhotoMetadata : "has"
    
    Filter ||--o{ FilterCategory : "belongs to"
    CapturedPhoto ||--|| Filter : "applies"
    
    Asset ||--o{ AssetType : "has type"
    Template ||--o{ Asset : "uses"
    
    User ||--o{ Tenant : "belongs to"
    Tenant ||--o{ Asset : "owns"
    Tenant ||--o{ Template : "owns"
    
    Layout {
        string id
        string name
        number shots
        string description
        string[] requirements
    }
    
    Template {
        string id
        string name
        Layout layout
        FrameMapping[] frameMapping
        TemplateAssets assets
        string description
    }
    
    CapturedPhoto {
        string id
        string dataUrl
        PhotoMetadata metadata
        number timestamp
    }
    
    Filter {
        string id
        string name
        FilterCategory category
        string cssFilter
        string description
        boolean isPremium
    }
    
    Asset {
        string id
        string fileName
        AssetType type
        string url
        string createdAt
        string tenantId
    }
```

## 6. Flujo de Procesamiento de Imágenes

```mermaid
flowchart TD
    A[Camera Capture] --> B[Raw Image Data]
    B --> C{Filter Applied?}
    C -->|Yes| D[FilterEngine.applyFilter]
    C -->|No| E[Original Image]
    
    D --> F[CSS Filter Processing]
    F --> G[Canvas Manipulation]
    G --> H[Processed Image]
    
    E --> I{Manual Adjustments?}
    H --> I
    I -->|Yes| J[ImageProcessing.applyAdjustments]
    I -->|No| K[Final Image]
    
    J --> L[Brightness/Contrast/Saturation]
    L --> M[Hue/Exposure/Highlights/Shadows]
    M --> N{Transformations?}
    
    N -->|Yes| O[Rotation/Flip]
    N -->|No| P[Edited Image]
    O --> P
    
    P --> K
    K --> Q[Template Rendering]
    Q --> R[FrameMapping Application]
    R --> S[Final Photo Strip]
```

## 7. Sistema de Autenticación y Autorización

```mermaid
sequenceDiagram
    participant U as User
    participant L as Login Component
    participant A as AuthService
    participant P as ProtectedRoute
    participant AC as Admin Component
    
    U->>L: Enter credentials
    L->>A: authService.login(credentials)
    A->>A: Validate credentials
    A-->>L: Return auth token
    L->>L: Set authenticated state
    
    U->>P: Navigate to admin route
    P->>A: Check authentication
    A-->>P: Return auth status
    
    alt Authenticated
        P->>AC: Render admin component
        AC-->>U: Show admin interface
    else Not authenticated
        P->>L: Redirect to login
        L-->>U: Show login form
    end
```

## 8. Gestión de Estados Global

```mermaid
graph LR
    subgraph "Photobooth State"
        A[Current Step]
        B[Selected Layout]
        C[Selected Template]
        D[Captured Photos]
        E[Editing Photo Index]
    end
    
    subgraph "Admin State"
        F[Auth State]
        G[Assets List]
        H[Selected Asset]
        I[Dialog States]
    end
    
    subgraph "UI State"
        J[Filter Category]
        K[Current Page]
        L[Processing State]
        M[Before/After Mode]
    end
    
    subgraph "Context Providers"
        N[AuthProvider]
        O[QueryClientProvider]
        P[TooltipProvider]
    end
    
    N --> F
    O --> G
    O --> D
    P --> J
    P --> K
    P --> L
    P --> M
```

## 9. Integración Admin-Principal

```mermaid
graph TB
    subgraph "Admin Panel (Content Management)"
        A[Asset Upload] --> B[Asset Storage]
        C[Template Creation] --> D[Template Storage]
        E[Filter Configuration] --> F[Filter Storage]
        G[User Management] --> H[User Storage]
    end
    
    subgraph "Principal App (Content Consumption)"
        I[Template Loading] --> J[TemplateService]
        K[Filter Application] --> L[FilterEngine]
        M[Photo Processing] --> N[ImageProcessing]
    end
    
    subgraph "Shared Resources"
        O[Asset Directory]
        P[Template Configs]
        Q[Filter Definitions]
    end
    
    B --> O
    D --> P
    F --> Q
    
    J --> P
    L --> Q
    N --> O
    
    style A fill:#f9d71c
    style C fill:#f9d71c
    style E fill:#f9d71c
    style G fill:#f9d71c
    style I fill:#27272a
    style K fill:#27272a
    style M fill:#27272a
```