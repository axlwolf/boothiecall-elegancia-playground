# Roadmap de Fixes iOS + Flags de Debug

Fecha: 2025-08-14
Alcance: Correcciones específicas para iPhone (iOS 16, iPhone Pro Max) y activación de UI de depuración por ruta `playground/debugg/`.

---

## 1) Flags de Depuración por Ruta

- Objetivo: Habilitar botones/paneles de Accesibility y Performance solo cuando la ruta contiene `playground/debugg/`.
- Implementación propuesta:
  - Crear helper `src/lib/debugFlags.ts`:
    - `isDebugRoute(location: Location): boolean` → true si el pathname incluye `/playground/debugg/` (tolerante a trailing slash).
    - `getDebugFlags()` → { accessibility: boolean, performance: boolean } activados cuando `isDebugRoute` es true.
  - Crear `src/components/debug/DebugBar.tsx` con toggles/acciones de:
    - Accesibility checks (focus outlines, roles, tab-traps, contrast quick check).
    - Performance panel (timings, bundle info, SW status, cache size, memory hints).
  - Integrar en `AppLayout.tsx` (o layout raíz) para render condicional: `isDebugRoute(window.location)`.
- Aceptación:
  - Entrando a `/playground/debugg/` aparece DebugBar con 2 botones: “Accessibility” y “Performance”.
  - En rutas normales no aparece nada.

---

## 2) Botón “Copy” en fase de compartir (iOS)

- Síntoma: En iPhone (iOS 16/Safari/PWA standalone) `Copy` no copia al portapapeles; en Android/desktop funciona.
- Hipótesis:
  - iOS restringe `navigator.clipboard.writeText` fuera de gestos de usuario o contextos inseguros.
  - PWA standalone en iOS tiene permisos más estrictos.
- Fix propuesto (fallback robusto):
  - Implementar utilidad `src/lib/clipboard.ts`:
    - Intentar `await navigator.clipboard.writeText(text)` dentro del handler del click.
    - Si falla: 
      - Crear `<textarea>` oculto, seleccionar texto con `select()` + `setSelectionRange(0, text.length)`, y usar `document.execCommand('copy')` si está disponible en iOS 16 (algunas builds aún lo soportan).
      - Si también falla, fallback UX: abrir `window.prompt('Copy:', text)` o usar `navigator.share({ text })` cuando esté disponible.
  - Mensajería al usuario: toast “Copied!” o “Copy not supported; use Share to copy”.
- Puntos técnicos:
  - Asegurar que el handler del botón sea un gesto directo (sin `await` previos).
  - HTTPS y contexto de usuario garantizados.
- Aceptación:
  - En iPhone, al tocar Copy: éxito silencioso o presenta Share/prompt como fallback. No hay errores en consola.

---

## 3) Card “Instant Download” desborda contenido (pantalla inicial)

- Síntoma: El contenido se sale de la card en iPhone Pro Max.
- Causas probables:
  - Textos largos sin wrap, imágenes o contenedores sin `overflow-hidden`, flex gaps.
  - Diferencias de line-height/renderizado en iOS.
- Fix CSS propuesto (en el componente de la card, p.ej. `src/components/InstantDownloadCard.tsx`):
  - Asegurar contenedor: `overflow-hidden rounded-xl`.
  - Para imágenes/media: `object-cover`, `aspect-video` o `max-h-48`.
  - Para textos: `break-words break-normal hyphens-auto` y `leading-snug`.
  - Layout: evitar alturas fijas; usar `min-h-0` en contenedores flex.
  - Revisar padding vs safe-areas en iOS.
- Aceptación:
  - No hay overflow horizontal/vertical; card mantiene su layout en iPhone.

---

## 4) “Photo+GIF” no genera capturas en iPhone

- Síntoma: En modo “Photo+gif” no aparecen capturas en iOS.
- Hipótesis:
  - Safari iOS limita canvas `toBlob`, OffscreenCanvas, timers en background, y codecs.
  - Secuencia de captura puede no iniciar por autoplay/gesture.
- Plan de acción:
  1) Revisión de pipeline en `src/lib/gifService.ts` (o equivalente) y componente de captura:
     - Verificar `video` con `playsinline`, `muted`, y llamado a `play()` después de gesto del usuario.
     - Detectar soporte de `OffscreenCanvas`; si no, fallback a `Canvas` clásico.
     - Usar `await new Promise(requestAnimationFrame)` entre frames.
     - Reducir resolución/frame rate para iOS (ej. 480px de ancho, 6-8 fps).
     - Asegurar `canvas.toBlob` con tipo `image/png` y si falla, usar `toDataURL` como último recurso (cuidando memoria).
  2) Aislar encoder de GIF: probar una lib compatible con iOS (ej. `gifshot` o `omggif` vía worker) y validar permisos de cross-origin.
  3) Logs temporales (solo en debug route) para frame count, tiempos, errores.
- Aceptación:
  - En iPhone, “Photo+gif” produce un GIF visible y descargable; tiempos < 5s a resolución reducida.

---

## 5) Bloque amarillo y scroll en pantallas de captura y descarga (iOS)

- Síntoma: Aparece un bloque amarillo grande y se requiere scroll para ver el área principal.
- Hipótesis:
  - Uso de `100vh` en iOS provoca espacio extra por barras de Safari.
  - Colores de fondo (amarillo) en contenedores con `min-h-100vh`/`h-screen` exponen el gap.
- Fix CSS propuesto:
  - Reemplazar `100vh/h-screen` por `100svh` o `100dvh` donde sea posible.
  - Ajustar contenedores de página: `min-h-[100svh]` y `height: 100svh` (con fallbacks).
  - Incluir safe areas: `padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);` según layout.
  - Evitar `position: fixed` full-height en iOS cuando el teclado está visible.
- Aceptación:
  - En iPhone, no aparece bloque amarillo extra; la UI crítica es visible sin scroll inicial.

---

## 6) QA y Matriz de Pruebas

- Dispositivos/Entornos:
  - iPhone Pro Max iOS 16 (Safari y PWA standalone)
  - Android Chrome
  - Desktop Chrome/Safari
- Casos clave:
  - `Copy` en pantalla de compartir (tap directo)
  - “Photo+gif” (captura, preview, descarga)
  - Vista inicial con card “Instant Download” (sin overflow)
  - Pantallas de captura y final (sin bloque amarillo)
  - Flags en `playground/debugg/` (paneles visibles)
- Métricas:
  - Tiempo de generación de GIF en iOS
  - Errores en consola
  - CLS/LCP en iOS (en debug panel)

---

## 7) Plan de Entrega

- Día 1:
  - Flags por ruta + DebugBar.
  - Fix de `Copy` con fallback y toasts.
- Día 2:
  - CSS de card “Instant Download”.
  - Ajustes de `svh/safe-area` en pantallas captura/descarga.
- Día 3-4:
  - Pipeline “Photo+gif” (fidelity y performance en iOS) + logs en debug.
  - QA en dispositivos reales.

---

## 8) Riesgos y Mitigaciones

- Restricciones de iOS a clipboard/canvas → Fallbacks y resoluciones menores.
- Diferencias PWA standalone vs Safari → Probar ambos contextos.
- Consumo de memoria al generar GIFs → Limpiar blobs, liberar canvases, usar workers cuando sea posible.

---

## 9) Entregables

- `src/lib/debugFlags.ts`
- `src/components/debug/DebugBar.tsx`
- Integración en `AppLayout.tsx` (o layout global)
- `src/lib/clipboard.ts` + actualización de botones de Copy
- Fixes CSS en card “Instant Download” y pantallas de captura/descarga
- Ajustes en pipeline “Photo+gif” con fallbacks iOS
- Logs activables solo en `playground/debugg/`
