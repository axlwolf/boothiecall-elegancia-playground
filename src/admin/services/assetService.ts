import { Asset } from '../types/Asset';

const mockAssets: Asset[] = [
  {
    id: '1',
    fileName: 'logo-dark.png',
    type: 'Logo',
    url: '/placeholder.svg',
    createdAt: new Date('2024-07-10T10:00:00Z'),
  },
  {
    id: '2',
    fileName: 'hero-background.jpg',
    type: 'Image',
    url: '/placeholder.svg',
    createdAt: new Date('2024-07-11T11:30:00Z'),
  },
  {
    id: '3',
    fileName: 'classic-template.psd',
    type: 'Design Template',
    url: '/placeholder.svg',
    createdAt: new Date('2024-07-12T14:00:00Z'),
  },
  {
    id: '4',
    fileName: 'logo-light.png',
    type: 'Logo',
    url: '/placeholder.svg',
    createdAt: new Date('2024-07-13T09:00:00Z'),
  },
];

export const assetService = {
  getAssets: async (): Promise<Asset[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockAssets);
      }, 500);
    });
  },
};
