export interface FrameMapping {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
}

export interface TemplateAssets {
  backgroundImage?: string;
  overlayImage?: string;
  previewImage: string;
}

export interface TemplateStyling {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  titleColor: string;
  subtitleColor: string;
  titleFont: string;
  subtitleFont: string;
}

export interface Template {
  id: string;
  name: string;
  layoutType: string;
  description: string;
  frameMapping: FrameMapping[];
  styling: TemplateStyling;
  assets: TemplateAssets;
  isActive: boolean;
}

export interface TemplatesByLayout {
  [layoutId: string]: Template[];
}