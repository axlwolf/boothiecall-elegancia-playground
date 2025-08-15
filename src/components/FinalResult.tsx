import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  RotateCcw,
  Share2,
  Camera,
  Home,
  Video,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// Importing CSS module library doesn't have TypeScript definitions
import gifshot from "gifshot";
import { Layout, CapturedPhoto } from "@/types/layout";
import { Template } from "@/types/templates";
import { FrameMapping } from "@/types";
import ShareModal from "./ShareModal";
import PrintPreview from "./PrintPreview";
import frameMappings from "./frameMappings";
import { FilterEngine } from "@/lib/filterEngine";
import { enhancedFilters } from "@/types/filters";
import { ImageAdjustments } from "@/lib/imageProcessing";

interface FinalResultProps {
  layout: Layout;
  template: Template;
  photos: CapturedPhoto[];
  onStartOver: () => void;
  onBack: () => void;
  onSessionComplete?: (finalImageUrl: string, gifUrl?: string) => void;
}

const FinalResult = ({
  layout,
  template,
  photos,
  onStartOver,
  onBack,
  onSessionComplete,
}: FinalResultProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [finalImageUrl, setFinalImageUrl] = useState<string>("");
  const [generatedGifUrl, setGeneratedGifUrl] = useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generatedGifUrlRef = useRef<string>(generatedGifUrl);
  // Keep a ref to the latest onSessionComplete to avoid effect re-running when its identity changes
  const onSessionCompleteRef =
    useRef<typeof onSessionComplete>(onSessionComplete);
  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  // Compute a stable key for the current session (template + photo IDs)
  const sessionKey = useMemo(() => {
    const tpl = (template?.id || "no-template").replace(/^["']|["']$/g, "");
    const lay = layout?.id || "no-layout";
    const photoKey = Array.isArray(photos)
      ? photos.map((p) => p.id).join("|")
      : "no-photos";
    return `${tpl}__${lay}__${photoKey}`;
  }, [template?.id, layout?.id, photos]);

  // Guard to ensure we only initialize once per sessionKey
  const initializedSessionKeyRef = useRef<string | null>(null);

  // Check if any photos have GIF data or sampled frames (iOS fallback)
  const hasGifData = useMemo(() => {
    return photos && Array.isArray(photos)
      ? photos.some((photo) => photo.gifData || (photo.gifFrames && photo.gifFrames.length > 0))
      : false;
  }, [photos]);

  // Update the ref when generatedGifUrl changes
  useEffect(() => {
    generatedGifUrlRef.current = generatedGifUrl;
  }, [generatedGifUrl]);

  // Calculate canvas dimensions based on template and layout
  const getCanvasDimensions = useCallback(() => {
    const baseWidth = 400;
    let baseHeight = 600;

    if (layout && typeof layout.shots === "number") {
      switch (layout.shots) {
        case 1:
          baseHeight = 500;
          break;
        case 3:
          baseHeight = 650;
          break;
        case 4:
          baseHeight = 700;
          break;
        case 6:
          baseHeight = 500;
          break;
        default:
          baseHeight = layout.shots * 150 + 100;
      }
    }

    return { width: baseWidth, height: baseHeight };
  }, [layout]);

  const generatePhotoStrip = useCallback(async () => {
    if (!canvasRef.current) return;

    // Ensure template is provided
    if (!template) {
      console.error("No template provided for photo strip generation");
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Get frame mapping for this template (normalize id to avoid quotes)
      const templateId = (template.id || "").replace(/^["']|["']$/g, "");
      const frameMapping = frameMappings[templateId];

      // Log template information for debugging
      console.log("Generating photo strip with template:", {
        originalId: template.id,
        normalizedId: templateId,
        name: template.name,
      });
      console.log("Frame mapping found:", frameMapping ? "Yes" : "No");

      if (!frameMapping) {
        console.error("No frame mapping found for template:", template.id);
        // Fallback to simple generation if template fails
        const { width: stripWidth, height: stripHeight } =
          getCanvasDimensions();

        // Simple fallback styling
        canvas.width = stripWidth;
        canvas.height = stripHeight;
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, stripWidth, stripHeight);
        ctx.strokeStyle = "#D8AE48";
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, stripWidth - 4, stripHeight - 4);
        return;
      }

      // Set canvas dimensions to match frame dimensions
      canvas.width = frameMapping.frameWidth;
      canvas.height = frameMapping.frameHeight;

      // Clear canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Load and draw the background frame first
      const frameImg = new Image();
      frameImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        frameImg.onload = () => {
          ctx.drawImage(
            frameImg,
            0,
            0,
            frameMapping.frameWidth,
            frameMapping.frameHeight
          );
          resolve();
        };
        frameImg.onerror = (err) => {
          console.error("Error loading frame image:", err);
          reject(err);
        };
        // Ensure we're using the correct frame path and load CORS-safe
        frameImg.src = `${frameMapping.frame}?${Date.now()}`;
        console.log("Loading frame from:", frameImg.src);
      }).catch((err) => {
        console.error("Failed to load frame image:", err);
      });

      // Load and draw photos using precise frame mapping coordinates
      const photoPromises = photos.map((photo, index) => {
        return new Promise<void>((resolve) => {
          if (index >= frameMapping.windows.length) {
            resolve();
            return;
          }

          const window = frameMapping.windows[index];
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            // Compute aspect ratios for cropping
            const imgAspect = img.width / img.height;
            const windowAspect = window.width / window.height;
            let sourceX = 0,
              sourceY = 0,
              sourceWidth = img.width,
              sourceHeight = img.height;

            // Crop image to fit window aspect ratio (center crop)
            if (imgAspect > windowAspect) {
              // Image is wider than window, crop sides
              sourceWidth = img.height * windowAspect;
              sourceX = (img.width - sourceWidth) / 2;
            } else {
              // Image is taller than window, crop top/bottom
              sourceHeight = img.width / windowAspect;
              sourceY = (img.height - sourceHeight) / 2;
            }

            // Draw photo with proper aspect ratio preservation
            ctx.save();
            ctx.beginPath();
            if (window.borderRadius) {
              ctx.roundRect(
                window.left,
                window.top,
                window.width,
                window.height,
                window.borderRadius
              );
            } else {
              ctx.rect(window.left, window.top, window.width, window.height);
            }
            ctx.clip();
            ctx.drawImage(
              img,
              sourceX,
              sourceY,
              sourceWidth,
              sourceHeight,
              window.left,
              window.top,
              window.width,
              window.height
            );
            ctx.restore();

            // Log positioning for debugging
            console.log(`Photo ${index} positioned:`, {
              source: {
                x: sourceX,
                y: sourceY,
                width: sourceWidth,
                height: sourceHeight,
              },
              dest: {
                x: window.left,
                y: window.top,
                width: window.width,
                height: window.height,
              },
            });

            resolve();
          };

          // Apply selected filter (and adjustments) before drawing
          (async () => {
            try {
              let processedUrl = photo.dataUrl;
              const filterId = photo.metadata?.filterId;
              const adjustments = photo.metadata?.adjustments as
                | ImageAdjustments
                | undefined;
              const engine = FilterEngine.getInstance();

              if (filterId && filterId !== "none") {
                const filter = enhancedFilters.find((f) => f.id === filterId);
                if (filter) {
                  console.log(`Applying filter to photo ${index}:`, filter.id);
                  processedUrl = await engine.applyFilter(processedUrl, filter);
                }
              }

              if (adjustments && Object.keys(adjustments).length > 0) {
                console.log(
                  `Applying adjustments to photo ${index}:`,
                  adjustments
                );
                processedUrl = await engine.applyImageAdjustments(
                  processedUrl,
                  adjustments
                );
              }

              img.src = processedUrl;
            } catch (e) {
              console.warn(
                "Failed to apply filter/adjustments, using original image",
                e
              );
              img.src = photo.dataUrl;
            }
          })();
        });
      });

      await Promise.all(photoPromises);

      // Draw the frame again on top as an overlay (in case the frame has top decorations)
      try {
        ctx.drawImage(
          frameImg,
          0,
          0,
          frameMapping.frameWidth,
          frameMapping.frameHeight
        );
      } catch (e) {
        console.warn("Failed to overlay frame on top:", e);
      }
    } catch (error) {
      console.error("Error generating photo strip:", error);
      // Fallback to simple generation if template fails
      const { width: stripWidth, height: stripHeight } = getCanvasDimensions();
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      // Simple fallback styling
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, stripWidth, stripHeight);
      ctx.strokeStyle = "#D8AE48";
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, stripWidth - 4, stripHeight - 4);
    }
  }, [template, photos, canvasRef, getCanvasDimensions]);

  const downloadGifStrip = useCallback(async () => {
    if (!hasGifData) return;

    setIsGeneratingGif(true);
    try {
      // Prefer frame-based GIF if any photo has sampled frames (iOS fallback)
      const allFrames: string[] = [];
      photos.forEach((photo) => {
        if (photo.gifFrames && photo.gifFrames.length > 0) {
          allFrames.push(...photo.gifFrames);
        }
      });

      const targetWidth = 400;
      const targetHeight =
        layout && typeof layout.shots === 'number'
          ? layout.shots === 1
            ? 600
            : layout.shots * 150 + 100
          : 600;

      if (allFrames.length > 0) {
        gifshot.createGIF(
          {
            images: allFrames,
            gifWidth: targetWidth,
            gifHeight: targetHeight,
            interval: 0.12, // ~8 fps
            numFrames: allFrames.length,
          },
          (obj) => {
            if (!obj.error) {
              setGeneratedGifUrl(obj.image);
              const link = document.createElement('a');
              link.href = obj.image;
              link.download = `boothiecall-gif-${layout?.id || 'unknown'}-${Date.now()}.gif`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {
              console.error('Error creating GIF from frames:', obj.error);
            }
            setIsGeneratingGif(false);
          }
        );
        return;
      }

      // Fallback to video blobs path
      const gifDataUrls: string[] = [];
      for (const photo of photos) {
        if (photo.gifData) {
          const url = URL.createObjectURL(photo.gifData);
          gifDataUrls.push(url);
        }
      }

      if (gifDataUrls.length === 0) {
        console.error('No GIF data found');
        setIsGeneratingGif(false);
        return;
      }

      gifshot.createGIF(
        {
          videos: gifDataUrls,
          gifWidth: targetWidth,
          gifHeight: targetHeight,
          interval: 0.2,
          numFrames: gifDataUrls.length,
        },
        (obj) => {
          if (!obj.error) {
            setGeneratedGifUrl(obj.image);
            const link = document.createElement('a');
            link.href = obj.image;
            link.download = `boothiecall-gif-${layout?.id || 'unknown'}-${Date.now()}.gif`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            console.error('Error creating GIF from videos:', obj.error);
          }
          gifDataUrls.forEach((url) => URL.revokeObjectURL(url));
          setIsGeneratingGif(false);
        }
      );
    } catch (error) {
      console.error('Error generating GIF strip:', error);
      setIsGeneratingGif(false);
    }
  }, [hasGifData, layout, photos, setGeneratedGifUrl, setIsGeneratingGif]);

  const downloadPhotoStrip = useCallback(async () => {
    setIsDownloading(true);
    try {
      await generatePhotoStrip();

      if (canvasRef.current) {
        const link = document.createElement("a");
        link.download = `boothiecall-${
          layout?.id || "unknown"
        }-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL("image/png", 0.9);
        link.click();
      }
    } catch (error) {
      console.error("Error generating photo strip:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [generatePhotoStrip, canvasRef, layout, setIsDownloading]);

  // Generate photo strip once per sessionKey and save session
  useEffect(() => {
    console.log("FinalResult useEffect running with dependencies:", {
      photosLength: photos?.length,
      templateId: template?.id,
      hasGeneratePhotoStrip: !!generatePhotoStrip,
      hasOnSessionComplete: !!onSessionCompleteRef.current,
      sessionKey,
    });

    // Prevent re-initialization if we've already run for this sessionKey
    if (initializedSessionKeyRef.current === sessionKey) {
      return;
    }

    const initializeSession = async () => {
      try {
        console.log("FinalResult initializeSession running");
        await generatePhotoStrip();

        if (canvasRef.current) {
          const dataUrl = canvasRef.current.toDataURL("image/png", 0.9);
          setFinalImageUrl(dataUrl);
          // Notify if callback provided (but always set preview image)
          onSessionCompleteRef.current?.(
            dataUrl,
            generatedGifUrlRef.current || undefined
          );
          initializedSessionKeyRef.current = sessionKey;
        }
      } catch (error) {
        console.error("Error initializing session:", error);
      }
    };

    initializeSession();
    // Removed generatedGifUrl from dependencies to prevent infinite loop
    // Using a ref to access the current value without creating a dependency
  }, [sessionKey, generatePhotoStrip, photos?.length, template?.id]);

  return (
    <div className="container-elegancia py-8 min-h-screen h-svh safe-area-padding card-fixes overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-glow mb-2">
          Your Photo Strip
        </h1>
        <p className="text-lg text-muted-foreground font-montserrat">
          Your {template.name} design is ready for download
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Preview */}
        <div className="space-y-6">
          <h3 className="font-cinzel font-semibold text-xl text-center">
            Preview
          </h3>

          <div className="card-elegancia p-6 flex justify-center">
            <div className="bg-gradient-card border border-gold-400/30 rounded-lg p-4 max-w-sm">
              {/* Photo Strip Preview */}

              <div className="flex items-center justify-center">
                {finalImageUrl ? (
                  <img
                    src={finalImageUrl}
                    alt="Final photo strip preview"
                    className="w-full max-w-[400px] h-auto rounded-lg shadow-lg"
                  />
                ) : (
                  <img
                    src={canvasRef.current?.toDataURL("image/png", 0.9) || ""}
                    alt="Generating preview..."
                    className="w-full max-w-[400px] h-auto rounded-lg opacity-90"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Template Info & Actions */}
        <div className="space-y-6">
          <h3 className="font-cinzel font-semibold text-xl text-center">
            Selected Design
          </h3>

          {/* Template Info */}
          <div className="card-elegancia p-6">
            <h4 className="font-cinzel font-bold text-lg text-primary mb-2">
              {template.name}
            </h4>
            <p className="text-sm text-muted-foreground font-montserrat mb-4">
              {template.description}
            </p>

            <div className="space-y-2 text-xs font-montserrat">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Layout:</span>
                <span className="text-foreground">
                  {layout?.name || "Default"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Photos:</span>
                <span className="text-foreground">{layout?.shots || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Template ID:</span>
                <span className="text-foreground">{template.id}</span>
              </div>
            </div>
          </div>

          {/* Download Options */}
          <div className="card-elegancia p-6 space-y-4">
            <h4 className="font-cinzel font-semibold text-lg text-center">
              Download Options
            </h4>

            <div className="space-y-3">
              <Button
                onClick={downloadPhotoStrip}
                disabled={isDownloading}
                className="btn-elegancia w-full animate-pulse-glow"
              >
                <Download className="w-5 h-5 mr-2" />
                {isDownloading ? "Generating..." : "Download Photo Strip (PNG)"}
              </Button>

              {hasGifData && (
                <Button
                  onClick={downloadGifStrip}
                  disabled={isGeneratingGif}
                  variant="outline"
                  className="w-full border-primary/50 text-primary hover:bg-primary/10"
                >
                  <Video className="w-5 h-5 mr-2" />
                  {isGeneratingGif
                    ? "Creating GIF..."
                    : "Download Animated GIF"}
                </Button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setIsShareModalOpen(true)}
                  variant="outline"
                  className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>

                <Button
                  onClick={() => setIsPrintModalOpen(true)}
                  variant="outline"
                  className="border-purple-400/30 text-purple-300 hover:bg-purple-400/10"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </div>

          {/* Photo Stats */}
          <div className="card-elegancia p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <Camera className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-montserrat font-medium">
                  {photos.length} Photos
                </p>
                <p className="text-xs text-muted-foreground">
                  {layout?.name || "Default"}
                </p>
              </div>
              <div>
                {hasGifData ? (
                  <Video className="w-6 h-6 mx-auto mb-2 text-primary" />
                ) : (
                  <Download className="w-6 h-6 mx-auto mb-2 text-primary" />
                )}
                <p className="text-sm font-montserrat font-medium">
                  {hasGifData ? "PNG + GIF" : "High Quality"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasGifData ? "Dual Format" : "PNG Format"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
        >
          Back to Filters
        </Button>

        <div className="flex gap-4">
          <Button
            onClick={onStartOver}
            variant="outline"
            className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Start Over
          </Button>

          <Button onClick={onStartOver} className="btn-elegancia">
            <Home className="w-5 h-5 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Hidden canvas for photo strip generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        imageDataUrl={
          finalImageUrl || canvasRef.current?.toDataURL("image/png", 0.9) || ""
        }
        title={`${template.name} Photo Strip`}
        description={`Check out my ${
          layout?.name || "photo"
        } photo strip created with BoothieCall!`}
      />

      {/* Print Preview Modal */}
      <PrintPreview
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        imageUrl={
          finalImageUrl || canvasRef.current?.toDataURL("image/png", 0.9) || ""
        }
        title={`${template.name} Photo Strip`}
      />
    </div>
  );
};

export default FinalResult;
