# Google Analytics - Roadmap de Implementación

## 📋 Objetivo

Integrar Google Analytics 4 (GA4) en BoothieCall Elegancia para trackear el comportamiento de usuarios, métricas de uso de la app, y generar insights para mejorar la experiencia.

---

## 🎯 Eventos a Trackear

### Core Events (Flujo Principal)

| Evento                    | Trigger                     | Parámetros                                   |
| ------------------------- | --------------------------- | -------------------------------------------- |
| `page_view`               | Cada cambio de pantalla     | page_title, page_path                        |
| `session_start`           | Usuario inicia la app       | source, medium                               |
| `layout_selected`         | Selecciona layout (1,3,4,6) | layout_type, shot_count                      |
| `photo_captured`          | Captura una foto            | photo_index, layout_type, retake_count       |
| `photo_session_completed` | Completa todas las fotos    | layout_type, total_photos, duration_seconds  |
| `filter_applied`          | Aplica un filtro            | filter_name, filter_category, photo_index    |
| `filter_applied_all`      | Aplica filtro a todas       | filter_name, filter_category                 |
| `design_selected`         | Selecciona template         | template_name, layout_type                   |
| `strip_generated`         | Genera photo strip          | format (png/gif), layout_type, filters_count |
| `strip_downloaded`        | Descarga el strip           | format, file_size_kb                         |
| `strip_shared`            | Comparte el strip           | share_method, format                         |

### Editor Events

| Evento              | Trigger               | Parámetros                                          |
| ------------------- | --------------------- | --------------------------------------------------- |
| `editor_opened`     | Abre el photo editor  | photo_index                                         |
| `editor_adjustment` | Modifica un ajuste    | adjustment_type (brightness, contrast, etc.), value |
| `editor_transform`  | Aplica transformación | transform_type (rotate, flip_h, flip_v)             |

### Admin Events

| Evento                 | Trigger              | Parámetros               |
| ---------------------- | -------------------- | ------------------------ |
| `admin_login`          | Login al panel admin | user_role                |
| `admin_asset_uploaded` | Sube un asset        | asset_type, file_size_kb |
| `admin_filter_created` | Crea filtro nuevo    | filter_category          |
| `admin_user_created`   | Crea usuario         | user_role                |

### Performance Events

| Evento                      | Trigger              | Parámetros               |
| --------------------------- | -------------------- | ------------------------ |
| `camera_permission_granted` | Acepta permisos      | —                        |
| `camera_permission_denied`  | Rechaza permisos     | —                        |
| `camera_error`              | Error de cámara      | error_type               |
| `strip_generation_time`     | Tiempo de generación | duration_ms, format      |
| `app_error`                 | Error no capturado   | error_message, component |

### Engagement Events

| Evento                   | Trigger                | Parámetros        |
| ------------------------ | ---------------------- | ----------------- |
| `session_history_viewed` | Ve historial           | sessions_count    |
| `session_resumed`        | Retoma sesión anterior | session_age_hours |
| `before_after_toggled`   | Usa before/after       | —                 |
| `help_viewed`            | Ve instrucciones       | —                 |

---

## 🏗️ Arquitectura Propuesta

```
┌─────────────────────────────────────┐
│          React App                  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   AnalyticsService          │    │
│  │   (src/lib/analytics.ts)    │    │
│  │                             │    │
│  │   - trackEvent(name, params)│    │
│  │   - trackPageView(page)     │    │
│  │   - setUserProperties(...)  │    │
│  │   - trackTiming(...)        │    │
│  └──────────┬──────────────────┘    │
│             │                       │
│  ┌──────────▼──────────────────┐    │
│  │   useAnalytics() hook       │    │
│  │   (src/hooks/useAnalytics)  │    │
│  └──────────┬──────────────────┘    │
│             │                       │
└─────────────│───────────────────────┘
              │
              ▼
     ┌─────────────────┐
     │  Google Analytics│
     │  4 (gtag.js)    │
     │  GA4 Property   │
     └─────────────────┘
```

---

## ✅ Roadmap - Checklist de Implementación

### Phase 1: Setup GA4 (30 min)

- [ ] 1.1 Crear propiedad GA4 en Google Analytics console
  - [ ] Ir a analytics.google.com
  - [ ] Crear propiedad "BoothieCall Elegancia"
  - [ ] Configurar data stream tipo "Web"
  - [ ] Obtener Measurement ID (G-XXXXXXXXXX)
  - [ ] Configurar dominio: boothiecall.net

- [ ] 1.2 Agregar gtag.js al proyecto
  - [ ] Agregar script de GA4 en `index.html`
  - [ ] Crear variable de entorno `VITE_GA_MEASUREMENT_ID`
  - [ ] Agregar ID a `.env.production`
  - [ ] NO trackear en development (condicionar por env)

### Phase 2: Analytics Service (1-2 horas)

- [ ] 2.1 Crear AnalyticsService
  - [ ] Crear `src/lib/analytics.ts`
  - [ ] Método `initialize(measurementId)` - configura gtag
  - [ ] Método `trackEvent(eventName, params?)` - envía evento custom
  - [ ] Método `trackPageView(pageName, pagePath)` - page_view
  - [ ] Método `setUserProperties(props)` - user properties
  - [ ] Método `trackTiming(category, variable, value)` - performance
  - [ ] Método `trackError(errorMessage, component)` - errores
  - [ ] Condicionar: solo trackear si `APP_ENV === 'production'`
  - [ ] Console.log en development para debugging

- [ ] 2.2 Crear useAnalytics hook
  - [ ] Crear `src/hooks/useAnalytics.ts`
  - [ ] Hook que expone métodos del AnalyticsService
  - [ ] Auto-track page views con useEffect

- [ ] 2.3 Crear constantes de eventos
  - [ ] Crear `src/lib/analyticsEvents.ts`
  - [ ] Definir todos los event names como constantes
  - [ ] Definir interfaces para params de cada evento
  - [ ] Type-safety para evitar typos en event names

### Phase 3: Integración en Componentes (2-3 horas)

- [ ] 3.1 Track page views automático
  - [ ] Agregar tracking en el router/navegación principal
  - [ ] Track cada cambio de step en Photobooth.tsx
  - [ ] Landing, Layout, Camera, Filters, Design, Result

- [ ] 3.2 Track flujo principal
  - [ ] LayoutSelection.tsx → `layout_selected`
  - [ ] CameraCapture.tsx → `photo_captured`, `photo_session_completed`
  - [ ] FilterSelection.tsx → `filter_applied`, `filter_applied_all`
  - [ ] DesignSelection.tsx → `design_selected`
  - [ ] FinalResult.tsx → `strip_generated`, `strip_downloaded`, `strip_shared`

- [ ] 3.3 Track editor
  - [ ] PhotoEditor.tsx → `editor_opened`, `editor_adjustment`, `editor_transform`

- [ ] 3.4 Track performance
  - [ ] Medir tiempo de generación de strip
  - [ ] Medir errores de cámara
  - [ ] Track camera permission grant/deny

- [ ] 3.5 Track admin (si aplica)
  - [ ] Login events
  - [ ] CRUD operations

### Phase 4: User Properties & Segments (30 min)

- [ ] 4.1 Configurar user properties
  - [ ] `preferred_layout` - Layout más usado
  - [ ] `favorite_filter` - Filtro más usado
  - [ ] `session_count` - Número de sesiones completadas
  - [ ] `platform` - Web/Mobile
  - [ ] `user_role` - Si está autenticado (admin, editor, viewer)

- [ ] 4.2 Configurar audiencias en GA4
  - [ ] Usuarios frecuentes (3+ sesiones)
  - [ ] Usuarios que comparten
  - [ ] Usuarios que usan editor avanzado
  - [ ] Admins

### Phase 5: Dashboard & Reportes (1 hora en GA4 console)

- [ ] 5.1 Crear reportes custom en GA4
  - [ ] Funnel: Landing → Layout → Camera → Filters → Result
  - [ ] Filtros más populares
  - [ ] Layouts más usados
  - [ ] Tasa de descarga vs compartir
  - [ ] Tiempo promedio por sesión

- [ ] 5.2 Configurar conversiones
  - [ ] `strip_downloaded` como conversión principal
  - [ ] `strip_shared` como conversión secundaria
  - [ ] `photo_session_completed` como micro-conversión

- [ ] 5.3 Configurar alertas
  - [ ] Alerta si error rate > 5%
  - [ ] Alerta si daily sessions drop > 50%

### Phase 6: Testing & Validación (30 min)

- [ ] 6.1 Validar tracking en development
  - [ ] Usar GA4 DebugView para verificar eventos
  - [ ] Verificar que params se envían correctamente
  - [ ] Verificar que NO se trackea en localhost (o usar debug mode)

- [ ] 6.2 Validar en producción
  - [ ] Verificar eventos en Realtime report
  - [ ] Verificar funnel report
  - [ ] Verificar user properties

---

## 📁 Archivos a Crear/Modificar

```
src/
├── lib/
│   ├── analytics.ts              # AnalyticsService (NUEVO)
│   └── analyticsEvents.ts        # Constantes y tipos (NUEVO)
├── hooks/
│   └── useAnalytics.ts           # Hook de analytics (NUEVO)
├── components/
│   ├── Photobooth.tsx            # Agregar page view tracking
│   ├── LayoutSelection.tsx       # Agregar layout_selected
│   ├── CameraCapture.tsx         # Agregar photo_captured
│   ├── FilterSelection.tsx       # Agregar filter_applied
│   ├── DesignSelection.tsx       # Agregar design_selected
│   ├── FinalResult.tsx           # Agregar strip_generated/downloaded/shared
│   └── PhotoEditor.tsx           # Agregar editor events
├── index.html                    # Agregar gtag.js script
└── .env.production               # Agregar VITE_GA_MEASUREMENT_ID
```

---

## 🔒 Consideraciones de Privacidad

- [ ] Agregar banner de cookies/consent (si necesario por GDPR/regulación)
- [ ] NO trackear datos personales (emails, nombres)
- [ ] NO trackear contenido de fotos
- [ ] Respetar Do Not Track browser setting
- [ ] Documentar qué se trackea en privacy policy

---

## ⏱️ Estimación Total

| Phase                | Tiempo         |
| -------------------- | -------------- |
| 1. Setup GA4         | 30 min         |
| 2. Analytics Service | 1-2 horas      |
| 3. Integración       | 2-3 horas      |
| 4. User Properties   | 30 min         |
| 5. Dashboard         | 1 hora         |
| 6. Testing           | 30 min         |
| **Total**            | **~6-8 horas** |

---

## 📊 KPIs a Monitorear Post-Launch

- **Tasa de completación de sesión**: % usuarios que llegan a Result desde Landing
- **Filtro más popular**: Qué filtros se aplican más
- **Layout preferido**: Distribución de 1/3/4/6 shots
- **Tasa de descarga**: % de sesiones que terminan en download
- **Tasa de compartir**: % que usan share
- **Tiempo por sesión**: Duración promedio del flujo completo
- **Drop-off points**: Dónde abandonan los usuarios
