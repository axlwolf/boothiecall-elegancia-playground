import { OutputFormat } from '../types/OutputFormat';

// Mock data for output formats
let mockFormats: OutputFormat[] = [
  {
    id: '1',
    name: 'High Quality PNG',
    fileType: 'PNG',
    quality: 100,
    watermarkText: 'BoothieCall',
    isActive: true
  },
  {
    id: '2',
    name: 'Standard PNG',
    fileType: 'PNG',
    quality: 85,
    isActive: true
  },
  {
    id: '3',
    name: 'Animated GIF',
    fileType: 'GIF',
    quality: 80,
    isActive: true
  },
  {
    id: '4',
    name: 'Print Ready',
    fileType: 'Print',
    quality: 100,
    watermarkText: 'Premium Quality',
    isActive: true
  },
  {
    id: '5',
    name: 'Basic PNG',
    fileType: 'PNG',
    quality: 70,
    isActive: false
  }
];

export const outputFormatService = {
  getOutputFormats: async (): Promise<OutputFormat[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockFormats]);
      }, 300);
    });
  },

  addOutputFormat: async (data: Omit<OutputFormat, 'id'>): Promise<OutputFormat> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newFormat: OutputFormat = {
          id: (mockFormats.length + 1).toString(),
          ...data
        };
        mockFormats.push(newFormat);
        resolve(newFormat);
      }, 300);
    });
  },

  updateOutputFormat: async (id: string, data: Partial<Omit<OutputFormat, 'id'>>): Promise<OutputFormat> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const formatIndex = mockFormats.findIndex(format => format.id === id);
        if (formatIndex === -1) {
          reject(new Error('Format not found'));
          return;
        }
        mockFormats[formatIndex] = { 
          ...mockFormats[formatIndex], 
          ...data
        };
        resolve(mockFormats[formatIndex]);
      }, 300);
    });
  },

  deleteOutputFormat: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const initialLength = mockFormats.length;
        mockFormats = mockFormats.filter(format => format.id !== id);
        if (mockFormats.length === initialLength) {
          reject(new Error('Format not found'));
          return;
        }
        resolve();
      }, 300);
    });
  },
};
