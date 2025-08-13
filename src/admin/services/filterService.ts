import { Filter } from '../types/Filter';

let mockFilters: Filter[] = [
  {
    id: '1',
    name: 'Noir',
    cssProperties: 'grayscale(100%)',
    isActive: true,
  },
  {
    id: '2',
    name: 'Vintage',
    cssProperties: 'sepia(100%) contrast(90%)',
    isActive: true,
  },
  {
    id: '3',
    name: 'Glam',
    cssProperties: 'saturate(150%) contrast(110%)',
    isActive: false,
  },
];

export const filterService = {
  getFilters: async (): Promise<Filter[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockFilters]);
      }, 300);
    });
  },

  addFilter: async (data: Omit<Filter, 'id'>): Promise<Filter> => {
    return new Promise((resolve) => {
      const newFilter: Filter = {
        id: (mockFilters.length + 1).toString(),
        ...data,
      };
      mockFilters.push(newFilter);
      setTimeout(() => {
        resolve(newFilter);
      }, 300);
    });
  },

  updateFilter: async (id: string, data: Partial<Omit<Filter, 'id'>>): Promise<Filter> => {
    return new Promise((resolve, reject) => {
      const filterIndex = mockFilters.findIndex(filter => filter.id === id);
      if (filterIndex === -1) {
        return reject(new Error('Filter not found'));
      }
      mockFilters[filterIndex] = { ...mockFilters[filterIndex], ...data };
      setTimeout(() => {
        resolve(mockFilters[filterIndex]);
      }, 300);
    });
  },

  deleteFilter: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const initialLength = mockFilters.length;
      mockFilters = mockFilters.filter(filter => filter.id !== id);
      if (mockFilters.length === initialLength) {
        return reject(new Error('Filter not found'));
      }
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },
};
