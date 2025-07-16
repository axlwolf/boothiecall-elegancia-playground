import { Design } from '../types/Design';

let mockDesigns: Design[] = [
  {
    id: '1',
    name: 'Classic Elegance',
    layoutType: '4-shot',
    frameMappings: '[{"x":10,"y":10},{"x":10,"y":220},{"x":10,"y":430},{"x":10,"y":640}]',
    isActive: true,
  },
  {
    id: '2',
    name: 'Modern Minimalist',
    layoutType: '3-shot',
    frameMappings: '[{"x":20,"y":20},{"x":20,"y":300},{"x":20,"y":580}]',
    isActive: true,
  },
  {
    id: '3',
    name: 'Funky Fresh',
    layoutType: '6-shot',
    frameMappings: '[{"x":5,"y":5},{"x":205,"y":5},{"x":5,"y":205},{"x":205,"y":205},{"x":5,"y":405},{"x":205,"y":405}]',
    isActive: false,
  },
  {
    id: '4',
    name: 'Single Shot Portrait',
    layoutType: '1-shot',
    frameMappings: '[{"x":50,"y":50,"width":700,"height":900}]',
    isActive: true,
  },
  {
    id: '5',
    name: 'Retro Strip',
    layoutType: '4-shot',
    frameMappings: '[{"x":30,"y":30,"width":150,"height":150},{"x":30,"y":200,"width":150,"height":150},{"x":30,"y":370,"width":150,"height":150},{"x":30,"y":540,"width":150,"height":150}]',
    isActive: true,
  },
  {
    id: '6',
    name: 'Grid Layout',
    layoutType: '6-shot',
    frameMappings: '[{"x":10,"y":10,"width":200,"height":200},{"x":220,"y":10,"width":200,"height":200},{"x":10,"y":220,"width":200,"height":200},{"x":220,"y":220,"width":200,"height":200},{"x":10,"y":430,"width":200,"height":200},{"x":220,"y":430,"width":200,"height":200}]',
    isActive: false,
  },
];

export const designService = {
  getDesigns: async (): Promise<Design[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockDesigns]);
      }, 300);
    });
  },

  addDesign: async (data: Omit<Design, 'id'>): Promise<Design> => {
    return new Promise((resolve) => {
      const newDesign: Design = {
        id: (mockDesigns.length + 1).toString(),
        ...data,
      };
      mockDesigns.push(newDesign);
      setTimeout(() => {
        resolve(newDesign);
      }, 300);
    });
  },

  updateDesign: async (id: string, data: Partial<Omit<Design, 'id'>>): Promise<Design> => {
    return new Promise((resolve, reject) => {
      const designIndex = mockDesigns.findIndex(design => design.id === id);
      if (designIndex === -1) {
        return reject(new Error('Design not found'));
      }
      mockDesigns[designIndex] = { ...mockDesigns[designIndex], ...data };
      setTimeout(() => {
        resolve(mockDesigns[designIndex]);
      }, 300);
    });
  },

  deleteDesign: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const initialLength = mockDesigns.length;
      mockDesigns = mockDesigns.filter(design => design.id !== id);
      if (mockDesigns.length === initialLength) {
        return reject(new Error('Design not found'));
      }
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },
};
