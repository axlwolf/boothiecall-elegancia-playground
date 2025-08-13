import { DailySessions, PopularFilter, LayoutUsage } from '../types/Analytics';
import { Asset } from '../types/Asset';
import { User } from '../types/User';

const mockDailySessions: DailySessions[] = [
  { date: '2024-07-01', count: 120 },
  { date: '2024-07-02', count: 150 },
  { date: '2024-07-03', count: 130 },
  { date: '2024-07-04', count: 180 },
  { date: '2024-07-05', count: 160 },
  { date: '2024-07-06', count: 200 },
  { date: '2024-07-07', count: 190 },
];

const mockPopularFilters: PopularFilter[] = [
  { name: 'Noir', usageCount: 300 },
  { name: 'Vintage', usageCount: 250 },
  { name: 'Glam', usageCount: 180 },
  { name: 'Sepia', usageCount: 120 },
  { name: 'Classic', usageCount: 90 },
];

const mockLayoutUsage: LayoutUsage[] = [
  { layoutType: '1-shot', count: 150 },
  { layoutType: '3-shot', count: 220 },
  { layoutType: '4-shot', count: 300 },
  { layoutType: '6-shot', count: 180 },
];

const mockTotalAssets = 50;
const mockTotalUsers = 120;
const mockTotalDesigns = 15;
const mockTotalFilters = 20;

const mockRecentAssets: Asset[] = [
  { id: 'a1', fileName: 'new-logo.png', type: 'Logo', url: '/placeholder.svg', createdAt: new Date('2024-07-13T10:00:00Z') },
  { id: 'a2', fileName: 'summer-bg.jpg', type: 'Image', url: '/placeholder.svg', createdAt: new Date('2024-07-12T15:30:00Z') },
];

const mockRecentUsers: User[] = [
  { id: 'u1', email: 'newuser@example.com', role: 'Viewer', tenantId: 'tenant1', permissions: [] },
  { id: 'u2', email: 'editor2@example.com', role: 'Editor', tenantId: 'tenant2', permissions: [] },
];

export const analyticsService = {
  getDailySessions: async (): Promise<DailySessions[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockDailySessions]);
      }, 300);
    });
  },

  getPopularFilters: async (): Promise<PopularFilter[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockPopularFilters]);
      }, 300);
    });
  },

  getLayoutUsage: async (): Promise<LayoutUsage[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockLayoutUsage]);
      }, 300);
    });
  },

  getTotalAssets: async (): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTotalAssets);
      }, 100);
    });
  },

  getTotalUsers: async (): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTotalUsers);
      }, 100);
    });
  },

  getTotalDesigns: async (): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTotalDesigns);
      }, 100);
    });
  },

  getTotalFilters: async (): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTotalFilters);
      }, 100);
    });
  },

  getRecentAssets: async (): Promise<Asset[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockRecentAssets]);
      }, 200);
    });
  },

  getRecentUsers: async (): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockRecentUsers]);
      }, 200);
    });
  },
};
