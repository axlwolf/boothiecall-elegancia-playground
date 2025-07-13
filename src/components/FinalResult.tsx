import { useState, useRef } from 'react';
import { Download, RotateCcw, Share2, Camera, Home, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
// @ts-ignore
import gifshot from 'gifshot';

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  gifData?: Blob;
}

interface Layout {
  id: string;
  name: string;
  shots: number;
}

interface FinalResultProps {
  layout: Layout;
  photos: CapturedPhoto[];
  onStartOver: () => void;
  onBack: () => void;
}

const FinalResult = ({ layout, photos, onStartOver, onBack }: FinalResultProps) => {
  const [selectedDesign, setSelectedDesign] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if any photos have GIF data
  const hasGifData = photos.some(photo => photo.gifData);

  // Mock design templates - in a real app, these would be actual design files
  const designTemplates = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `Design ${i + 1}`,
    preview: `Template ${i + 1}`
  }));

  const generatePhotoStrip = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on layout
    const stripWidth = 400;
    const stripHeight = layout.shots === 1 ? 600 : layout.shots * 150 + 100;
    
    canvas.width = stripWidth;
    canvas.height = stripHeight;

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, stripWidth, stripHeight);

    // Gold border
    ctx.strokeStyle = '#D8AE48';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, stripWidth - 4, stripHeight - 4);

    // Title
    ctx.fillStyle = '#D8AE48';
    ctx.font = 'bold 24px Cinzel';
    ctx.textAlign = 'center';
    ctx.fillText('BoothieCall', stripWidth / 2, 40);

    // Load and draw photos
    const photoPromises = photos.map((photo, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const photoSize = layout.shots === 1 ? 350 : 120;
          const photoX = (stripWidth - photoSize) / 2;
          const photoY = layout.shots === 1 ? 100 : 80 + index * 130;

          // Draw photo with rounded corners
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(photoX, photoY, photoSize, photoSize, 8);
          ctx.clip();
          ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
          ctx.restore();

          // Photo border
          ctx.strokeStyle = '#D8AE48';
          ctx.lineWidth = 2;
          ctx.strokeRect(photoX, photoY, photoSize, photoSize);

          resolve();
        };
        img.src = photo.dataUrl;
      });
    });

    await Promise.all(photoPromises);

    // Footer
    ctx.fillStyle = '#D8AE48';
    ctx.font = '14px Montserrat';
    ctx.textAlign = 'center';
    ctx.fillText('Elegancia Nocturna', stripWidth / 2, stripHeight - 20);
  };

  const downloadGifStrip = async () => {
    if (!hasGifData) return;
    
    setIsGeneratingGif(true);
    try {
      // Convert video blobs to data URLs for gifshot
      const gifDataUrls: string[] = [];
      
      for (const photo of photos) {
        if (photo.gifData) {
          const url = URL.createObjectURL(photo.gifData);
          gifDataUrls.push(url);
        }
      }
      
      if (gifDataUrls.length === 0) {
        console.error('No GIF data found');
        return;
      }
      
      // Create GIF using gifshot
      gifshot.createGIF({
        videos: gifDataUrls,
        gifWidth: 400,
        gifHeight: layout.shots === 1 ? 600 : layout.shots * 150 + 100,
        interval: 0.2,
        numFrames: 10,
        frameDuration: 0.5,
        fontWeight: 'bold',
        fontSize: '24px',
        fontFamily: 'Cinzel',
        fontColor: '#D8AE48',
        textAlign: 'center',
        textBaseline: 'middle'
      }, (obj: any) => {
        if (!obj.error) {
          const link = document.createElement('a');
          link.download = `boothiecall-gif-${layout.id}-${Date.now()}.gif`;
          link.href = obj.image;
          link.click();
        } else {
          console.error('Error creating GIF:', obj.error);
        }
        
        // Clean up URLs
        gifDataUrls.forEach(url => URL.revokeObjectURL(url));
        setIsGeneratingGif(false);
      });
      
    } catch (error) {
      console.error('Error generating GIF strip:', error);
      setIsGeneratingGif(false);
    }
  };

  const downloadPhotoStrip = async () => {
    setIsDownloading(true);
    try {
      await generatePhotoStrip();
      
      if (canvasRef.current) {
        const link = document.createElement('a');
        link.download = `boothiecall-${layout.id}-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png', 0.9);
        link.click();
      }
    } catch (error) {
      console.error('Error generating photo strip:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container-elegancia py-8 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-glow mb-2">
          Your Photo Strip
        </h1>
        <p className="text-lg text-muted-foreground font-montserrat">
          Choose a design and download your masterpiece
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
              <div className="text-center mb-4">
                <h4 className="font-cinzel font-bold text-primary text-lg">BoothieCall</h4>
              </div>
              
              <div className={`space-y-2 ${layout.shots === 1 ? '' : 'space-y-4'}`}>
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className={`photo-frame ${
                      layout.shots === 1 ? 'aspect-[3/4]' : 'aspect-square'
                    }`}
                  >
                    <img
                      src={photo.dataUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <p className="text-xs text-gold-300 font-montserrat">Elegancia Nocturna</p>
              </div>
            </div>
          </div>
        </div>

        {/* Design Selection & Actions */}
        <div className="space-y-6">
          <h3 className="font-cinzel font-semibold text-xl text-center">
            Design Templates
          </h3>
          
          {/* Design Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {designTemplates.map(design => (
              <div
                key={design.id}
                className={`card-elegancia p-4 cursor-pointer transition-all duration-300 ${
                  selectedDesign === design.id ? 'border-primary shadow-glow scale-105' : ''
                }`}
                onClick={() => setSelectedDesign(design.id)}
              >
                <div className="aspect-[3/4] bg-gradient-card rounded-lg flex items-center justify-center mb-2">
                  <span className="text-muted-foreground text-sm font-montserrat">
                    {design.preview}
                  </span>
                </div>
                <p className="text-center text-sm font-montserrat font-medium">
                  {design.name}
                </p>
              </div>
            ))}
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
                {isDownloading ? 'Generating...' : 'Download Photo Strip (PNG)'}
              </Button>
              
              {hasGifData && (
                <Button
                  onClick={downloadGifStrip}
                  disabled={isGeneratingGif}
                  variant="outline"
                  className="w-full border-primary/50 text-primary hover:bg-primary/10"
                >
                  <Video className="w-5 h-5 mr-2" />
                  {isGeneratingGif ? 'Creating GIF...' : 'Download Animated GIF'}
                </Button>
              )}
              
              <Button
                variant="outline"
                className="w-full border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Photo Strip
              </Button>
            </div>
          </div>

          {/* Photo Stats */}
          <div className="card-elegancia p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <Camera className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-montserrat font-medium">{photos.length} Photos</p>
                <p className="text-xs text-muted-foreground">{layout.name}</p>
              </div>
              <div>
                {hasGifData ? (
                  <Video className="w-6 h-6 mx-auto mb-2 text-primary" />
                ) : (
                  <Download className="w-6 h-6 mx-auto mb-2 text-primary" />
                )}
                <p className="text-sm font-montserrat font-medium">
                  {hasGifData ? 'PNG + GIF' : 'High Quality'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasGifData ? 'Dual Format' : 'PNG Format'}
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
          
          <Button
            onClick={onStartOver}
            className="btn-elegancia"
          >
            <Home className="w-5 h-5 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Hidden canvas for photo strip generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FinalResult;