import { 
  imageToImageData, 
  imageDataToDataUrl, 
  applyAdjustments,
  applyConvolution,
  kernels,
  ImageAdjustments
} from './imageProcessing';
import { EnhancedFilter, PhotoEdit } from '@/types/filters';

/**
 * Main filter engine for applying advanced canvas-based filters
 */
export class FilterEngine {
  private static instance: FilterEngine;
  private cache: Map<string, string> = new Map();

  static getInstance(): FilterEngine {
    if (!FilterEngine.instance) {
      FilterEngine.instance = new FilterEngine();
    }
    return FilterEngine.instance;
  }

  /**
   * Apply a filter to an image
   */
  async applyFilter(imageUrl: string, filter: EnhancedFilter): Promise<string> {
    const cacheKey = `${imageUrl}_${filter.id}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      let imageData = await imageToImageData(imageUrl);
      
      // Apply canvas-based filter if available
      if (filter.canvasFilter) {
        imageData = filter.canvasFilter(imageData);
      }
      
      // Apply adjustments if specified
      if (filter.adjustments) {
        const adjustments = { ...filter.adjustments } as ImageAdjustments;
        imageData = applyAdjustments(imageData, adjustments);
      }
      
      // Apply artistic effects based on filter category
      imageData = await this.applyArtisticEffect(imageData, filter);
      
      const result = imageDataToDataUrl(imageData);
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Filter application failed:', error);
      return imageUrl; // Return original on error
    }
  }

  /**
   * Apply multiple filters in sequence
   */
  async applyFilters(imageUrl: string, filters: EnhancedFilter[]): Promise<string> {
    let currentUrl = imageUrl;
    
    for (const filter of filters) {
      currentUrl = await this.applyFilter(currentUrl, filter);
    }
    
    return currentUrl;
  }

  /**
   * Apply adjustments to an image
   */
  async applyImageAdjustments(imageUrl: string, adjustments: ImageAdjustments): Promise<string> {
    const cacheKey = `${imageUrl}_adj_${JSON.stringify(adjustments)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const imageData = await imageToImageData(imageUrl);
      const processed = applyAdjustments(imageData, adjustments);
      const result = imageDataToDataUrl(processed);
      
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Adjustment application failed:', error);
      return imageUrl;
    }
  }

  /**
   * Apply artistic effects based on filter type
   */
  private async applyArtisticEffect(imageData: ImageData, filter: EnhancedFilter): Promise<ImageData> {
    switch (filter.id) {
      case 'oil-painting':
        return this.oilPaintingEffect(imageData);
      
      case 'pencil-sketch':
        return this.pencilSketchEffect(imageData);
      
      case 'watercolor':
        return this.watercolorEffect(imageData);
      
      case 'emboss':
        return applyConvolution(imageData, kernels.emboss);
      
      case 'edge-detect':
        return applyConvolution(imageData, kernels.edgeDetect);
      
      case 'sharpen':
        return applyConvolution(imageData, kernels.sharpen);
      
      case 'blur':
        return applyConvolution(imageData, kernels.blur, 9);
      
      default:
        return imageData;
    }
  }

  /**
   * Oil painting artistic effect
   */
  private oilPaintingEffect(imageData: ImageData): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    const radius = 3;
    const intensityLevels = 20;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const intensityCount: number[] = new Array(intensityLevels).fill(0);
        const avgR: number[] = new Array(intensityLevels).fill(0);
        const avgG: number[] = new Array(intensityLevels).fill(0);
        const avgB: number[] = new Array(intensityLevels).fill(0);

        // Sample neighboring pixels
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = Math.max(0, Math.min(width - 1, x + dx));
            const ny = Math.max(0, Math.min(height - 1, y + dy));
            const idx = (ny * width + nx) * 4;

            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const intensity = Math.floor(((r + g + b) / 3) * intensityLevels / 255);

            intensityCount[intensity]++;
            avgR[intensity] += r;
            avgG[intensity] += g;
            avgB[intensity] += b;
          }
        }

        // Find most frequent intensity
        let maxCount = 0;
        let maxIndex = 0;
        for (let i = 0; i < intensityLevels; i++) {
          if (intensityCount[i] > maxCount) {
            maxCount = intensityCount[i];
            maxIndex = i;
          }
        }

        // Set pixel to average of most frequent intensity
        const idx = (y * width + x) * 4;
        if (maxCount > 0) {
          data[idx] = avgR[maxIndex] / maxCount;
          data[idx + 1] = avgG[maxIndex] / maxCount;
          data[idx + 2] = avgB[maxIndex] / maxCount;
        }
      }
    }

    return new ImageData(data, width, height);
  }

  /**
   * Pencil sketch artistic effect
   */
  private pencilSketchEffect(imageData: ImageData): ImageData {
    // Convert to grayscale first
    const data = new Uint8ClampedArray(imageData.data);
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    
    let result = new ImageData(data, imageData.width, imageData.height);
    
    // Apply edge detection
    result = applyConvolution(result, kernels.edgeDetect);
    
    // Invert for pencil effect
    const finalData = result.data;
    for (let i = 0; i < finalData.length; i += 4) {
      finalData[i] = 255 - finalData[i];
      finalData[i + 1] = 255 - finalData[i + 1];
      finalData[i + 2] = 255 - finalData[i + 2];
    }
    
    return result;
  }

  /**
   * Watercolor artistic effect
   */
  private watercolorEffect(imageData: ImageData): ImageData {
    // Apply blur for soft effect
    const result = applyConvolution(imageData, kernels.blur, 9);
    
    // Reduce color palette
    const data = result.data;
    const levels = 6; // Reduce to 6 color levels per channel
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.floor(data[i] / (256 / levels)) * (256 / levels);
      data[i + 1] = Math.floor(data[i + 1] / (256 / levels)) * (256 / levels);
      data[i + 2] = Math.floor(data[i + 2] / (256 / levels)) * (256 / levels);
    }
    
    return result;
  }

  /**
   * Get preview for a filter (faster CSS-based preview)
   */
  getFilterPreview(filter: EnhancedFilter): string {
    return filter.cssFilter || 'none';
  }

  /**
   * Clear cache to free memory
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size for debugging
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}