export interface PrintFormat {
  id: string;
  name: string;
  width: number; // in mm
  height: number; // in mm
  dpi: number;
  description: string;
  aspectRatio: string;
  category: 'standard' | 'photo' | 'custom';
  isPopular?: boolean;
}

export interface PrintSettings {
  format: PrintFormat;
  orientation: 'portrait' | 'landscape';
  margin: number; // in mm
  bleed: number; // in mm
  quality: 'draft' | 'normal' | 'high' | 'print-ready';
  colorProfile: 'sRGB' | 'Adobe RGB' | 'CMYK';
  includeWatermark: boolean;
  includeBorder: boolean;
  borderWidth: number; // in mm
}

export const PRINT_FORMATS: PrintFormat[] = [
  // Photo Booth Standard Formats
  {
    id: 'strip-2x6',
    name: '2" x 6" Strip',
    width: 50.8,
    height: 152.4,
    dpi: 300,
    description: 'Classic photo booth strip format',
    aspectRatio: '1:3',
    category: 'photo',
    isPopular: true
  },
  {
    id: 'strip-2x8',
    name: '2" x 8" Strip',
    width: 50.8,
    height: 203.2,
    dpi: 300,
    description: 'Extended photo booth strip',
    aspectRatio: '1:4',
    category: 'photo'
  },
  
  // Standard Photo Formats
  {
    id: 'photo-4x6',
    name: '4" x 6" Photo',
    width: 101.6,
    height: 152.4,
    dpi: 300,
    description: 'Standard photo print size',
    aspectRatio: '2:3',
    category: 'photo',
    isPopular: true
  },
  {
    id: 'photo-5x7',
    name: '5" x 7" Photo',
    width: 127,
    height: 177.8,
    dpi: 300,
    description: 'Medium photo print size',
    aspectRatio: '5:7',
    category: 'photo'
  },
  {
    id: 'photo-8x10',
    name: '8" x 10" Photo',
    width: 203.2,
    height: 254,
    dpi: 300,
    description: 'Large photo print size',
    aspectRatio: '4:5',
    category: 'photo'
  },
  
  // Standard Paper Formats
  {
    id: 'a4',
    name: 'A4',
    width: 210,
    height: 297,
    dpi: 300,
    description: 'Standard A4 paper size',
    aspectRatio: '√2:1',
    category: 'standard',
    isPopular: true
  },
  {
    id: 'letter',
    name: 'Letter (8.5" x 11")',
    width: 215.9,
    height: 279.4,
    dpi: 300,
    description: 'US Letter size',
    aspectRatio: '8.5:11',
    category: 'standard'
  },
  {
    id: 'a3',
    name: 'A3',
    width: 297,
    height: 420,
    dpi: 300,
    description: 'Large A3 paper size',
    aspectRatio: '√2:1',
    category: 'standard'
  },
  
  // Social Media Formats
  {
    id: 'instagram-square',
    name: 'Instagram Square',
    width: 88.9,
    height: 88.9,
    dpi: 300,
    description: 'Instagram square post format',
    aspectRatio: '1:1',
    category: 'custom'
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    width: 60,
    height: 106.7,
    dpi: 300,
    description: 'Instagram story format',
    aspectRatio: '9:16',
    category: 'custom'
  }
];

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  format: PRINT_FORMATS[0], // 2x6 strip
  orientation: 'portrait',
  margin: 5, // 5mm margin
  bleed: 2, // 2mm bleed
  quality: 'high',
  colorProfile: 'sRGB',
  includeWatermark: false,
  includeBorder: true,
  borderWidth: 1 // 1mm border
};

export class PrintOptimizationService {
  private static instance: PrintOptimizationService;

  static getInstance(): PrintOptimizationService {
    if (!PrintOptimizationService.instance) {
      PrintOptimizationService.instance = new PrintOptimizationService();
    }
    return PrintOptimizationService.instance;
  }

  /**
   * Convert mm to pixels at given DPI
   */
  mmToPixels(mm: number, dpi: number): number {
    return Math.round((mm * dpi) / 25.4);
  }

  /**
   * Convert pixels to mm at given DPI
   */
  pixelsToMm(pixels: number, dpi: number): number {
    return (pixels * 25.4) / dpi;
  }

  /**
   * Calculate optimal canvas dimensions for print
   */
  calculatePrintDimensions(settings: PrintSettings): {
    canvasWidth: number;
    canvasHeight: number;
    printableWidth: number;
    printableHeight: number;
    bleedWidth: number;
    bleedHeight: number;
  } {
    const format = settings.format;
    const dpi = format.dpi;
    
    // Add bleed to dimensions
    const totalWidth = format.width + (settings.bleed * 2);
    const totalHeight = format.height + (settings.bleed * 2);
    
    // Convert to pixels
    const canvasWidth = this.mmToPixels(totalWidth, dpi);
    const canvasHeight = this.mmToPixels(totalHeight, dpi);
    
    // Printable area (excluding margins)
    const printableWidth = this.mmToPixels(format.width - (settings.margin * 2), dpi);
    const printableHeight = this.mmToPixels(format.height - (settings.margin * 2), dpi);
    
    // Bleed area
    const bleedWidth = this.mmToPixels(settings.bleed, dpi);
    const bleedHeight = this.mmToPixels(settings.bleed, dpi);

    return {
      canvasWidth,
      canvasHeight,
      printableWidth,
      printableHeight,
      bleedWidth,
      bleedHeight
    };
  }

  /**
   * Generate print-optimized image
   */
  async generatePrintImage(
    sourceImageUrl: string,
    settings: PrintSettings
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          const dimensions = this.calculatePrintDimensions(settings);
          canvas.width = dimensions.canvasWidth;
          canvas.height = dimensions.canvasHeight;
          
          // Fill with white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw bleed area guides (if needed)
          if (settings.bleed > 0) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(
              dimensions.bleedWidth,
              dimensions.bleedHeight,
              canvas.width - (dimensions.bleedWidth * 2),
              canvas.height - (dimensions.bleedHeight * 2)
            );
            ctx.setLineDash([]);
          }
          
          // Calculate image position and size
          const imageX = dimensions.bleedWidth + this.mmToPixels(settings.margin, settings.format.dpi);
          const imageY = dimensions.bleedHeight + this.mmToPixels(settings.margin, settings.format.dpi);
          const imageWidth = dimensions.printableWidth;
          const imageHeight = dimensions.printableHeight;
          
          // Draw main image
          ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight);
          
          // Add border if enabled
          if (settings.includeBorder && settings.borderWidth > 0) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = this.mmToPixels(settings.borderWidth, settings.format.dpi);
            ctx.strokeRect(imageX, imageY, imageWidth, imageHeight);
          }
          
          // Add watermark if enabled
          if (settings.includeWatermark) {
            this.addWatermark(ctx, canvas.width, canvas.height, settings);
          }
          
          // Add crop marks
          this.addCropMarks(ctx, dimensions, settings);
          
          // Convert to high-quality image
          const quality = this.getQualityValue(settings.quality);
          const dataUrl = canvas.toDataURL('image/png', quality);
          resolve(dataUrl);
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load source image'));
      img.src = sourceImageUrl;
    });
  }

  /**
   * Add watermark to print
   */
  private addWatermark(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    settings: PrintSettings
  ): void {
    ctx.save();
    
    // Semi-transparent watermark
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#000000';
    ctx.font = `${this.mmToPixels(3, settings.format.dpi)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Rotate for diagonal watermark
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.fillText('BoothieCall Elegancia', 0, 0);
    
    ctx.restore();
  }

  /**
   * Add crop marks for print cutting
   */
  private addCropMarks(
    ctx: CanvasRenderingContext2D,
    dimensions: any,
    settings: PrintSettings
  ): void {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    const markLength = this.mmToPixels(5, settings.format.dpi);
    const markOffset = this.mmToPixels(2, settings.format.dpi);
    
    // Top-left crop marks
    ctx.beginPath();
    ctx.moveTo(dimensions.bleedWidth - markOffset, dimensions.bleedHeight);
    ctx.lineTo(dimensions.bleedWidth - markOffset - markLength, dimensions.bleedHeight);
    ctx.moveTo(dimensions.bleedWidth, dimensions.bleedHeight - markOffset);
    ctx.lineTo(dimensions.bleedWidth, dimensions.bleedHeight - markOffset - markLength);
    ctx.stroke();
    
    // Top-right crop marks
    const rightX = dimensions.canvasWidth - dimensions.bleedWidth;
    ctx.beginPath();
    ctx.moveTo(rightX + markOffset, dimensions.bleedHeight);
    ctx.lineTo(rightX + markOffset + markLength, dimensions.bleedHeight);
    ctx.moveTo(rightX, dimensions.bleedHeight - markOffset);
    ctx.lineTo(rightX, dimensions.bleedHeight - markOffset - markLength);
    ctx.stroke();
    
    // Bottom-left crop marks
    const bottomY = dimensions.canvasHeight - dimensions.bleedHeight;
    ctx.beginPath();
    ctx.moveTo(dimensions.bleedWidth - markOffset, bottomY);
    ctx.lineTo(dimensions.bleedWidth - markOffset - markLength, bottomY);
    ctx.moveTo(dimensions.bleedWidth, bottomY + markOffset);
    ctx.lineTo(dimensions.bleedWidth, bottomY + markOffset + markLength);
    ctx.stroke();
    
    // Bottom-right crop marks
    ctx.beginPath();
    ctx.moveTo(rightX + markOffset, bottomY);
    ctx.lineTo(rightX + markOffset + markLength, bottomY);
    ctx.moveTo(rightX, bottomY + markOffset);
    ctx.lineTo(rightX, bottomY + markOffset + markLength);
    ctx.stroke();
    
    ctx.restore();
  }

  /**
   * Get quality value for different settings
   */
  private getQualityValue(quality: PrintSettings['quality']): number {
    switch (quality) {
      case 'draft': return 0.6;
      case 'normal': return 0.8;
      case 'high': return 0.9;
      case 'print-ready': return 1.0;
      default: return 0.9;
    }
  }

  /**
   * Get estimated file size
   */
  getEstimatedFileSize(settings: PrintSettings): string {
    const dimensions = this.calculatePrintDimensions(settings);
    const pixels = dimensions.canvasWidth * dimensions.canvasHeight;
    const quality = this.getQualityValue(settings.quality);
    
    // Rough estimation: PNG typically uses 3-4 bytes per pixel
    const estimatedBytes = pixels * 3.5 * quality;
    
    if (estimatedBytes < 1024 * 1024) {
      return `${Math.round(estimatedBytes / 1024)} KB`;
    } else {
      return `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  /**
   * Validate print settings
   */
  validatePrintSettings(settings: PrintSettings): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Check DPI
    if (settings.format.dpi < 150) {
      warnings.push('Low DPI may result in poor print quality');
    }
    
    // Check margins
    if (settings.margin < 2) {
      warnings.push('Small margins may result in content being cut off');
    }
    
    // Check bleed
    if (settings.bleed < 1 && settings.format.category === 'photo') {
      warnings.push('Consider adding bleed for professional printing');
    }
    
    // Check dimensions
    const dimensions = this.calculatePrintDimensions(settings);
    if (dimensions.printableWidth <= 0 || dimensions.printableHeight <= 0) {
      errors.push('Margins are too large for the selected format');
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }
}