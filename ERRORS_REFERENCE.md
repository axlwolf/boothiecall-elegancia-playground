# Errors Reference Guide

This document tracks common errors encountered during development and their solutions.

## Storage Errors

### QuotaExceededError (localStorage)
**Error:** `QuotaExceededError: Failed to execute 'setItem' on 'Storage': Setting the value exceeded the quota.`

**Cause:** localStorage has a 5-10MB limit and was exceeded when saving session data with large photo strips.

**Solution:** Implemented `HybridStorageService` (`src/lib/hybridStorage.ts`) that:
- Automatically falls back to IndexedDB when localStorage quota is exceeded
- Migrates existing data during the fallback
- Provides unlimited storage capacity through IndexedDB
- Maintains the same API for backward compatibility

**Files Modified:**
- `src/lib/hybridStorage.ts` (new file)
- `src/components/Photobooth.tsx` (updated imports and async methods)
- `src/components/SessionHistory.tsx` (updated imports and async methods)

## Import/Hook Errors

### useCallback is not defined
**Error:** `ReferenceError: useCallback is not defined`

**Cause:** `useCallback` hook was used in `PrintPreview.tsx` but not imported from React.

**Solution:** Added `useCallback` to React imports:
```typescript
import React, { useState, useEffect, useRef, useCallback } from 'react';
```

**Files Modified:**
- `src/components/PrintPreview.tsx`

### process is not defined (Vite Environment)
**Error:** `ReferenceError: process is not defined`

**Cause:** Using `process.env` in Vite environment where it should be `import.meta.env`.

**Solution:** Replace `process.env` with `import.meta.env`:
```typescript
// Before
const BASE_URL = process.env.VITE_API_URL || '/api';

// After  
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

**Files Modified:**
- `src/admin/services/apiClient.ts`

## React Component Errors

### Component State Management Issues
**Error:** State not updating properly in filter selection

**Cause:** Missing dependency arrays in useEffect hooks or incorrect state updates.

**Solution:** 
- Ensure all dependencies are included in useEffect dependency arrays
- Use functional state updates when new state depends on previous state
- Implement proper cleanup in useEffect returns

## Performance Issues

### Large Session Data Storage
**Issue:** Slow performance when storing many high-resolution photos

**Solution:** 
- Implemented session cleanup (max 50 sessions)
- Added compression for stored images
- Lazy loading for session history
- IndexedDB for better performance with large datasets

## Browser Compatibility

### Safari IndexedDB Issues
**Issue:** IndexedDB transactions failing in Safari

**Solution:**
- Added proper error handling for IndexedDB operations
- Implemented graceful fallbacks
- Added transaction timeout handling

### Mobile Camera Access
**Issue:** Camera not working on some mobile devices

**Solution:**
- Added proper getUserMedia constraints
- Implemented fallback options for older devices
- Added permission request handling

## Development Environment

### TypeScript Configuration
**Issue:** Strict null checks causing compilation errors

**Current Config:** TypeScript configured with relaxed settings (strict null checks disabled)

**Note:** This was intentional for faster development but should be enabled for production.

## Admin Panel Issues (GEMINI Implementation)

### Authentication Flow
**Issue:** JWT token handling in admin routes

**Solution:** Implemented proper token storage and validation:
- localStorage for token persistence
- Automatic redirect on 401 errors
- Token refresh handling

### Data Table Performance
**Issue:** Slow rendering with large datasets

**Solution:**
- Implemented virtual scrolling
- Added pagination controls
- Lazy loading for table data

## Common Prevention Patterns

### 1. Always Check Imports
Before using React hooks, ensure they're imported:
```typescript
import React, { useState, useEffect, useCallback, useMemo } from 'react';
```

### 2. Vite Environment Variables
Use `import.meta.env` instead of `process.env`:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### 3. Storage Error Handling
Always wrap storage operations in try-catch:
```typescript
try {
  localStorage.setItem(key, value);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // Handle quota exceeded
  }
}
```

### 4. Async/Await Pattern
When updating to async storage methods, update all call sites:
```typescript
// Before
const sessions = storage.getAllSessions();

// After
const sessions = await storage.getAllSessions();
```

### 5. Dependency Arrays
Always include all dependencies in useEffect:
```typescript
useEffect(() => {
  loadData();
}, [loadData]); // Include loadData in dependencies
```

## Debugging Tips

### 1. Storage Issues
- Check browser DevTools > Application > Storage
- Monitor localStorage and IndexedDB usage
- Use storage quota API to check available space

### 2. React Hook Issues
- Use React DevTools to inspect component state
- Check for missing dependencies in hook arrays
- Verify component render cycles

### 3. Network Issues
- Check Network tab in DevTools
- Verify API endpoints and CORS settings
- Test with different network conditions

## Future Improvements

### 1. Error Boundaries
Implement React error boundaries for better error handling:
```typescript
class ErrorBoundary extends React.Component {
  // Handle component errors gracefully
}
```

### 2. Service Worker
Add service worker for offline functionality and better storage management.

### 3. Testing Framework
Add comprehensive testing (Jest, React Testing Library) to catch errors early.

### 4. Monitoring
Implement error tracking (Sentry, LogRocket) for production error monitoring.