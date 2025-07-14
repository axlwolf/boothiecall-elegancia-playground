import { OutputFormat } from '../types/OutputFormat';

let mockOutputFormats: OutputFormat[] = [
  {
    id: '1',
    name: 'High-Res PNG',
    fileType: 'PNG',
    quality: 90,
    watermarkText: 'BoothieCall',
    isActive: true,
  },
  {
    id: '2',
    name: 'Web GIF',
    fileType: 'GIF',
    quality: 70,
    watermarkText: '',
    isActive: true,
  },
  {
    id: '3',
    name: 'Print Ready PDF',
    fileType: 'Print',
    quality: 100,
    watermarkText: 'Elegancia Nocturna',
    isActive: false,
  },
];

export const outputFormatService = {
  getOutputFormats: async (): Promise<OutputFormat[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockOutputFormats]);
      }, 300);
    });
  },

  addOutputFormat: async (data: Omit<OutputFormat, 'id'>): Promise<OutputFormat> => {
    return new Promise((resolve) => {
      const newFormat: OutputFormat = {
        id: (mockOutputFormats.length + 1).toString(),
        ...data,
      };
      mockOutputFormats.push(newFormat);
      setTimeout(() => {
        resolve(newFormat);
      }, 300);
    });
  },

  updateOutputFormat: async (id: string, data: Partial<Omit<OutputFormat, 'id'>>): Promise<OutputFormat> => {
    return new Promise((resolve, reject) => {
      const formatIndex = mockOutputFormats.findIndex(format => format.id === id);
      if (formatIndex === -1) {
        return reject(new Error('Output Format not found'));
      }
      mockOutputFormats[formatIndex] = { ...mockOutputFormats[formatIndex], ...data };
      setTimeout(() => {
        resolve(mockOutputFormats[formatIndex]);
      }, 300);
    });
  },

  deleteOutputFormat: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const initialLength = mockOutputFormats.length;
      mockOutputFormats = mockOutputFormats.filter(format => format.id !== id);
      if (mockOutputFormats.length === initialLength) {
        return reject(new Error('Output Format not found'));
      }
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },
};
