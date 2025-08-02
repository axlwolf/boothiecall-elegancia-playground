import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FinalResult from "@/components/FinalResult";
import {
  mockLayout,
  mockTemplate,
  mockPhotos,
  mockRenderWithProviders,
} from "../testUtils";

// Mock the gifshot library
vi.mock("gifshot", () => ({
  default: {
    createGIF: vi.fn(({ callback }) => {
      callback({
        error: false,
        errorCode: "",
        errorMsg: "",
        image: "data:image/gif;base64,mockGifData",
        cameraStream: null,
        videoElement: null,
        savedRenderingContexts: [],
        savedCameraFrames: [],
      });
    }),
  },
}));

// Mock the canvas methods
const mockToDataURL = vi.fn(() => "data:image/png;base64,mockImageData");
const mockGetContext = vi.fn(() => ({
  drawImage: vi.fn(),
  fillStyle: "",
  fillRect: vi.fn(),
  strokeStyle: "",
  lineWidth: 0,
  strokeRect: vi.fn(),
  font: "",
  textAlign: "",
  fillText: vi.fn(),
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
}));

// Mock Image constructor
class MockImage {
  onload: () => void = () => {};
  src: string = "";
  width: number = 100;
  height: number = 100;

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

// Mock frameMappings
vi.mock("@/components/frameMappings", () => ({
  default: {
    "template-1": {
      frameWidth: 400,
      frameHeight: 600,
      frame: "/designs/template-1.png",
      windows: [
        { x: 50, y: 50, width: 300, height: 200 },
        { x: 50, y: 270, width: 300, height: 200 },
      ],
    },
  },
}));

describe("FinalResult Component", () => {
  const onStartOverMock = vi.fn();
  const onBackMock = vi.fn();
  const onSessionCompleteMock = vi.fn();

  beforeEach(() => {
    // Setup canvas mock
    HTMLCanvasElement.prototype.toDataURL = mockToDataURL;
    HTMLCanvasElement.prototype.getContext = mockGetContext;
    global.Image = MockImage as any;

    // Clear mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders correctly with all props", async () => {
    render(
      <FinalResult
        layout={mockLayout}
        template={mockTemplate}
        photos={mockPhotos}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Check if main elements are rendered
    expect(screen.getByText("Your Photo Strip")).toBeInTheDocument();
    expect(screen.getByText("Download Photo Strip")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
    expect(screen.getByText("Print")).toBeInTheDocument();
    expect(screen.getByText("Start Over")).toBeInTheDocument();
    expect(screen.getByText("New Session")).toBeInTheDocument();

    // Check if canvas is rendered (hidden)
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass("hidden");

    // Check if onSessionComplete was called
    await waitFor(() => {
      expect(onSessionCompleteMock).toHaveBeenCalledWith(
        "data:image/png;base64,mockImageData",
        undefined
      );
    });
  });

  it("handles download button click", async () => {
    const user = userEvent.setup();

    render(
      <FinalResult
        layout={mockLayout}
        template={mockTemplate}
        photos={mockPhotos}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Mock the createObjectURL and revokeObjectURL
    const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
    const mockRevokeObjectURL = vi.fn();

    // Save original methods
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;

    // Replace with mocks
    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement for the anchor element
    const mockAnchor = {
      href: "",
      download: "",
      click: vi.fn(),
      remove: vi.fn(),
    };

    const originalCreateElement = document.createElement;
    document.createElement = vi.fn((tagName) => {
      if (tagName === "a") return mockAnchor as any;
      return originalCreateElement.call(document, tagName);
    });

    // Click download button
    const downloadButton = screen.getByText("Download Photo Strip");
    await user.click(downloadButton);

    // Check if anchor was created and clicked
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockAnchor.remove).toHaveBeenCalled();
    expect(mockAnchor.download).toBe("boothiecall_photostrip.png");

    // Restore original methods
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    document.createElement = originalCreateElement;
  });

  it("handles GIF generation when photos have gifData", async () => {
    const user = userEvent.setup();
    const photosWithGif = mockPhotos.map((photo) => ({
      ...photo,
      gifData: ["data:image/png;base64,frame1", "data:image/png;base64,frame2"],
    }));

    render(
      <FinalResult
        layout={mockLayout}
        template={mockTemplate}
        photos={photosWithGif}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Check if GIF button is rendered
    const gifButton = screen.getByText("Download Animated GIF");
    expect(gifButton).toBeInTheDocument();

    // Mock the createObjectURL and revokeObjectURL
    const mockCreateObjectURL = vi.fn(() => "blob:mock-gif-url");
    const mockRevokeObjectURL = vi.fn();

    // Save original methods
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;

    // Replace with mocks
    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement for the anchor element
    const mockAnchor = {
      href: "",
      download: "",
      click: vi.fn(),
      remove: vi.fn(),
    };

    const originalCreateElement = document.createElement;
    document.createElement = vi.fn((tagName) => {
      if (tagName === "a") return mockAnchor as any;
      return originalCreateElement.call(document, tagName);
    });

    // Click GIF button
    await user.click(gifButton);

    // Check if gifshot.createGIF was called
    await waitFor(() => {
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toBe("boothiecall_animated.gif");
    });

    // Restore original methods
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    document.createElement = originalCreateElement;
  });

  it("opens share modal when share button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <FinalResult
        layout={mockLayout}
        template={mockTemplate}
        photos={mockPhotos}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Click share button
    const shareButton = screen.getByText("Share");
    await user.click(shareButton);

    // Check if ShareModal is opened
    await waitFor(() => {
      expect(
        screen.getByText(`${mockTemplate.name} Photo Strip`)
      ).toBeInTheDocument();
    });
  });

  it("opens print modal when print button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <FinalResult
        layout={mockLayout}
        template={mockTemplate}
        photos={mockPhotos}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Click print button
    const printButton = screen.getByText("Print");
    await user.click(printButton);

    // Check if PrintPreview is opened
    await waitFor(() => {
      expect(
        screen.getByText(`${mockTemplate.name} Photo Strip`)
      ).toBeInTheDocument();
    });
  });

  it("calls onStartOver when start over button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <FinalResult
        layout={mockLayout}
        template={mockTemplate}
        photos={mockPhotos}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Click start over button
    const startOverButton = screen.getByText("Start Over");
    await user.click(startOverButton);

    // Check if onStartOver was called
    expect(onStartOverMock).toHaveBeenCalled();
  });

  it("calls onBack when back button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <FinalResult
        layout={mockLayout}
        template={mockTemplate}
        photos={mockPhotos}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Click back button
    const backButton = screen.getByText("Back to Filters");
    await user.click(backButton);

    // Check if onBack was called
    expect(onBackMock).toHaveBeenCalled();
  });

  it("handles fallback when template mapping is not found", async () => {
    // Mock console.error
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Create a template that doesn't have a mapping
    const unmappedTemplate = { ...mockTemplate, id: "non-existent-template" };

    render(
      <FinalResult
        layout={mockLayout}
        template={unmappedTemplate}
        photos={mockPhotos}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Check if error was logged
    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith(
        "No frame mapping found for template:",
        "non-existent-template"
      );
    });

    // Check if fallback rendering was used
    const mockCtx = mockGetContext.mock.results[0].value;
    expect(mockCtx.fillStyle).toBe("#1a1a2e");
    expect(mockCtx.strokeStyle).toBe("#D8AE48");

    consoleErrorMock.mockRestore();
  });
});
