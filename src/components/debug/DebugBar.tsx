import React, { useState } from 'react';
import { getDebugFlags, isClient } from '../../lib/debugFlags';

interface Section {
  id: 'accessibility' | 'performance' | 'info';
  label: string;
}

const sections: Section[] = [
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'performance', label: 'Performance' },
  { id: 'info', label: 'Info' },
];

export function DebugBar() {
  // Recompute flags on each render so navigating between routes updates visibility immediately
  const flags = getDebugFlags(isClient ? window.location : undefined);
  const [active, setActive] = useState<Section['id'] | null>(null);

  if (!flags.enabled) return null;

  return (
    <div className="fixed z-[1000] inset-x-0 bottom-3 flex justify-center pointer-events-none">
      <div className="pointer-events-auto shadow-xl rounded-full bg-black/80 text-white backdrop-blur px-2 py-1 flex items-center gap-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive((prev) => (prev === s.id ? null : s.id))}
            className={`px-3 py-1 rounded-full text-sm hover:bg-white/10 transition ${
              active === s.id ? 'bg-white/15' : ''
            }`}
            type="button"
          >
            {s.label}
          </button>
        ))}
      </div>

      {active && (
        <Panel id={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}

function Panel({ id, onClose }: { id: Section['id']; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[1001] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl bg-neutral-900 text-neutral-100 rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 m-0 sm:m-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold capitalize">{id}</h3>
          <button onClick={onClose} className="text-sm text-neutral-300 hover:text-white">Close</button>
        </div>
        {id === 'accessibility' && <AccessibilityPanel />}
        {id === 'performance' && <PerformancePanel />}
        {id === 'info' && <InfoPanel />}
      </div>
    </div>
  );
}

function AccessibilityPanel() {
  // Basic quick checks and helpers
  return (
    <div className="space-y-3 text-sm">
      <ul className="list-disc pl-5 space-y-1">
        <li>Ensure focus outlines are visible. Try tabbing through interactive elements.</li>
        <li>Verify landmarks and ARIA roles on key sections.</li>
        <li>Check color contrast for text on backgrounds.</li>
      </ul>
      <div className="flex gap-2">
        <ToggleOutlineButton />
      </div>
    </div>
  );
}

function ToggleOutlineButton() {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        setOn((v) => !v);
        if (isClient) {
          const cls = 'debug-focus-outline';
          if (!document.documentElement.classList.contains(cls)) {
            const style = document.createElement('style');
            style.id = 'debug-focus-outline-style';
            style.innerHTML = `
              .debug-focus-outline *:focus { outline: 2px dashed #22d3ee !important; outline-offset: 2px; }
            `;
            document.head.appendChild(style);
          }
          document.documentElement.classList.toggle(cls, !on);
        }
      }}
      className={`px-3 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-sm`}
    >
      {on ? 'Disable focus outlines' : 'Enable focus outlines'}
    </button>
  );
}

function PerformancePanel() {
  const [metrics, setMetrics] = useState<any>(null);

  function collect() {
    if (!isClient) return;
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const paints = performance.getEntriesByType('paint') as PerformanceEntry[];
    const fcp = paints.find((p) => p.name === 'first-contentful-paint')?.startTime;
    const cls = (window as any).__CLS; // if you have CLS tracker elsewhere

    setMetrics({
      ttfb: nav?.responseStart,
      domContentLoaded: nav?.domContentLoadedEventEnd,
      loadTime: nav?.loadEventEnd,
      fcp,
      cls,
      memory: (performance as any).memory ?? undefined,
    });
  }

  return (
    <div className="space-y-3 text-sm">
      <button onClick={collect} className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white">Collect metrics</button>
      {metrics && (
        <pre className="bg-black/40 rounded p-3 overflow-auto text-xs max-h-64">{JSON.stringify(metrics, null, 2)}</pre>
      )}
    </div>
  );
}

function InfoPanel() {
  const info = isClient
    ? {
        userAgent: navigator.userAgent,
        viewport: { w: window.innerWidth, h: window.innerHeight },
        displayMode: matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
        language: navigator.language,
        online: navigator.onLine,
      }
    : {};

  return (
    <pre className="bg-black/40 rounded p-3 overflow-auto text-xs max-h-64">{JSON.stringify(info, null, 2)}</pre>
  );
}

export default DebugBar;
