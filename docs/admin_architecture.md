```mermaid
graph TD
    subgraph Frontend Admin Interface
        A[App.tsx] --> B(BrowserRouter)
        B --> C{Routes}
        C --> D[Login Page]
        C --> E[Protected Route]

        E --> F(AdminLayout)
        F --> G[Dashboard Page]
        F --> H[Assets Page]
        F --> I[Filters Page]
        F --> J[Designs Page]
        F --> K[Users Page]
        F --> L[Tenants Page]
        F --> M[Formats Page]
        F --> N[Analytics Page]
        F --> O[Settings Page]

        H --> H1(UploadAssetDialog)
        H --> H2(EditAssetDialog)
        H --> H3(DeleteAssetDialog)

        I --> I1(AddFilterDialog)
        I --> I2(EditFilterDialog)
        I3(DeleteFilterDialog)

        J --> J1(AddDesignDialog)
        J --> J2(EditDesignDialog)
        J3(DeleteDesignDialog)

        K --> K1(AddUserDialog)
        K --> K2(EditUserDialog)
        K3(DeleteUserDialog)

        L --> L1(AddTenantDialog)
        L --> L2(EditTenantDialog)
        L3(DeleteTenantDialog)

        M --> M1(AddOutputFormatDialog)
        M --> M2(EditOutputFormatDialog)
        M3(DeleteOutputFormatDialog)

        G --> G1(DailySessionsChart)
        G --> G2(PopularFiltersChart)
        G --> G3(LayoutUsageChart)

        subgraph Shared Components
            P[DataTable] --> H
            P --> I
            P --> J
            P --> K
            P --> L
            P --> M
            Q[PageHeader] --> G
            Q --> H
            Q --> I
            Q --> J
            Q --> K
            Q --> L
            Q --> M
            Q --> N
            Q --> O
        end

        subgraph Services (Mocked)
            S1[authService]
            S2[assetService]
            S3[filterService]
            S4[designService]
            S5[userService]
            S6[tenantService]
            S7[outputFormatService]
            S8[analyticsService]
        end

        E --> S1
        H --> S2
        I --> S3
        J --> S4
        K --> S5
        L --> S6
        M --> S7
        G --> S8
        N --> S8

    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style D fill:#fbf,stroke:#333,stroke-width:2px
    style E fill:#fbf,stroke:#333,stroke-width:2px
    style F fill:#fbf,stroke:#333,stroke-width:2px
    style G fill:#fbf,stroke:#333,stroke-width:2px
    style H fill:#fbf,stroke:#333,stroke-width:2px
    style I fill:#fbf,stroke:#333,stroke-width:2px
    style J fill:#fbf,stroke:#333,stroke-width:2px
    style K fill:#fbf,stroke:#333,stroke-width:2px
    style L fill:#fbf,stroke:#333,stroke-width:2px
    style M fill:#fbf,stroke:#333,stroke-width:2px
    style N fill:#fbf,stroke:#333,stroke-width:2px
    style O fill:#fbf,stroke:#333,stroke-width:2px
    style P fill:#ccf,stroke:#333,stroke-width:2px
    style Q fill:#ccf,stroke:#333,stroke-width:2px
    style S1 fill:#afa,stroke:#333,stroke-width:2px
    style S2 fill:#afa,stroke:#333,stroke-width:2px
    style S3 fill:#afa,stroke:#333,stroke-width:2px
    style S4 fill:#afa,stroke:#333,stroke-width:2px
    style S5 fill:#afa,stroke:#333,stroke-width:2px
    style S6 fill:#afa,stroke:#333,stroke-width:2px
    style S7 fill:#afa,stroke:#333,stroke-width:2px
    style S8 fill:#afa,stroke:#333,stroke-width:2px
```