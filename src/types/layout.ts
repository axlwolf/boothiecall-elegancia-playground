export interface Layout {
  id: string;
  name: string;
  shots: number;
  description?: string;
  preview?: string;
  requirements?: string[];
}

export interface PhotoMetadata {
  filterId?: string;
  adjustments?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    exposure?: number;
    highlights?: number;
    shadows?: number;
  };
  editedAt?: string;
  originalSize?: { width: number; height: number };
  compressedSize?: { width: number; height: number };
  compressionRatio?: number;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  gifData?: Blob;
  metadata?: PhotoMetadata;
}