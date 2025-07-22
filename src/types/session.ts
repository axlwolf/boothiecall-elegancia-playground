export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  filterId?: string;
  adjustments?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    blur?: number;
    [key: string]: number | undefined;
  };
  metadata?: {
    timestamp: string;
    size: number;
    format: string;
  };
}

export interface PhotoSession {
  id: string;
  layout: {
    id: string;
    name: string;
    shots: number;
    requirements?: {
      minPhotos: number;
      maxPhotos: number;
    };
  };
  template: {
    id: string;
    name: string;
    assets?: {
      background?: string;
      frames?: string[];
    };
  };
  photos: CapturedPhoto[];
  finalImageUrl: string;
  gifUrl?: string;
  createdAt: string;
  thumbnailUrl?: string;
  layoutName?: string;
  templateName?: string;
  photoCount?: number;
  metadata: {
    userAgent: string;
    screenResolution: string;
    duration: number; // session duration in seconds
    filtersUsed: string[];
    wasEdited: boolean;
    version?: number;
    updatedAt?: string;
  };
}

export interface SessionSummary {
  id: string;
  layoutName: string;
  templateName: string;
  photoCount: number;
  createdAt: string;
  thumbnailUrl: string;
}

export interface SessionStats {
  totalSessions: number;
  totalPhotos: number;
  favoriteLayout: string;
  favoriteTemplate: string;
  averageSessionDuration: number;
  mostUsedFilters: { name: string; count: number }[];
}