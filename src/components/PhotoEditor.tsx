import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Save, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Crop, Sliders, Palette, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CapturedPhoto } from '@/types/layout';
import { ImageAdjustments, defaultAdjustments } from '@/lib/imageProcessing';
import { FilterEngine } from '@/lib/filterEngine';
import { enhancedFilters, FilterCategory, EnhancedFilter } from '@/types/filters';

interface PhotoEditorProps {
  photo: CapturedPhoto;
  onSave: (editedPhoto: CapturedPhoto) => void;
  onCancel: () => void;
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({ photo, onSave, onCancel }) => {
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(defaultAdjustments);
  const [rotation, setRotation] = useState(0);
  const [isFlippedH, setIsFlippedH] = useState(false);
  const [isFlippedV, setIsFlippedV] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(photo.dataUrl);
  const [beforeAfterMode, setBeforeAfterMode] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<FilterCategory>('basic');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterEngine = FilterEngine.getInstance();

  // Group filters by category
  const filtersByCategory = enhancedFilters.reduce((acc, filter) => {
    if (!acc[filter.category]) {
      acc[filter.category] = [];
    }
    acc[filter.category].push(filter);
    return acc;
  }, {} as Record<FilterCategory, EnhancedFilter[]>);

  // Update preview when any parameter changes
  const updatePreview = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      let processedUrl = photo.dataUrl;
      
      // Apply adjustments first
      if (Object.values(adjustments).some(val => val !== 0)) {
        processedUrl = await filterEngine.applyImageAdjustments(processedUrl, adjustments);
      }
      
      // Apply filter
      const filter = enhancedFilters.find(f => f.id === selectedFilter);
      if (filter && filter.id !== 'none') {
        processedUrl = await filterEngine.applyFilter(processedUrl, filter);
      }
      
      // Apply transformations
      if (rotation !== 0 || isFlippedH || isFlippedV) {
        processedUrl = await applyTransformations(processedUrl);
      }
      
      setPreviewUrl(processedUrl);
    } catch (error) {
      console.error('Preview update failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [photo.dataUrl, adjustments, selectedFilter, rotation, isFlippedH, isFlippedV, filterEngine, isProcessing]);

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

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
  };

  const handleReset = () => {
    setAdjustments(defaultAdjustments);
    setRotation(0);
    setIsFlippedH(false);
    setIsFlippedV(false);
    setSelectedFilter('none');
    setPreviewUrl(photo.dataUrl);
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const editedPhoto: CapturedPhoto = {
        ...photo,
        dataUrl: previewUrl,
        metadata: {
          ...photo.metadata,
          adjustments,
          rotation,
          isFlippedH,
          isFlippedV,
          filterId: selectedFilter,
          editedAt: new Date().toISOString()
        }
      };
      
      onSave(editedPhoto);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyTransformations = useCallback(async (inputUrl: string): Promise<string> => {
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
  }, [rotation, isFlippedH, isFlippedV]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `edited-photo-${Date.now()}.png`;
    link.href = previewUrl;
    link.click();
  };

  const getFilterStyle = (filter: EnhancedFilter) => {
    return filter.cssFilter ? { filter: filter.cssFilter } : {};
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

  const currentFilters = filtersByCategory[selectedFilterCategory] || [];

  return (
    <div className="container-elegancia py-8 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-glow mb-2">
          Advanced Photo Editor
        </h1>
        <p className="text-lg text-muted-foreground font-montserrat">
          Professional editing tools for perfect results
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Preview */}
        <div className="lg:col-span-2">
          <Card className="card-elegancia">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-cinzel">Preview</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setBeforeAfterMode(!beforeAfterMode)}
                    variant="outline"
                    size="sm"
                    className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {beforeAfterMode ? 'Hide Original' : 'Compare'}
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-card rounded-lg p-4 min-h-[500px] flex items-center justify-center">
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-10">
                    <div className="text-white font-montserrat">Processing...</div>
                  </div>
                )}
                
                {beforeAfterMode ? (
                  <div className="w-full max-w-2xl relative">
                    {/* Before/After split view */}
                    <div className="relative overflow-hidden rounded-lg">
                      <div className="flex">
                        <div className="w-1/2 overflow-hidden">
                          <img
                            src={photo.dataUrl}
                            alt="Original"
                            className="w-full h-auto object-contain"
                          />
                        </div>
                        <div className="w-1/2 overflow-hidden">
                          <img
                            src={previewUrl}
                            alt="Edited"
                            className="w-full h-auto object-contain"
                            style={{ transform: 'translateX(-100%)' }}
                          />
                        </div>
                      </div>
                      {/* Divider line */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gold-400 z-10" />
                      {/* Labels */}
                      <div className="absolute top-4 left-4 text-sm bg-black/70 text-white px-3 py-1 rounded">
                        Original
                      </div>
                      <div className="absolute top-4 right-4 text-sm bg-black/70 text-white px-3 py-1 rounded">
                        Edited
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-[600px] object-contain rounded-lg"
                    style={{
                      transform: `rotate(${rotation}deg) scaleX(${isFlippedH ? -1 : 1}) scaleY(${isFlippedV ? -1 : 1})`,
                      transition: 'transform 0.3s ease'
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <Tabs defaultValue="adjustments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="adjustments">
                <Sliders className="w-4 h-4 mr-1" />
                Adjust
              </TabsTrigger>
              <TabsTrigger value="filters">
                <Palette className="w-4 h-4 mr-1" />
                Filters
              </TabsTrigger>
              <TabsTrigger value="transform">
                <RotateCw className="w-4 h-4 mr-1" />
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

            <TabsContent value="filters" className="space-y-4">
              <Card className="card-elegancia">
                <CardHeader>
                  <CardTitle className="font-cinzel text-sm">Filter Effects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filter Category Selection */}
                  <Select value={selectedFilterCategory} onValueChange={(value) => setSelectedFilterCategory(value as FilterCategory)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select filter category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(filtersByCategory) as FilterCategory[]).map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {filtersByCategory[category]?.length || 0}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Filter Grid */}
                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {/* None option */}
                    <div
                      onClick={() => handleFilterSelect('none')}
                      className={`cursor-pointer p-2 rounded-lg border transition-colors ${
                        selectedFilter === 'none'
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="aspect-square mb-2 bg-gray-700 rounded overflow-hidden">
                        <img
                          src={photo.dataUrl}
                          alt="Original"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-center font-montserrat">
                        Original
                      </p>
                    </div>

                    {/* Filter options */}
                    {currentFilters.map(filter => (
                      <div
                        key={filter.id}
                        onClick={() => handleFilterSelect(filter.id)}
                        className={`cursor-pointer p-2 rounded-lg border transition-colors ${
                          selectedFilter === filter.id
                            ? 'border-gold-500 bg-gold-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="aspect-square mb-2 bg-gray-700 rounded overflow-hidden">
                          <img
                            src={photo.dataUrl}
                            alt={filter.name}
                            className="w-full h-full object-cover"
                            style={getFilterStyle(filter)}
                          />
                        </div>
                        <p className="text-xs text-center font-montserrat">
                          {filter.name}
                        </p>
                      </div>
                    ))}
                  </div>
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
                <Save className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Save Changes'}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
                >
                  Reset All
                </Button>
                
                <Button
                  onClick={onCancel}
                  variant="outline"
                  size="sm"
                  className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
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

export default PhotoEditor;