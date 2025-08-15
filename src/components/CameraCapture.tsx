import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Download, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout, CapturedPhoto } from '@/types/layout';
import { isIOS } from '@/lib/debugFlags';

interface CameraCaptureProps {
  layout: Layout;
  onComplete: (photos: CapturedPhoto[]) => void;
  onBack: () => void;
}

const CameraCapture = ({ layout, onComplete, onBack }: CameraCaptureProps) => {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [currentShot, setCurrentShot] = useState(1);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecordingGif, setIsRecordingGif] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Initialize camera
  useEffect(() => {
    // Copy ref values to variables inside the effect
    const videoElement = videoRef.current;
    let localStream: MediaStream | null = null;
    
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });
        
        localStream = mediaStream;
        setStream(mediaStream);
        if (videoElement) {
          videoElement.srcObject = mediaStream;
          // Ensure video starts playing immediately
          videoElement.onloadedmetadata = () => {
            if (videoElement) {
              videoElement.play().catch(console.error);
            }
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera. Please check permissions.');
      }
    };

    initCamera();

    // Cleanup on unmount
    return () => {
      // Cleanup camera stream
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      // Also stop media recorder if active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      // Cleanup any remaining resources
      if (videoElement && videoElement.srcObject) {
        const tracks = (videoElement.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
      }
    };
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/png', 0.9);
    const newPhoto: CapturedPhoto = {
      id: `photo-${Date.now()}`,
      dataUrl,
      timestamp: Date.now()
    };

    const updatedPhotos = [...photos, newPhoto];
    setPhotos(updatedPhotos);

    if (updatedPhotos.length >= layout.shots) {
      // All photos captured
      // Cleanup camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setTimeout(() => onComplete(updatedPhotos), 500);
    } else {
      setCurrentShot(currentShot + 1);
    }
  }, [photos, currentShot, layout.shots, onComplete, stream]);

  // GIF recording functionality with iOS fallback
  const startGifRecording = useCallback((photoIndex?: number) => {
    if (!stream || !videoRef.current) return;

    const supportsWebm = (() => {
      try {
        // Some Safari versions throw when accessing isTypeSupported
        // or simply don't support webm/MediaRecorder
        // Prefer robust feature detection over UA where possible
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const MR: any = (window as unknown as { MediaRecorder?: unknown }).MediaRecorder || MediaRecorder;
        return typeof MR !== 'undefined' && typeof MediaRecorder !== 'undefined' &&
          typeof MediaRecorder.isTypeSupported === 'function' &&
          MediaRecorder.isTypeSupported('video/webm;codecs=vp8');
      } catch {
        return false;
      }
    })();

    // iOS or no webm support: sample frames from canvas for ~2s
    if (isIOS() || !supportsWebm) {
      if (!canvasRef.current) return;
      try {
        setIsRecordingGif(true);
        const frames: string[] = [];
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx || !video) return;

        const startTime = Date.now();
        const durationMs = 2000;
        const targetFps = 8; // keep it light for iOS
        const intervalMs = Math.floor(1000 / targetFps);

        const sample = () => {
          if (!video || !ctx || !canvas) return;
          canvas.width = video.videoWidth || canvas.width || 640;
          canvas.height = video.videoHeight || canvas.height || 480;
          ctx.drawImage(video, 0, 0);
          frames.push(canvas.toDataURL('image/png', 0.85));
        };

        // First frame immediately
        sample();
        const interval = window.setInterval(() => {
          if (Date.now() - startTime >= durationMs) {
            window.clearInterval(interval);
            // Attach frames to the specified photo (or last one)
            const idx = typeof photoIndex === 'number' ? photoIndex : Math.max(0, photos.length - 1);
            const updated = [...photos];
            if (updated[idx]) {
              updated[idx] = { ...updated[idx], gifFrames: frames };
              setPhotos(updated);
            }
            setIsRecordingGif(false);
          } else {
            sample();
          }
        }, intervalMs);
      } catch (error) {
        console.error('Error sampling frames for iOS GIF fallback:', error);
        setIsRecordingGif(false);
      }
      return;
    }

    // Default path: MediaRecorder with webm
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8'
      });

      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        // Store the GIF data with the selected or last photo
        const idx = typeof photoIndex === 'number' ? photoIndex : Math.max(0, photos.length - 1);
        const updatedPhotos = [...photos];
        if (updatedPhotos[idx]) {
          updatedPhotos[idx] = {
            ...updatedPhotos[idx],
            gifData: blob
          };
          setPhotos(updatedPhotos);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecordingGif(true);

      // Record for 2 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecordingGif(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Error starting GIF recording:', error);
    }
  }, [stream, photos]);

  const capturePhotoWithGif = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/png', 0.9);
    const newPhoto: CapturedPhoto = {
      id: `photo-${Date.now()}`,
      dataUrl,
      timestamp: Date.now()
    };

    const photoIndex = photos.length; // index of the photo we are about to push
    const updatedPhotos = [...photos, newPhoto];
    setPhotos(updatedPhotos);

    // Start GIF recording linked to this photo index
    startGifRecording(photoIndex);

    if (updatedPhotos.length >= layout.shots) {
      // All photos captured, wait a bit for GIF recording to complete
      setTimeout(() => onComplete(updatedPhotos), 2500);
    } else {
      setCurrentShot(currentShot + 1);
    }
  }, [photos, currentShot, layout.shots, onComplete, startGifRecording]);

  const startCountdown = useCallback((withGif = false) => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          // Show flash effect right before capture
          setTimeout(() => {
            if (withGif) {
              capturePhotoWithGif();
            } else {
              capturePhoto();
            }
            // Reset states after a brief delay
            setTimeout(() => {
              setCountdown(null);
              setIsCapturing(false);
            }, 200);
          }, 100);
          return 0; // Show flash when countdown hits 0
        }
        return prev - 1;
      });
    }, 1000);
  }, [isCapturing, capturePhoto, capturePhotoWithGif]);

  const retakePhotos = () => {
    setPhotos([]);
    setCurrentShot(1);
  };

  if (error) {
    return (
      <div className="container-elegancia py-8 min-h-screen h-svh safe-area-padding card-fixes flex items-center justify-center">
        <div className="card-elegancia p-8 text-center max-w-md">
          <Camera className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="font-cinzel font-semibold text-xl mb-4">Camera Error</h2>
          <p className="text-muted-foreground font-montserrat mb-6">{error}</p>
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-elegancia py-8 min-h-screen h-svh safe-area-padding card-fixes overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-glow mb-2">
          {layout.name} Session
        </h1>
        <p className="text-lg text-muted-foreground font-montserrat">
          Photo {currentShot} of {layout.shots}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Camera View */}
        <div className="lg:col-span-2">
          <div className="card-elegancia p-6 animate-scale-in">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden touch-pan-y">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ background: '#000' }}
                onLoadedMetadata={() => {
                  // Ensure video is playing smoothly
                  if (videoRef.current) {
                    videoRef.current.play().catch(console.error);
                  }
                }}
              />
              
              {/* Countdown Overlay */}
              {countdown && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-8xl font-cinzel font-bold text-primary animate-pulse-glow">
                    {countdown}
                  </div>
                </div>
              )}

              {/* Flash Effect */}
              {countdown === 0 && (
                <div className="absolute inset-0 bg-white opacity-90 animate-flash" />
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex justify-center gap-3 mt-6">
              <Button
                onClick={() => startCountdown(false)}
                disabled={isCapturing || photos.length >= layout.shots}
                className="btn-elegancia"
              >
                <Camera className="w-5 h-5 mr-2" />
                {isCapturing ? 'Capturing...' : 'Take Photo'}
              </Button>
              
              <Button
                onClick={() => startCountdown(true)}
                disabled={isCapturing || photos.length >= layout.shots}
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                <Video className="w-5 h-5 mr-2" />
                {isRecordingGif ? 'Recording...' : 'Photo + GIF'}
              </Button>
              
              {photos.length > 0 && (
                <Button
                  onClick={retakePhotos}
                  variant="outline"
                  className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Retake All
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="space-y-6">
          <h3 className="font-cinzel font-semibold text-xl text-center">
            Captured Photos
          </h3>
          
          <div className="space-y-4">
            {Array.from({ length: layout.shots }).map((_, index) => (
              <div key={index} className="photo-frame aspect-square">
                {photos[index] ? (
                  <img
                    src={photos[index].dataUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-card rounded-lg flex items-center justify-center border-2 border-dashed border-gold-400/30">
                    <span className="text-muted-foreground font-montserrat">
                      Photo {index + 1}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="text-center">
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(photos.length / layout.shots) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground font-montserrat">
              {photos.length} / {layout.shots} photos captured
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
        >
          Back to Layout
        </Button>
        
        {photos.length === layout.shots && (
          <Button
            onClick={() => onComplete(photos)}
            className="btn-elegancia animate-pulse-glow"
          >
            Continue to Filters
            <Download className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
