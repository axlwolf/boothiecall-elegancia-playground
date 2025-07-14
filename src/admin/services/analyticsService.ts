import { DailySessions, PopularFilter, LayoutUsage } from '../types/Analytics';

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
};
