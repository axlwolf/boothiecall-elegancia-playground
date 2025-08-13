import { Asset } from '../types/Asset';

let mockAssets: Asset[] = [
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
        resolve([...mockAssets]);
      }, 300);
    });
  },

  addAsset: async (file: File, type: 'Image' | 'Logo' | 'Design Template'): Promise<Asset> => {
    return new Promise((resolve) => {
      const newAsset: Asset = {
        id: (mockAssets.length + 1).toString(),
        fileName: file.name,
        type,
        url: URL.createObjectURL(file), // Simulate a local URL for the preview
        createdAt: new Date(),
      };
      mockAssets.push(newAsset);
      setTimeout(() => {
        resolve(newAsset);
      }, 300);
    });
  },

  updateAsset: async (id: string, data: Partial<Pick<Asset, 'fileName' | 'type'>>): Promise<Asset> => {
    return new Promise((resolve, reject) => {
      const assetIndex = mockAssets.findIndex(asset => asset.id === id);
      if (assetIndex === -1) {
        return reject(new Error('Asset not found'));
      }
      mockAssets[assetIndex] = { ...mockAssets[assetIndex], ...data };
      setTimeout(() => {
        resolve(mockAssets[assetIndex]);
      }, 300);
    });
  },

  deleteAsset: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const initialLength = mockAssets.length;
      mockAssets = mockAssets.filter(asset => asset.id !== id);
      if (mockAssets.length === initialLength) {
        return reject(new Error('Asset not found'));
      }
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },
};
