export type OutputFormat = {
  id: string;
  name: string;
  fileType: 'PNG' | 'GIF' | 'Print';
  quality: number; // 0-100
  watermarkText?: string;
  isActive: boolean;
};
