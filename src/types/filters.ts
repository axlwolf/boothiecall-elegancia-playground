import { ImageAdjustments } from '@/lib/imageProcessing';

export type FilterCategory = 'basic' | 'artistic' | 'vintage' | 'creative' | 'black-white';

export interface EnhancedFilter {
  id: string;
  name: string;
  category: FilterCategory;
  description: string;
  cssFilter?: string; // For quick preview
  canvasFilter?: (imageData: ImageData) => ImageData; // For final processing
  adjustments?: Partial<ImageAdjustments>; // For slider-based filters
  intensity?: number; // 0-100 for filter strength
  previewUrl?: string; // Thumbnail preview
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: string[]; // Array of filter IDs to apply in sequence
  adjustments: ImageAdjustments;
}

export interface PhotoEdit {
  photoId: string;
  originalUrl: string;
  editedUrl?: string;
  appliedFilters: string[];
  adjustments: ImageAdjustments;
  cropData?: CropData;
  rotationAngle: number;
  lastModified: number;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: number;
}

export interface EditHistory {
  id: string;
  photoId: string;
  action: EditAction;
  previousState: PhotoEdit;
  timestamp: number;
}

export type EditAction = 
  | 'filter_applied'
  | 'filter_removed'
  | 'adjustment_changed'
  | 'crop_applied'
  | 'rotation_applied'
  | 'reset';

// Enhanced filter definitions with categories
export const enhancedFilters: EnhancedFilter[] = [
  // Basic filters
  {
    id: 'none',
    name: 'Original',
    category: 'basic',
    description: 'No filter applied',
    cssFilter: 'none'
  },
  {
    id: 'brightness',
    name: 'Brightness',
    category: 'basic',
    description: 'Adjust image brightness',
    adjustments: { brightness: 20 }
  },
  {
    id: 'contrast',
    name: 'Contrast',
    category: 'basic',
    description: 'Enhance image contrast',
    adjustments: { contrast: 30 }
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    category: 'basic',
    description: 'Boost colors and saturation',
    cssFilter: 'saturate(150%) contrast(110%)',
    adjustments: { saturation: 40, contrast: 10 }
  },
  
  // Artistic filters
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    category: 'artistic',
    description: 'Transform photo into oil painting style',
    cssFilter: 'contrast(130%) saturate(120%) blur(0.5px)'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    category: 'artistic',
    description: 'Soft watercolor painting effect',
    cssFilter: 'contrast(90%) saturate(110%) blur(0.3px) opacity(0.9)'
  },
  {
    id: 'pencil-sketch',
    name: 'Pencil Sketch',
    category: 'artistic',
    description: 'Convert to pencil drawing style',
    cssFilter: 'grayscale(100%) contrast(200%) brightness(90%)'
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    category: 'artistic',
    description: 'Bold pop art colors and contrast',
    cssFilter: 'contrast(200%) saturate(200%) hue-rotate(15deg)'
  },
  
  // Vintage filters
  {
    id: 'vintage-film',
    name: 'Vintage Film',
    category: 'vintage',
    description: 'Classic film photography look',
    cssFilter: 'sepia(30%) contrast(120%) brightness(110%) saturate(80%)',
    adjustments: { contrast: 20, brightness: 10, saturation: -20 }
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    category: 'vintage',
    description: 'Instant camera aesthetic',
    cssFilter: 'sepia(20%) contrast(110%) brightness(115%) saturate(90%)'
  },
  {
    id: 'kodachrome',
    name: 'Kodachrome',
    category: 'vintage',
    description: 'Rich, warm film colors',
    cssFilter: 'contrast(120%) saturate(130%) hue-rotate(-10deg) brightness(105%)'
  },
  {
    id: 'cross-process',
    name: 'Cross Process',
    category: 'vintage',
    description: 'Experimental film processing effect',
    cssFilter: 'contrast(140%) saturate(150%) hue-rotate(30deg)'
  },
  
  // Creative filters
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    category: 'creative',
    description: 'Electric neon lighting effect',
    cssFilter: 'contrast(150%) saturate(200%) brightness(120%) hue-rotate(270deg)'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    category: 'creative',
    description: 'Futuristic cyberpunk aesthetic',
    cssFilter: 'contrast(160%) saturate(140%) hue-rotate(240deg) brightness(90%)'
  },
  {
    id: 'dream',
    name: 'Dream',
    category: 'creative',
    description: 'Soft, dreamy atmosphere',
    cssFilter: 'contrast(80%) saturate(120%) brightness(115%) blur(0.2px)'
  },
  {
    id: 'infrared',
    name: 'Infrared',
    category: 'creative',
    description: 'False color infrared effect',
    cssFilter: 'hue-rotate(180deg) saturate(200%) contrast(120%)'
  },
  
  // Black & White filters
  {
    id: 'noir',
    name: 'Film Noir',
    category: 'black-white',
    description: 'Classic black and white with high contrast',
    cssFilter: 'grayscale(100%) contrast(130%) brightness(90%)'
  },
  {
    id: 'dramatic-bw',
    name: 'Dramatic B&W',
    category: 'black-white',
    description: 'High contrast dramatic black and white',
    cssFilter: 'grayscale(100%) contrast(180%) brightness(95%)'
  },
  {
    id: 'soft-bw',
    name: 'Soft B&W',
    category: 'black-white',
    description: 'Gentle black and white with soft contrast',
    cssFilter: 'grayscale(100%) contrast(90%) brightness(110%)'
  }
];

// Popular filter presets
export const filterPresets: FilterPreset[] = [
  {
    id: 'instagram-classic',
    name: 'Instagram Classic',
    description: 'Popular social media look',
    filters: ['vintage-film'],
    adjustments: {
      brightness: 10,
      contrast: 15,
      saturation: 20,
      hue: 0,
      exposure: 0,
      highlights: -10,
      shadows: 10
    }
  },
  {
    id: 'portrait-enhance',
    name: 'Portrait Enhance',
    description: 'Optimized for portrait photography',
    filters: ['vibrant'],
    adjustments: {
      brightness: 5,
      contrast: 20,
      saturation: 15,
      hue: 0,
      exposure: 0.2,
      highlights: -15,
      shadows: 20
    }
  },
  {
    id: 'landscape-pop',
    name: 'Landscape Pop',
    description: 'Make landscapes more vibrant',
    filters: ['vibrant'],
    adjustments: {
      brightness: 0,
      contrast: 25,
      saturation: 30,
      hue: 5,
      exposure: 0,
      highlights: -20,
      shadows: 15
    }
  }
];