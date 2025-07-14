export type Asset = {
  id: string;
  fileName: string;
  type: 'Image' | 'Logo' | 'Design Template';
  url: string;
  createdAt: Date;
};
