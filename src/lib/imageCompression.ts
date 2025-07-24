/**
 * Advanced image compression and optimization service
 * Provides intelligent compression based on image type, size, and usage context
 */

export interface CompressionOptions {
  quality?: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
  progressive?: boolean;
  preserveMetadata?: boolean;
}

export interface CompressionResult {
  compressedDataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export class ImageCompressionService {
  private static instance: ImageCompressionService;
  private compressionCache = new Map<string, CompressionResult>();
  private readonly DEFAULT_QUALITY = 0.85;
  private readonly MAX_CACHE_SIZE = 50;

  static getInstance(): ImageCompressionService {
    if (!ImageCompressionService.instance) {
      ImageCompressionService.instance = new ImageCompressionService();
    }
    return ImageCompressionService.instance;
  }

  /**
   * Compress image with intelligent optimization based on context
   */
  async compressImage(
    imageUrl: string,
    context: 'thumbnail' | 'preview' | 'final' | 'storage' = 'preview',
    customOptions?: CompressionOptions
  ): Promise<CompressionResult> {
    const cacheKey = `${imageUrl}-${context}-${JSON.stringify(customOptions)}`;
    
    // Check cache first
    if (this.compressionCache.has(cacheKey)) {
      return this.compressionCache.get(cacheKey)!;
    }

    const options = this.getContextualOptions(context, customOptions);
    const result = await this.performCompression(imageUrl, options);

    // Cache result with size limit
    this.cacheResult(cacheKey, result);
    
    return result;
  }

  /**
   * Get optimal compression settings based on usage context
   */
  private getContextualOptions(
    context: 'thumbnail' | 'preview' | 'final' | 'storage',
    customOptions?: CompressionOptions
  ): CompressionOptions {
    const contextDefaults: Record<string, CompressionOptions> = {
      thumbnail: {
        quality: 0.7,
        maxWidth: 150,
        maxHeight: 150,
        format: 'jpeg',
        progressive: false
      },
      preview: {
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 600,
        format: 'jpeg',
        progressive: true
      },
      final: {
        quality: 0.9,
        maxWidth: 1920,
        maxHeight: 1080,
        format: 'png',
        preserveMetadata: true
      },
      storage: {
        quality: 0.85,
        maxWidth: 1200,
        maxHeight: 900,
        format: 'jpeg',
        progressive: true
      }
    };

    return { ...contextDefaults[context], ...customOptions };
  }

  /**
   * Perform the actual image compression
   */
  private async performCompression(
    imageUrl: string,
    options: CompressionOptions
  ): Promise<CompressionResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          // Calculate optimal dimensions
          const { width, height } = this.calculateOptimalDimensions(
            img.width,
            img.height,
            options.maxWidth,
            options.maxHeight
          );

          canvas.width = width;
          canvas.height = height;

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          // Determine output format
          const format = this.determineOptimalFormat(options.format, imageUrl);
          const mimeType = `image/${format}`;
          const quality = options.quality || this.DEFAULT_QUALITY;

          // Generate compressed image
          const compressedDataUrl = canvas.toDataURL(mimeType, quality);

          // Calculate sizes and compression ratio
          const originalSize = this.estimateImageSize(imageUrl);
          const compressedSize = this.calculateDataUrlSize(compressedDataUrl);
          const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1;

          resolve({
            compressedDataUrl,
            originalSize,
            compressedSize,
            compressionRatio,
            format,
            dimensions: { width, height }
          });

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = imageUrl;
    });
  }

  /**
   * Calculate optimal dimensions while preserving aspect ratio
   */
  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number
  ): { width: number; height: number } {
    if (!maxWidth && !maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    let width = originalWidth;
    let height = originalHeight;

    // Apply width constraint
    if (maxWidth && width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    // Apply height constraint
    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * Determine optimal format based on image characteristics
   */
  private determineOptimalFormat(
    preferredFormat?: 'jpeg' | 'png' | 'webp',
    imageUrl?: string
  ): 'jpeg' | 'png' | 'webp' {
    // Check browser support for WebP
    const supportsWebP = this.checkWebPSupport();
    
    if (preferredFormat) {
      if (preferredFormat === 'webp' && !supportsWebP) {
        return 'jpeg'; // Fallback to JPEG if WebP not supported
      }
      return preferredFormat;
    }

    // Auto-detect based on image characteristics
    if (imageUrl && this.hasTransparency(imageUrl)) {
      return 'png'; // Preserve transparency
    }

    return supportsWebP ? 'webp' : 'jpeg'; // Use WebP if supported, otherwise JPEG
  }

  /**
   * Check if browser supports WebP format
   */
  private checkWebPSupport(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Estimate if image has transparency (basic heuristic)
   */
  private hasTransparency(imageUrl: string): boolean {
    // Simple heuristic based on file extension
    return imageUrl.toLowerCase().includes('.png') || imageUrl.includes('data:image/png');
  }

  /**
   * Estimate original image size from data URL
   */
  private estimateImageSize(imageUrl: string): number {
    if (imageUrl.startsWith('data:')) {
      return this.calculateDataUrlSize(imageUrl);
    }
    // For regular URLs, we can't easily determine size without fetching
    return 0;
  }

  /**
   * Calculate size of data URL in bytes
   */
  private calculateDataUrlSize(dataUrl: string): number {
    const base64String = dataUrl.split(',')[1];
    if (!base64String) return 0;
    
    // Base64 encoding increases size by ~33%
    return Math.round((base64String.length * 3) / 4);
  }

  /**
   * Cache compression result with size management
   */
  private cacheResult(key: string, result: CompressionResult): void {
    // Remove oldest entries if cache is full
    if (this.compressionCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.compressionCache.keys().next().value;
      this.compressionCache.delete(firstKey);
    }
    
    this.compressionCache.set(key, result);
  }

  /**
   * Batch compress multiple images with progress tracking
   */
  async compressMultiple(
    images: Array<{ url: string; context?: 'thumbnail' | 'preview' | 'final' | 'storage' }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<CompressionResult[]> {
    const results: CompressionResult[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const { url, context = 'preview' } = images[i];
      
      try {
        const result = await this.compressImage(url, context);
        results.push(result);
      } catch (error) {
        console.error(`Failed to compress image ${url}:`, error);
        // Add placeholder result for failed compression
        results.push({
          compressedDataUrl: url,
          originalSize: 0,
          compressedSize: 0,
          compressionRatio: 1,
          format: 'unknown',
          dimensions: { width: 0, height: 0 }
        });
      }
      
      if (onProgress) {
        onProgress(i + 1, images.length);
      }
    }
    
    return results;
  }

  /**
   * Get compression statistics
   */
  getCompressionStats(): {
    cacheSize: number;
    totalCompressions: number;
    averageCompressionRatio: number;
  } {
    const results = Array.from(this.compressionCache.values());
    const averageRatio = results.length > 0 
      ? results.reduce((sum, result) => sum + result.compressionRatio, 0) / results.length
      : 1;

    return {
      cacheSize: this.compressionCache.size,
      totalCompressions: results.length,
      averageCompressionRatio: averageRatio
    };
  }

  /**
   * Clear compression cache
   */
  clearCache(): void {
    this.compressionCache.clear();
  }
}

// Export singleton instance
export const imageCompressionService = ImageCompressionService.getInstance();

// Utility functions for common compression tasks
export const compressForThumbnail = (imageUrl: string) => 
  imageCompressionService.compressImage(imageUrl, 'thumbnail');

export const compressForPreview = (imageUrl: string) => 
  imageCompressionService.compressImage(imageUrl, 'preview');

export const compressForStorage = (imageUrl: string) => 
  imageCompressionService.compressImage(imageUrl, 'storage');

export const compressForFinal = (imageUrl: string) => 
  imageCompressionService.compressImage(imageUrl, 'final');
