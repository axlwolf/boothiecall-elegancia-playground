import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FinalResult from "@/components/FinalResult";
import { mockLayout } from "../testUtils";

// Create mock data with minimal required properties
const mockTemplate = {
  id: "template-1",
  name: "Template 1",
  layout: "3shot",
  assets: {
    previewImage: "/designs/template-1.png",
    overlayImage: "/templates/template-1-overlay.png",
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

const mockPhotos = [
  {
    id: "photo-1",
    dataUrl: "data:image/jpeg;base64,mockPhotoData1",
    timestamp: Date.now(),
  },
  {
    id: "photo-2",
    dataUrl: "data:image/jpeg;base64,mockPhotoData2",
    timestamp: Date.now(),
  },
  {
    id: "photo-3",
    dataUrl: "data:image/jpeg;base64,mockPhotoData3",
    timestamp: Date.now(),
  },
];

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn(() => "blob:test");

// Mock window.print
const mockPrint = vi.fn();

// Apply mocks
beforeEach(() => {
  global.ResizeObserver = mockResizeObserver;
  global.URL.createObjectURL = mockCreateObjectURL;
  global.window.print = mockPrint;
});

// Mock the gifshot library
vi.mock("gifshot", () => ({
  default: {
    createGIF: vi.fn(({ callback }) => {
      if (typeof callback === "function") {
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
      }
    }),
  },
}));

// Mock the canvas methods
const mockToDataURL = vi.fn(() => "data:image/png;base64,mockImageData");
const mockGetContext = vi.fn(
  () =>
    ({
      canvas: {} as HTMLCanvasElement,
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
      beginPath: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
      fill: vi.fn(),
      stroke: vi.fn(),
    } as any)
);

// Mock Image constructor
class MockImage {
  onload: () => void = () => {};
  onerror: () => void = () => {};
  src: string = "";
  width: number = 100;
  height: number = 100;
  complete: boolean = true;
  naturalWidth: number = 100;
  naturalHeight: number = 100;

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
        { left: 50, top: 50, width: 300, height: 150 },
        { left: 50, top: 270, width: 300, height: 150 },
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
        template={mockTemplate as any}
        photos={mockPhotos as any}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Check if main elements are rendered
    expect(screen.getByText("Your Photo Strip")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /download/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /print/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start over/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /new session/i })
    ).toBeInTheDocument();

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
        template={mockTemplate as any}
        photos={mockPhotos as any}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Click download button
    const downloadButton = screen.getByRole("button", { name: /download/i });
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).not.toBeDisabled();
  });

  it("handles GIF generation when photos have gifData", async () => {
    const user = userEvent.setup();
    const photosWithGif = mockPhotos.map((photo) => ({
      ...photo,
      gifData: new Blob(["mock-gif-data"], { type: "image/gif" }),
    }));

    render(
      <FinalResult
        layout={mockLayout}
        template={mockTemplate as any}
        photos={photosWithGif as any}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Check if GIF button is rendered
    const gifButton = screen.getByRole("button", {
      name: /download animated gif/i,
    });
    expect(gifButton).toBeInTheDocument();
    expect(gifButton).not.toBeDisabled();
  });

  it("opens share modal when share button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <FinalResult
        layout={mockLayout}
        template={mockTemplate as any}
        photos={mockPhotos as any}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Click share button
    const shareButton = screen.getByRole("button", { name: /share/i });
    await user.click(shareButton);

    // Check if ShareModal is opened - look for the modal title
    await waitFor(
      () => {
        expect(screen.getByText(`${mockTemplate.name} Photo Strip`)).toBeInTheDocument();
      },
      { timeout: 15000 }
    );
  });

  it("opens print modal when print button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <FinalResult
        layout={mockLayout}
        template={mockTemplate as any}
        photos={mockPhotos as any}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Click print button
    const printButton = screen.getByRole("button", { name: /print/i });
    await user.click(printButton);

    // Check if PrintPreview is opened - look for the modal title
    await waitFor(
      () => {
        expect(
          screen.getByText(`${mockTemplate.name} Photo Strip`)
        ).toBeInTheDocument();
      },
      { timeout: 15000 }
    );
  });

  it("calls onStartOver when start over button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <FinalResult
        layout={mockLayout}
        template={mockTemplate as any}
        photos={mockPhotos as any}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Click start over button
    const startOverButton = screen.getByRole("button", { name: /start over/i });
    await user.click(startOverButton);

    // Check if onStartOver was called
    expect(onStartOverMock).toHaveBeenCalled();
  });

  it("calls onBack when back button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <FinalResult
        layout={mockLayout}
        template={mockTemplate as any}
        photos={mockPhotos as any}
        onStartOver={onStartOverMock}
        onBack={onBackMock}
        onSessionComplete={onSessionCompleteMock}
      />
    );

    // Click back button
    const backButton = screen.getByRole("button", { name: /back to filters/i });
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
    const unmappedTemplate = {
      ...mockTemplate,
      id: "non-existent-template",
    };

    render(
      <FinalResult
        layout={mockLayout}
        template={unmappedTemplate as any}
        photos={mockPhotos as any}
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

    consoleErrorMock.mockRestore();
  });
});
