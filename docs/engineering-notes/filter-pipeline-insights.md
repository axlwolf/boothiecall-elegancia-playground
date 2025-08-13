# 📘 Photo Filters & Export Pipeline — Insights & Best Practices

This document captures what we learned fixing filter visibility in the preview and exported photo strip, plus guardrails to avoid regressions.

## ✅ What was fixed

- **Filters not visible in preview/export**: CSS-only filters (e.g., `infrared`) didn’t affect the final composited canvas.
- **Cause**: We only applied canvas filters/adjustments; `cssFilter` was used for quick UI preview, not baked into the canvas export.
- **Solution**:
  - `src/lib/filterEngine.ts`:
    - Added `applyCssFilterApproximation()` to map CSS filters to `ImageAdjustments` and apply them on ImageData.
    - Updated `applyFilter()` to include this step when `filter.cssFilter` exists.
    - Cache key updated to include `cssFilter` to prevent stale results.
  - `src/components/FinalResult.tsx`:
    - Ensured the frame overlay is drawn again on top after the photos.
    - Ensured `finalImageUrl` is always set from the canvas after generation so preview/export share the same composited source.

## 🧠 Key learnings

- **Bake all effects into the canvas**
  - UI-level CSS filters are fast for previews, but final exports must be pixel-based.
  - For parity, approximate CSS filters via the canvas pipeline.

- **Caching must consider filter params**
  - Include `filter.cssFilter` and adjustments in cache keys to avoid cross-contamination between different filter settings.

- **Image loading & CORS**
  - Always load images with `crossOrigin = 'anonymous'` when you’ll export `toDataURL()`.
  - Blob URLs are safe; remote assets must be CORS-enabled.

- **Draw order matters**
  - Background frame → photos (with clips/crops) → frame overlay again for top decorations.

- **React hooks & effect dependencies**
  - Don’t include state in an effect dependency array if that state is set by the same effect (prevents loops).
  - Use `useRef` for values that shouldn’t retrigger effects.

- **Testing modals reliably**
  - Use dynamic titles via props (e.g., `${template.name} Photo Strip`).
  - Prefer `findBy*` queries with adequate timeouts for async modals.
  - Mock Canvas, ResizeObserver, SW, and other browser APIs in `setupTests.ts`.

- **Asset paths**
  - Centralize base path handling; avoid hardcoded absolute routes that differ across environments.

## 🔬 Debugging checklist for filters not showing

1. **Logs**: Ensure filter ID and `cssFilter` are present when generating.
2. **Waits**: Verify filtered image data URL is loaded before `drawImage`.
3. **Cache**: Disable cache temporarily to rule out stale hits.
4. **Clipping**: Confirm correct clip rect and source rect math.
5. **CORS**: Validate no tainted canvas warnings.
6. **Overlay**: Ensure frame overlay is drawn after photos.

## 🛠️ Implementation references

- `src/lib/filterEngine.ts`
  - `applyFilter()`
  - `applyCssFilterApproximation()`
- `src/components/FinalResult.tsx`
  - `generatePhotoStrip()` draw order
  - Setting `finalImageUrl`

## 🚧 Future improvements

- Support more CSS filter functions: `grayscale`, `sepia`, `invert`, `opacity`, `blur` (approximate), and composite strengths.
- Optional GPU acceleration via WebGL for heavy artistic effects.
- Golden tests that compare rendered canvas against snapshots for each filter.

---

Last updated: 2025-08-09
