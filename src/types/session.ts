export interface PhotoSession {
  id: string;
  layout: {
    id: string;
    name: string;
    shots: number;
  };
  template: {
    id: string;
    name: string;
  };
  photos: {
    id: string;
    dataUrl: string;
    filterId?: string;
    adjustments?: any;
  }[];
  finalImageUrl: string;
  gifUrl?: string;
  createdAt: string;
  metadata: {
    userAgent: string;
    screenResolution: string;
    duration: number; // session duration in seconds
    filtersUsed: string[];
    wasEdited: boolean;
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