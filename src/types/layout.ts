export interface Layout {
  id: string;
  name: string;
  shots: number;
  description?: string;
  preview?: string;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  gifData?: Blob;
}