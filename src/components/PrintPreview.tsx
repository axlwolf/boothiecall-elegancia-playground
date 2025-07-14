import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Download, 
  Settings, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  X,
  RotateCw,
  Maximize,
  FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PrintOptimizationService, 
  PrintSettings, 
  PrintFormat, 
  PRINT_FORMATS, 
  DEFAULT_PRINT_SETTINGS 
} from '@/lib/printOptimization';

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Photo Strip'
}) => {
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
  }>({ isValid: true, warnings: [], errors: [] });
  
  const printService = PrintOptimizationService.getInstance();
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Update preview when settings change
  useEffect(() => {
    if (isOpen && imageUrl) {
      generatePreview();
      validateSettings();
    }
  }, [settings, isOpen, imageUrl]);

  const generatePreview = async () => {
    setIsGenerating(true);
    try {
      const optimizedImage = await printService.generatePrintImage(imageUrl, settings);
      setPreviewUrl(optimizedImage);
    } catch (error) {
      console.error('Error generating print preview:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const validateSettings = () => {
    const result = printService.validatePrintSettings(settings);
    setValidation(result);
  };

  const handleFormatChange = (formatId: string) => {
    const format = PRINT_FORMATS.find(f => f.id === formatId);
    if (format) {
      setSettings(prev => ({ ...prev, format }));
    }
  };

  const handleDownloadPrint = async () => {
    if (!previewUrl) return;
    
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-print-${settings.format.id}.png`;
    link.href = previewUrl;
    link.click();
  };

  const handlePrint = () => {
    if (!previewUrl) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print - ${title}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
                background: white;
              }
              img { 
                max-width: 100%; 
                max-height: 100vh; 
                object-fit: contain;
                border: 1px solid #ccc;
              }
              @media print {
                body { padding: 0; }
                img { 
                  width: 100%; 
                  height: 100%; 
                  border: none;
                }
              }
            </style>
          </head>
          <body>
            <img src="${previewUrl}" alt="${title}" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const getFormatsByCategory = (category: PrintFormat['category']) => {
    return PRINT_FORMATS.filter(f => f.category === category);
  };

  const formatFileSize = printService.getEstimatedFileSize(settings);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900 border-gray-700 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-gold-300 flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Print Preview & Settings
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="format" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="format">
                  <Settings className="w-4 h-4 mr-2" />
                  Format
                </TabsTrigger>
                <TabsTrigger value="quality">
                  <FileImage className="w-4 h-4 mr-2" />
                  Quality
                </TabsTrigger>
              </TabsList>

              <TabsContent value="format" className="space-y-4">
                {/* Print Format Selection */}
                <Card className="card-elegancia">
                  <CardHeader>
                    <CardTitle className="text-sm font-montserrat">Print Format</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Popular Formats */}
                    <div>
                      <Label className="text-xs font-montserrat text-muted-foreground">Popular</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {getFormatsByCategory('photo').filter(f => f.isPopular).map(format => (
                          <Button
                            key={format.id}
                            onClick={() => handleFormatChange(format.id)}
                            variant={settings.format.id === format.id ? "default" : "outline"}
                            className="justify-start text-left h-auto p-3"
                          >
                            <div>
                              <div className="font-medium text-sm">{format.name}</div>
                              <div className="text-xs text-muted-foreground">{format.description}</div>
                              <div className="text-xs text-muted-foreground">{format.aspectRatio}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* All Formats */}
                    <div>
                      <Label className="text-xs font-montserrat text-muted-foreground">All Formats</Label>
                      <Select value={settings.format.id} onValueChange={handleFormatChange}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(
                            PRINT_FORMATS.reduce((acc, format) => {
                              if (!acc[format.category]) acc[format.category] = [];
                              acc[format.category].push(format);
                              return acc;
                            }, {} as Record<string, PrintFormat[]>)
                          ).map(([category, formats]) => (
                            <div key={category}>
                              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                                {category.replace('-', ' ')}
                              </div>
                              {formats.map(format => (
                                <SelectItem key={format.id} value={format.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{format.name}</span>
                                    {format.isPopular && (
                                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Format Details */}
                    <div className="text-xs space-y-1 bg-gray-800/50 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span>{settings.format.width}mm × {settings.format.height}mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DPI:</span>
                        <span>{settings.format.dpi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aspect Ratio:</span>
                        <span>{settings.format.aspectRatio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. File Size:</span>
                        <span>{formatFileSize}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Layout Settings */}
                <Card className="card-elegancia">
                  <CardHeader>
                    <CardTitle className="text-sm font-montserrat">Layout Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Orientation */}
                    <div>
                      <Label className="text-xs font-montserrat">Orientation</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => setSettings(prev => ({ ...prev, orientation: 'portrait' }))}
                          variant={settings.orientation === 'portrait' ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                        >
                          Portrait
                        </Button>
                        <Button
                          onClick={() => setSettings(prev => ({ ...prev, orientation: 'landscape' }))}
                          variant={settings.orientation === 'landscape' ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                        >
                          <RotateCw className="w-3 h-3 mr-1" />
                          Landscape
                        </Button>
                      </div>
                    </div>

                    {/* Margin */}
                    <div>
                      <Label className="text-xs font-montserrat">
                        Margin: {settings.margin}mm
                      </Label>
                      <Slider
                        value={[settings.margin]}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, margin: value[0] }))}
                        min={0}
                        max={20}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>

                    {/* Bleed */}
                    <div>
                      <Label className="text-xs font-montserrat">
                        Bleed: {settings.bleed}mm
                      </Label>
                      <Slider
                        value={[settings.bleed]}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, bleed: value[0] }))}
                        min={0}
                        max={10}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                {/* Quality Settings */}
                <Card className="card-elegancia">
                  <CardHeader>
                    <CardTitle className="text-sm font-montserrat">Quality Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Print Quality */}
                    <div>
                      <Label className="text-xs font-montserrat">Print Quality</Label>
                      <Select
                        value={settings.quality}
                        onValueChange={(value) => setSettings(prev => ({ 
                          ...prev, 
                          quality: value as PrintSettings['quality'] 
                        }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft (Fast, Lower Quality)</SelectItem>
                          <SelectItem value="normal">Normal (Balanced)</SelectItem>
                          <SelectItem value="high">High (Slower, Better Quality)</SelectItem>
                          <SelectItem value="print-ready">Print Ready (Best Quality)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color Profile */}
                    <div>
                      <Label className="text-xs font-montserrat">Color Profile</Label>
                      <Select
                        value={settings.colorProfile}
                        onValueChange={(value) => setSettings(prev => ({ 
                          ...prev, 
                          colorProfile: value as PrintSettings['colorProfile'] 
                        }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sRGB">sRGB (Standard)</SelectItem>
                          <SelectItem value="Adobe RGB">Adobe RGB (Wide Gamut)</SelectItem>
                          <SelectItem value="CMYK">CMYK (Professional Print)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhancement Options */}
                <Card className="card-elegancia">
                  <CardHeader>
                    <CardTitle className="text-sm font-montserrat">Enhancement Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Border */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-montserrat">Include Border</Label>
                      <Switch
                        checked={settings.includeBorder}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeBorder: checked }))}
                      />
                    </div>

                    {settings.includeBorder && (
                      <div>
                        <Label className="text-xs font-montserrat">
                          Border Width: {settings.borderWidth}mm
                        </Label>
                        <Slider
                          value={[settings.borderWidth]}
                          onValueChange={(value) => setSettings(prev => ({ ...prev, borderWidth: value[0] }))}
                          min={0.1}
                          max={5}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>
                    )}

                    {/* Watermark */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-montserrat">Include Watermark</Label>
                      <Switch
                        checked={settings.includeWatermark}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeWatermark: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Validation Messages */}
            {(validation.errors.length > 0 || validation.warnings.length > 0) && (
              <Card className="card-elegancia">
                <CardContent className="pt-6">
                  {validation.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2 text-red-400 text-xs mb-2">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{error}</span>
                    </div>
                  ))}
                  {validation.warnings.map((warning, index) => (
                    <div key={index} className="flex items-center gap-2 text-yellow-400 text-xs mb-2">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{warning}</span>
                    </div>
                  ))}
                  {validation.isValid && validation.warnings.length === 0 && (
                    <div className="flex items-center gap-2 text-green-400 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      <span>Settings are optimized for print</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card className="card-elegancia">
              <CardHeader>
                <CardTitle className="text-sm font-montserrat flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Print Preview
                  {isGenerating && (
                    <Badge variant="secondary" className="text-xs">
                      Generating...
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-800/50 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                  {previewUrl ? (
                    <div className="max-w-full max-h-[500px] overflow-auto">
                      <img
                        src={previewUrl}
                        alt="Print preview"
                        className="max-w-full h-auto border border-gray-600 rounded shadow-lg"
                        style={{
                          imageRendering: 'crisp-edges'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Printer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-montserrat">
                        {isGenerating ? 'Generating preview...' : 'Preview will appear here'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={handleDownloadPrint}
                    disabled={!previewUrl || !validation.isValid}
                    className="btn-elegancia flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Print File
                  </Button>
                  
                  <Button
                    onClick={handlePrint}
                    disabled={!previewUrl || !validation.isValid}
                    variant="outline"
                    className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreview;