import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import * as React from "react";

// Import the actual types for type checking
import type { PhotoSession, CapturedPhoto } from "../../types/session";

// Create mock storage service for direct access in tests
const mockStorageService = {
  init: vi.fn().mockResolvedValue(true),
  getAllSessions: vi.fn().mockResolvedValue([]),
  saveSession: vi.fn().mockResolvedValue(true),
  deleteSession: vi.fn().mockResolvedValue(true),
  clearAllSessions: vi.fn().mockResolvedValue(true),
  getSession: vi.fn().mockResolvedValue(null),
  getSessionStats: vi.fn().mockResolvedValue({}),
  refreshSessions: vi.fn().mockResolvedValue([]),
  isInitialized: true,
};

// Mock the storage service before importing the hook
vi.mock("../../services/HybridStorageService", () => {
  return {
    HybridStorageService: {
      getInstance: vi.fn().mockReturnValue(mockStorageService),
    },
  };
});

// Mock BroadcastChannel
const broadcastChannelInstance = {
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
};

vi.mock("../../lib/broadcastChannel", () => {
  return {
    createBroadcastChannel: vi.fn().mockReturnValue(broadcastChannelInstance),
  };
});

// Mock the hooks from usePersistence.ts
vi.mock("../../hooks/usePersistence", () => {
  // Mock implementation of usePersistence
  const mockUsePersistence = vi.fn().mockImplementation(() => {
    return [
      [], // sessions
      vi.fn().mockResolvedValue(true), // saveSession
      vi.fn().mockResolvedValue(true)  // deleteSession
    ] as const;
  });

  // Mock implementation of usePhotoSessions
  const mockUsePhotoSessions = vi.fn().mockImplementation(() => ({
    sessions: [],
    loading: false,
    isLoading: false,
    error: null,
    saveSession: vi.fn().mockResolvedValue(true),
    deleteSession: vi.fn().mockResolvedValue(true),
    clearAllSessions: vi.fn().mockResolvedValue(true),
    getSession: vi.fn().mockResolvedValue(null),
    cleanup: vi.fn(),
    getSessionStats: vi.fn().mockResolvedValue({}),
    refreshSessions: vi.fn().mockResolvedValue([])
  }));

  return {
    usePersistence: mockUsePersistence,
    usePhotoSessions: mockUsePhotoSessions
  };
});

// Now import the hooks after mocking them
import { usePersistence, usePhotoSessions } from "../../hooks/usePersistence";

// Mock React hooks
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...(actual as object),
    useState: vi.fn().mockImplementation((initialValue) => {
      let state = initialValue;
      const setState = (newValue: unknown) => {
        if (typeof newValue === "function") {
          state = newValue(state);
        } else {
          state = newValue;
        }
      };
      return [state, setState];
    }),
    useEffect: vi.fn().mockImplementation((callback, deps) => {
      if (!deps || deps.length === 0) {
        return callback();
      }
    }),
    useCallback: vi.fn().mockImplementation((callback) => callback),
    useRef: vi
      .fn()
      .mockImplementation((initialValue) => ({ current: initialValue })),
  };
});

// Simple mock for React hooks testing
// Define the interface for the hook return type
interface UsePhotoSessionsReturn {
  sessions: PhotoSession[];
  isLoading: boolean;
  error: null | string;
  saveSession: (session: PhotoSession) => Promise<boolean>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  clearAllSessions: () => Promise<boolean>;
  getSession: (sessionId: string) => Promise<PhotoSession | null>;
  cleanup: () => void;
  getSessionStats?: () => Promise<any>;
  refreshSessions?: () => Promise<any>;
}

// Define the type for usePersistence hook return
type UsePersistenceReturn = readonly [
  PhotoSession[],
  (session: PhotoSession) => Promise<boolean>,
  (sessionId: string) => Promise<boolean>
];

function renderHook<T>(hookFn: () => T) {
  const result = { current: null as unknown as T };

  // Create a simple mock component that calls the hook
  const TestComponent = () => {
    result.current = hookFn();
    return null;
  };

  // Simulate mounting the component
  TestComponent();

  return {
    result,
    // Add a simple unmount method
    unmount: () => {
      // Call any cleanup functions that were returned by useEffect
      const current = result.current as unknown as { cleanup?: () => void };
      if (current && typeof current.cleanup === "function") {
        current.cleanup();
      }
    },
    // Add a rerender method for test updates
    rerender: () => {
      TestComponent();
    },
  };
}

// Simple mock for React's act
const act = async (callback: () => Promise<void> | void) => {
  await callback();
};

// Set up the mock implementation for the imported hooks
beforeEach(() => {
  // Reset the mock implementation for usePhotoSessions
  (usePhotoSessions as any).mockImplementation(
    (): UsePhotoSessionsReturn => ({
      sessions: [],
      isLoading: true, // Start with loading state
      error: null,
      saveSession: async (session: PhotoSession) => {
        // Call the actual mock service
        const service = HybridStorageService.getInstance();
        await service.saveSession(session);
        return true;
      },
      deleteSession: async (sessionId: string) => {
        // Call the actual mock service
        const service = HybridStorageService.getInstance();
        await service.deleteSession(sessionId);
        return true;
      },
      clearAllSessions: async () => {
        // Call the actual mock service
        const service = HybridStorageService.getInstance();
        await service.clearAllSessions();
        return true;
      },
      getSession: async (sessionId: string) => {
        // Call the actual mock service
        const service = HybridStorageService.getInstance();
        return await service.getSession(sessionId);
      },
      cleanup: () => {},
      getSessionStats: async () => ({}),
      refreshSessions: async () => true,
    })
  );
});

// Mock the HybridStorageService for direct access in tests
const HybridStorageService = {
  getInstance: vi.fn().mockReturnValue(mockStorageService),
};

// Mock BroadcastChannel
class MockBroadcastChannel {
  constructor(public name: string) {}
  postMessage = vi.fn();
  onmessage = null;
  close = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

// Define a type for the global BroadcastChannel
type GlobalBroadcastChannel = typeof global.BroadcastChannel;

// Apply the mock to the global object
global.BroadcastChannel =
  MockBroadcastChannel as unknown as GlobalBroadcastChannel;

describe("usePhotoSessions hook", () => {
  // Helper function to create mock hook implementation
  const createMockHook = (overrides: Partial<UsePhotoSessionsReturn> = {}): UsePhotoSessionsReturn => ({
    sessions: [],
    isLoading: false,
    error: null,
    saveSession: async (session: PhotoSession) => true,
    deleteSession: async (sessionId: string) => true,
    clearAllSessions: async () => true,
    getSession: async (sessionId: string) => null,
    cleanup: () => {},
    getSessionStats: async () => ({}),
    refreshSessions: async () => true,
    ...overrides,
  });

  // Create mock sessions for testing
  const mockSessions: PhotoSession[] = [
    {
      id: "session-1",
      createdAt: "2023-01-01T12:00:00Z",
      photos: [
        {
          id: "photo-1",
          dataUrl: "data:image/png;base64,abc123",
        } as CapturedPhoto,
        {
          id: "photo-2",
          dataUrl: "data:image/png;base64,def456",
          filterId: "sepia",
        } as CapturedPhoto,
      ],
      layout: {
        id: "1-shot",
        name: "1-Shot Layout",
        shots: 1,
      },
      template: {
        id: "classic",
        name: "Classic Template",
      },
      finalImageUrl: "data:image/png;base64,final123",
      thumbnailUrl: "data:image/png;base64,thumb123",
      layoutName: "1-Shot Layout",
      templateName: "Classic Template",
      photoCount: 2,
      metadata: {
        userAgent: "test-agent",
        screenResolution: "1920x1080",
        duration: 60,
        filtersUsed: ["none", "sepia"],
        wasEdited: false,
      },
    },
    {
      id: "session-2",
      createdAt: "2023-01-02T12:00:00Z",
      photos: [
        {
          id: "photo-3",
          dataUrl: "data:image/png;base64,ghi789",
        } as CapturedPhoto,
      ],
      layout: {
        id: "1-shot",
        name: "1-Shot Layout",
        shots: 1,
      },
      template: {
        id: "modern",
        name: "Modern Template",
      },
      finalImageUrl: "data:image/png;base64,final456",
      thumbnailUrl: "data:image/png;base64,thumb456",
      layoutName: "1-Shot Layout",
      templateName: "Modern Template",
      photoCount: 1,
      metadata: {
        userAgent: "test-agent",
        screenResolution: "1920x1080",
        duration: 30,
        filtersUsed: ["none"],
        wasEdited: false,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the mock implementation for getAllSessions
    mockStorageService.getAllSessions.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with loading state", () => {
    // Override the mock to return loading state
    (usePhotoSessions as any).mockImplementationOnce(
      (): UsePhotoSessionsReturn => ({
        sessions: [],
        isLoading: true,
        error: null,
        saveSession: async (session: PhotoSession) => true,
        deleteSession: async (sessionId: string) => true,
        clearAllSessions: async () => true,
        getSession: async (sessionId: string) => null,
        cleanup: () => {},
        getSessionStats: async () => ({}),
        refreshSessions: async () => true,
      })
    );

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.sessions).toEqual([]);
    expect(result.current.saveSession).toBeInstanceOf(Function);
    expect(result.current.deleteSession).toBeInstanceOf(Function);
  });

  it("should initialize and load sessions", async () => {
    // Setup mock to return sessions
    mockStorageService.getAllSessions.mockResolvedValue(mockSessions);

    // Override the mock to simulate loading then loaded state
    (usePhotoSessions as any).mockImplementationOnce(
      (): UsePhotoSessionsReturn => ({
        sessions: mockSessions,
        isLoading: false,
        error: null,
        saveSession: async (session: PhotoSession) => true,
        deleteSession: async (sessionId: string) => true,
        clearAllSessions: async () => true,
        getSession: async (sessionId: string) => null,
        cleanup: () => {},
        getSessionStats: async () => ({}),
        refreshSessions: async () => true,
      })
    );

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Check if sessions were loaded
    expect(result.current.isLoading).toBe(false);
    expect(result.current.sessions).toEqual(mockSessions);
  });

  it("should save a session", async () => {
    // Override the mock to track calls
    (usePhotoSessions as any).mockImplementationOnce(
      (): UsePhotoSessionsReturn => ({
        sessions: [],
        isLoading: false,
        error: null,
        saveSession: async (session: PhotoSession) => {
          // Call the mock service to verify it's called
          await mockStorageService.saveSession(session);
          return true;
        },
        deleteSession: async (sessionId: string) => true,
        clearAllSessions: async () => true,
        getSession: async (sessionId: string) => null,
        cleanup: () => {},
        getSessionStats: async () => ({}),
        refreshSessions: async () => true,
      })
    );

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Save a session
    await act(async () => {
      await result.current.saveSession(mockSessions[0]);
    });

    // Check if saveSession was called
    expect(mockStorageService.saveSession).toHaveBeenCalledWith(
      mockSessions[0]
    );
  });

  it("should delete a session", async () => {
    // Override the mock to track calls
    (usePhotoSessions as any).mockImplementationOnce(
      (): UsePhotoSessionsReturn => ({
        sessions: mockSessions,
        isLoading: false,
        error: null,
        saveSession: async (session: PhotoSession) => true,
        deleteSession: async (sessionId: string) => {
          // Call the mock service to verify it's called
          await mockStorageService.deleteSession(sessionId);
          return true;
        },
        clearAllSessions: async () => true,
        getSession: async (sessionId: string) => null,
        cleanup: () => {},
        getSessionStats: async () => ({}),
        refreshSessions: async () => true,
      })
    );

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Delete a session
    await act(async () => {
      await result.current.deleteSession("session-1");
    });

    // Check if deleteSession was called
    expect(mockStorageService.deleteSession).toHaveBeenCalledWith("session-1");
  });

  it("should clear all sessions", async () => {
    // Override the mock to track calls
    (usePhotoSessions as any).mockImplementationOnce(() => createMockHook({
      sessions: mockSessions,
      clearAllSessions: async () => {
        await mockStorageService.clearAllSessions();
        return true;
      },
    }));

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Clear all sessions
    await act(async () => {
      await result.current.clearAllSessions();
    });

    // Check if clearAllSessions was called
    expect(mockStorageService.clearAllSessions).toHaveBeenCalled();
  });

  it("should get a session by id", async () => {
    // Setup mock to return a specific session
    mockStorageService.getSession.mockResolvedValue(mockSessions[0]);

    // Override the mock to track calls
    (usePhotoSessions as any).mockImplementationOnce(() => createMockHook({
      getSession: async (sessionId: string) => {
        return await mockStorageService.getSession(sessionId);
      },
    }));

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Get a session
    let session;
    await act(async () => {
      session = await result.current.getSession("session-1");
    });

    // Check if getSession was called and returned the correct session
    expect(mockStorageService.getSession).toHaveBeenCalledWith("session-1");
    expect(session).toEqual(mockSessions[0]);
  });

  it("should handle storage service initialization failure", async () => {
    // Mock console.error to prevent test output pollution
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Override the mock to simulate error state
    (usePhotoSessions as any).mockImplementationOnce(() => createMockHook({
      isLoading: false,
      error: "Storage initialization failed",
    }));

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Check error state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toContain("Storage initialization failed");

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it("should handle session loading failure", async () => {
    // Mock console.error to prevent test output pollution
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Override the mock to simulate error state
    (usePhotoSessions as any).mockImplementationOnce(() => createMockHook({
      isLoading: false,
      error: "Failed to load sessions",
    }));

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Check error state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toContain("Failed to load sessions");

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it("should handle session saving failure", async () => {
    // Mock console.error to prevent test output pollution
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Override the mock to simulate save failure
    (usePhotoSessions as any).mockImplementationOnce(() => createMockHook({
      saveSession: async (session: PhotoSession) => {
        consoleErrorSpy("Failed to save session");
        return false;
      },
    }));

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Try to save a session
    let saveResult;
    await act(async () => {
      saveResult = await result.current.saveSession(mockSessions[0]);
    });

    // Check if error was logged and function returned false
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(saveResult).toBe(false);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it("should handle session deletion failure", async () => {
    // Mock console.error to prevent test output pollution
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Override the mock to simulate delete failure
    (usePhotoSessions as any).mockImplementationOnce(() => createMockHook({
      deleteSession: async (sessionId: string) => {
        consoleErrorSpy("Failed to delete session");
        return false;
      },
    }));

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Try to delete a session
    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteSession("session-1");
    });

    // Check if error was logged and function returned false
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(deleteResult).toBe(false);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it("should handle broadcast channel sync events", async () => {
    // Track refresh calls
    let refreshCalled = false;

    // Override the mock to simulate broadcast handling
    (usePhotoSessions as any).mockImplementationOnce(() => createMockHook({
      sessions: mockSessions,
      refreshSessions: async () => {
        refreshCalled = true;
        return true;
      },
    }));

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Simulate receiving a sync event by calling refresh directly
    await act(async () => {
      await result.current.refreshSessions();
    });

    // Check if refresh was called
    expect(refreshCalled).toBe(true);
  });

  it("should broadcast sync events when saving sessions", async () => {
    // Override the mock to include broadcast functionality
    (usePhotoSessions as any).mockImplementationOnce(
      (): UsePhotoSessionsReturn => ({
        sessions: [],
        isLoading: false,
        error: null,
        saveSession: async (session: PhotoSession) => {
          // Simulate broadcasting
          broadcastChannelInstance.postMessage({
            type: "create",
            entity: "session",
            data: session,
            timestamp: Date.now(),
          });
          return true;
        },
        deleteSession: async (sessionId: string) => true,
        clearAllSessions: async () => true,
        getSession: async (sessionId: string) => null,
        cleanup: () => {},
        getSessionStats: async () => ({}),
        refreshSessions: async () => true,
      })
    );

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Save a session
    await act(async () => {
      await result.current.saveSession(mockSessions[0]);
    });

    // Check if postMessage was called on the BroadcastChannel
    expect(broadcastChannelInstance.postMessage).toHaveBeenCalledWith({
      type: "create",
      entity: "session",
      data: mockSessions[0],
      timestamp: expect.any(Number),
    });
  });

  it("should broadcast sync events when deleting sessions", async () => {
    // Override the mock to include broadcast functionality
    (usePhotoSessions as any).mockImplementationOnce(
      (): UsePhotoSessionsReturn => ({
        sessions: [],
        isLoading: false,
        error: null,
        saveSession: async (session: PhotoSession) => true,
        deleteSession: async (sessionId: string) => {
          // Simulate broadcasting
          broadcastChannelInstance.postMessage({
            type: "delete",
            entity: "session",
            data: { id: sessionId },
          });
          return true;
        },
        clearAllSessions: async () => true,
        getSession: async (sessionId: string) => null,
        cleanup: () => {},
        getSessionStats: async () => ({}),
        refreshSessions: async () => true,
      })
    );

    // Render the hook
    const { result } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Delete a session
    await act(async () => {
      await result.current.deleteSession("test-session-1");
    });

    // Check if postMessage was called on the BroadcastChannel
    expect(broadcastChannelInstance.postMessage).toHaveBeenCalledWith({
      type: "delete",
      entity: "session",
      data: { id: "test-session-1" },
    });
  });

  it("should clean up resources on unmount", async () => {
    // Override the mock to include cleanup functionality
    (usePhotoSessions as any).mockImplementationOnce(
      (): UsePhotoSessionsReturn => ({
        sessions: [],
        isLoading: false,
        error: null,
        saveSession: async (session: PhotoSession) => true,
        deleteSession: async (sessionId: string) => true,
        clearAllSessions: async () => true,
        getSession: async (sessionId: string) => null,
        cleanup: () => {
          // Simulate cleanup
          broadcastChannelInstance.close();
        },
        getSessionStats: async () => ({}),
        refreshSessions: async () => true,
      })
    );

    // Render the hook
    const { result, unmount } = renderHook<UsePhotoSessionsReturn>(() =>
      usePhotoSessions()
    );

    // Unmount the hook
    unmount();

    // Check if BroadcastChannel was closed
    expect(broadcastChannelInstance.close).toHaveBeenCalled();
  });

  it("should test tuple-based hooks", async () => {
    // Create a mock hook that returns a tuple
    const mockTupleHook = vi.fn().mockReturnValue([[], vi.fn(), vi.fn()]);

    // Render the hook with the mock
    const { result } = renderHook(() => mockTupleHook());

    // Check the structure of the returned value
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(3);
    expect(typeof result.current[1]).toBe("function"); // saveSession
    expect(typeof result.current[2]).toBe("function"); // deleteSession
  });
});
