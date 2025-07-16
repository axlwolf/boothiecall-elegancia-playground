import React, { useState, useRef, useCallback } from 'react';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Crop, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageAdjustments, defaultAdjustments } from '@/lib/imageProcessing';
import { FilterEngine } from '@/lib/filterEngine';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string, adjustments: ImageAdjustments) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(defaultAdjustments);
  const [rotation, setRotation] = useState(0);
  const [isFlippedH, setIsFlippedH] = useState(false);
  const [isFlippedV, setIsFlippedV] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(imageUrl);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterEngine = FilterEngine.getInstance();

  // Update preview when adjustments change
  const updatePreview = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const processedUrl = await filterEngine.applyImageAdjustments(imageUrl, adjustments);
      setPreviewUrl(processedUrl);
    } catch (error) {
      console.error('Preview update failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [imageUrl, adjustments, filterEngine, isProcessing]);

  // Debounced preview update
  React.useEffect(() => {
    const timer = setTimeout(updatePreview, 300);
    return () => clearTimeout(timer);
  }, [updatePreview]);

  const handleAdjustmentChange = (key: keyof ImageAdjustments, value: number[]) => {
    setAdjustments(prev => ({
      ...prev,
      [key]: value[0]
    }));
  };

  const handleRotate = (degrees: number) => {
    setRotation(prev => (prev + degrees) % 360);
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (direction === 'horizontal') {
      setIsFlippedH(prev => !prev);
    } else {
      setIsFlippedV(prev => !prev);
    }
  };

  const handleReset = () => {
    setAdjustments(defaultAdjustments);
    setRotation(0);
    setIsFlippedH(false);
    setIsFlippedV(false);
    setPreviewUrl(imageUrl);
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      // Apply all transformations
      let finalUrl = await filterEngine.applyImageAdjustments(imageUrl, adjustments);
      
      // Apply rotation and flips if needed
      if (rotation !== 0 || isFlippedH || isFlippedV) {
        finalUrl = await applyTransformations(finalUrl);
      }
      
      onSave(finalUrl, adjustments);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyTransformations = async (inputUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate final dimensions considering rotation
        const isRotated90 = Math.abs(rotation % 180) === 90;
        canvas.width = isRotated90 ? img.height : img.width;
        canvas.height = isRotated90 ? img.width : img.height;
        
        // Apply transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(isFlippedH ? -1 : 1, isFlippedV ? -1 : 1);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();
        
        resolve(canvas.toDataURL('image/png', 0.9));
      };
      img.src = inputUrl;
    });
  };

  const adjustmentSliders = [
    { key: 'brightness' as keyof ImageAdjustments, label: 'Brightness', min: -100, max: 100, step: 1 },
    { key: 'contrast' as keyof ImageAdjustments, label: 'Contrast', min: -100, max: 100, step: 1 },
    { key: 'saturation' as keyof ImageAdjustments, label: 'Saturation', min: -100, max: 100, step: 1 },
    { key: 'hue' as keyof ImageAdjustments, label: 'Hue', min: -180, max: 180, step: 1 },
    { key: 'exposure' as keyof ImageAdjustments, label: 'Exposure', min: -2, max: 2, step: 0.1 },
    { key: 'highlights' as keyof ImageAdjustments, label: 'Highlights', min: -100, max: 100, step: 1 },
    { key: 'shadows' as keyof ImageAdjustments, label: 'Shadows', min: -100, max: 100, step: 1 }
  ];

  return (
    <div className="container-elegancia py-8 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-glow mb-2">
          Photo Editor
        </h1>
        <p className="text-lg text-muted-foreground font-montserrat">
          Fine-tune your photo with professional editing tools
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Preview */}
        <div className="lg:col-span-2">
          <Card className="card-elegancia">
            <CardHeader>
              <CardTitle className="font-cinzel">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-card rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-10">
                    <div className="text-white font-montserrat">Processing...</div>
                  </div>
                )}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[500px] object-contain rounded-lg"
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${isFlippedH ? -1 : 1}) scaleY(${isFlippedV ? -1 : 1})`,
                    transition: 'transform 0.3s ease'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <Tabs defaultValue="adjustments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="adjustments">
                <Sliders className="w-4 h-4 mr-2" />
                Adjust
              </TabsTrigger>
              <TabsTrigger value="transform">
                <RotateCw className="w-4 h-4 mr-2" />
                Transform
              </TabsTrigger>
            </TabsList>

            <TabsContent value="adjustments" className="space-y-4">
              <Card className="card-elegancia">
                <CardHeader>
                  <CardTitle className="font-cinzel text-sm">Manual Adjustments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {adjustmentSliders.map(({ key, label, min, max, step }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-montserrat font-medium">
                          {label}
                        </label>
                        <span className="text-xs text-muted-foreground font-mono">
                          {adjustments[key]}
                        </span>
                      </div>
                      <Slider
                        value={[adjustments[key]]}
                        onValueChange={(value) => handleAdjustmentChange(key, value)}
                        min={min}
                        max={max}
                        step={step}
                        className="w-full"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transform" className="space-y-4">
              <Card className="card-elegancia">
                <CardHeader>
                  <CardTitle className="font-cinzel text-sm">Transform</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rotation */}
                  <div className="space-y-2">
                    <label className="text-sm font-montserrat font-medium">Rotation</label>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRotate(-90)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        90° CCW
                      </Button>
                      <Button
                        onClick={() => handleRotate(90)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <RotateCw className="w-4 h-4 mr-1" />
                        90° CW
                      </Button>
                    </div>
                  </div>

                  {/* Flip */}
                  <div className="space-y-2">
                    <label className="text-sm font-montserrat font-medium">Flip</label>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleFlip('horizontal')}
                        variant={isFlippedH ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        <FlipHorizontal className="w-4 h-4 mr-1" />
                        Horizontal
                      </Button>
                      <Button
                        onClick={() => handleFlip('vertical')}
                        variant={isFlippedV ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        <FlipVertical className="w-4 h-4 mr-1" />
                        Vertical
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <Card className="card-elegancia">
            <CardContent className="pt-6 space-y-3">
              <Button
                onClick={handleSave}
                disabled={isProcessing}
                className="btn-elegancia w-full"
              >
                {isProcessing ? 'Processing...' : 'Apply Changes'}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
                >
                  Reset
                </Button>
                
                <Button
                  onClick={onCancel}
                  variant="outline"
                  size="sm"
                  className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageEditor;