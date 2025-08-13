import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const CameraTest = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        console.log('Testing camera access...');
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });
        
        console.log('Camera stream obtained successfully:', mediaStream);
        setStream(mediaStream);
        setIsLoading(false);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = async () => {
            if (videoRef.current) {
              await videoRef.current.play();
              console.log('Video playing successfully');
            }
          };
        }
      } catch (err) {
        console.error('Camera error:', err);
        setIsLoading(false);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unknown camera error');
        }
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const restartCamera = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
        <h1 className="text-white text-2xl font-bold mb-4">Camera Test</h1>
        
        {isLoading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-white">Loading camera...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <Button onClick={restartCamera} className="bg-blue-600 text-white">
              Retry
            </Button>
          </div>
        )}
        
        {!isLoading && !error && (
          <div>
            <div className="aspect-video bg-black rounded mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={stopCamera} className="bg-red-600 text-white">
                Stop Camera
              </Button>
              <Button onClick={restartCamera} className="bg-blue-600 text-white">
                Restart Camera
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraTest;
