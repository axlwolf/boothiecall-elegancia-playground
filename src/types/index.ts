// Base types for BoothieCall Playground

export interface BasicComponentProps {
    children?: React.ReactNode;
    className?: string;
  }
  
  export interface ButtonProps extends BasicComponentProps {
    onClick: () => void;
    disabled?: boolean;
  }
  
  export interface NavigationProps {
    onStart?: () => void;
    onBack?: () => void;
    onNext?: () => void;
  }
  
  export interface LandingProps {
    onStart: () => void;
  }
  
  //export interface AppLayoutProps extends BasicComponentProps {}
  
  // Layout types
  export type LayoutType = '1shot' | '3shot' | '4shot' | '6shot';
  
  // Theme types - Elegancia Nocturna Design System
  export interface ThemeColors {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryHover: string;
    primaryGradient: string;
    primaryGradientHover: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    textAccent: string;
    border: string;
    borderLight: string;
    button: string;
    buttonSecondary: string;
    animatedBg: string;
    overlay: string;
    shadow: string;
  }
  
  export interface Theme {
    isDarkMode: boolean;
    toggleTheme: () => void;
    colors: ThemeColors;
  }
  
  export interface ThemeProviderProps {
    children: React.ReactNode;
  }
  
  //export interface ThemeContextType extends Theme {}
  
  // Photobooth specific types
  export interface PhotoboothProps {
    onBack: () => void;
  }
  
  export interface CapturedImage {
    photo: string; // base64 data URL
    timestamp: number;
  }
  
  export interface DesignOverlay {
    key: string;
    url: string;
  }
  
  export interface CameraSetupProps {
    layout: LayoutOption;
    onBack: () => void;
    onDone: (images: CapturedImage[]) => void;
  }
  
  export interface StripDesignProps {
    images: string[];
    captured: CapturedImage[];
    designs: DesignOverlay[];
    selectedDesign: DesignOverlay | null;
    onSelectDesign: (design: DesignOverlay) => void;
    onBack: () => void;
    onNext: () => void;
    onDownload: (dataUrl: string, filename?: string) => void;
  }
  
  export interface LayoutOption {
    id: number;
    label: string;
    img: string;
    shots: number;
  }
  
  // Filter types
  export interface FilterOption {
    name: string;
    value: string;
    cssFilter: string;
  }
  
  // Frame mapping types
  export interface FrameWindow {
    left: number;
    top: number;
    width: number;
    height: number;
    borderRadius?: number;
  }
  
  export interface FrameMapping {
    frame: string;
    frameWidth: number;
    frameHeight: number;
    windows: FrameWindow[];
  }