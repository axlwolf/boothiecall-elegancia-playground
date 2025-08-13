import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Types
export interface MockPhotoSession {
  id: string;
  photos: string[];
  template: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

// Mock data exports for tests
export const mockLayout = {
  id: 'layout-3shot',
  name: 'Three Shot Layout',
  shots: 3,
  description: 'A layout with three photo slots',
  dimensions: { width: 400, height: 600 }
};

export const mockPhotos = [
  'data:image/jpeg;base64,mockPhotoData1',
  'data:image/jpeg;base64,mockPhotoData2',
  'data:image/jpeg;base64,mockPhotoData3'
];

export const mockTemplate = {
  id: 'template-1',
  name: 'Template 1',
  layout: '3shot',
  assets: {
    previewImage: '/designs/template-1.png',
    overlayImage: '/templates/template-1-overlay.png',
  },
  dimensions: {
    width: 400,
    height: 600,
  },
  photoSlots: [
    { x: 50, y: 50, width: 300, height: 150 },
    { x: 50, y: 220, width: 300, height: 150 },
    { x: 50, y: 390, width: 300, height: 150 },
  ],
};

export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage?: {
    used: number;
    total: number;
  };
}

// Mock Factories
export const createMockPhotoSession = (overrides: Partial<MockPhotoSession> = {}): MockPhotoSession => ({
  id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
  template: '3shot-template',
  createdAt: new Date(),
  metadata: {
    device: 'test-device',
    userAgent: 'test-agent',
  },
  ...overrides,
});

export const createMockPhotos = (count: number = 3): string[] => {
  return Array.from({ length: count }, (_, i) => `mock-photo-${i + 1}.jpg`);
};

export const createMockTemplate = (id: string = 'test-template') => ({
  id,
  name: `Template ${id}`,
  layout: '3shot',
  assets: {
    previewImage: `/designs/${id}.png`,
    overlayImage: `/templates/${id}-overlay.png`,
  },
  dimensions: {
    width: 800,
    height: 1200,
  },
  photoSlots: [
    { x: 100, y: 100, width: 200, height: 300 },
    { x: 100, y: 450, width: 200, height: 300 },
    { x: 100, y: 800, width: 200, height: 300 },
  ],
});

// Memory Leak Detection
export const detectMemoryLeaks = async (): Promise<boolean> => {
  // Force garbage collection if available
  if (typeof window !== 'undefined' && 'gc' in window) {
    (window as { gc: () => void }).gc();
  }

  // Wait for cleanup
  await new Promise(resolve => setTimeout(resolve, 100));

  // Check for common memory leak indicators
  const memoryInfo = (performance as { memory?: { usedJSHeapSize: number } }).memory;
  if (memoryInfo) {
    const threshold = 50 * 1024 * 1024; // 50MB threshold for tests
    return memoryInfo.usedJSHeapSize > threshold;
  }

  return false;
};

// Performance measurement utility
export const measurePerformance = async <T,>(operationFn: () => Promise<T> | T, operationName = 'operation'): Promise<{ result: T; metrics: PerformanceMetrics }> => {
  const startTime = performance.now();
  const startMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;

  const result = await operationFn();

  const endTime = performance.now();
  const endMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;

  const metrics: PerformanceMetrics = {
    startTime,
    endTime,
    duration: endTime - startTime,
  };

  if (startMemory !== undefined && endMemory !== undefined) {
    metrics.memoryUsage = {
      used: endMemory - startMemory,
      total: endMemory,
    };
  }

  return { result, metrics };
};

// Error Boundary for Testing
export class TestErrorBoundary extends React.Component<
  { children: ReactNode; onError?: (error: Error, errorInfo: React.ErrorInfo) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; onError?: (error: Error, errorInfo: React.ErrorInfo) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong: {this.state.error?.message}</div>;
    }

    return this.props.children;
  }
}

// Custom Render with Providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  withRouter?: boolean;
  withErrorBoundary?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

const AllTheProviders = ({ 
  children, 
  initialEntries = ['/'], 
  withRouter = true,
  withErrorBoundary = false,
  onError,
}: {
  children: ReactNode;
  initialEntries?: string[];
  withRouter?: boolean;
  withErrorBoundary?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}) => {
  let content = children;

  if (withRouter) {
    content = (
      <BrowserRouter>
        {content}
      </BrowserRouter>
    );
  }

  if (withErrorBoundary) {
    content = (
      <TestErrorBoundary onError={onError}>
        {content}
      </TestErrorBoundary>
    );
  }

  return <>{content}</>;
};

export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { 
    initialEntries, 
    withRouter = true, 
    withErrorBoundary = false, 
    onError,
    ...renderOptions 
  } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        initialEntries={initialEntries}
        withRouter={withRouter}
        withErrorBoundary={withErrorBoundary}
        onError={onError}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Mock render with providers for tests
export const mockRenderWithProviders = (ui: ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

// Mock Services
export const createMockStorageService = () => ({
  saveSession: vi.fn().mockResolvedValue(true),
  getSession: vi.fn().mockResolvedValue(null),
  getAllSessions: vi.fn().mockResolvedValue([]),
  deleteSession: vi.fn().mockResolvedValue(true),
  clearAllSessions: vi.fn().mockResolvedValue(true),
});

// Async Helpers
export const waitForCondition = async (
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> => {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
};

// Cleanup Helpers
export const cleanupAfterTest = async () => {
  // Clear all timers
  vi.clearAllTimers();
  
  // Clear all mocks
  vi.clearAllMocks();
  
  // Force garbage collection if available
  if (typeof window !== 'undefined' && 'gc' in window) {
    (window as { gc: () => void }).gc();
  }
  
  // Clear localStorage and sessionStorage
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
  
  // Wait for cleanup
  await new Promise(resolve => setTimeout(resolve, 0));
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
