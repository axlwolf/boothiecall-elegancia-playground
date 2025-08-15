/* Debug flags and platform helpers */

export const isClient = typeof window !== 'undefined';

export function isDebugRoute(loc?: Location | { pathname: string }): boolean {
  try {
    const pathname = (loc?.pathname ?? (isClient ? window.location.pathname : '')) || '';
    // Only enable in development builds
    const inDev = typeof import.meta !== 'undefined' && !!import.meta.env?.DEV;
    if (!inDev) return false;
    // Route must start with /playground/debugg
    const routeMatch = /^\/playground\/debugg(\/|$)/i.test(pathname);
    return routeMatch;
  } catch {
    return false;
  }
}

export function getDebugFlags(loc?: Location | { pathname: string }) {
  const enabled = isDebugRoute(loc);
  return {
    enabled,
    accessibility: enabled,
    performance: enabled,
  } as const;
}

export function isIOS(): boolean {
  if (!isClient) return false;
  const ua = window.navigator.userAgent || '';
  // Covers iPhone/iPad and iOS 13+ where iPadOS may report as Mac
  const iOS = /iPad|iPhone|iPod/.test(ua) || (/(Macintosh)/.test(ua) && 'ontouchend' in document);
  return iOS;
}

export function inStandaloneMode(): boolean {
  if (!isClient) return false;
  // iOS PWA standalone detection
  const nav = window.navigator as Navigator & { standalone?: boolean };
  const iOSStandalone = nav.standalone === true;
  // Standard PWA display-mode media
  const displayStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  return !!(iOSStandalone || displayStandalone);
}
