import apiClient from './apiClient';
import { OutputFormat } from '../types/OutputFormat';

export const outputFormatService = {
  getOutputFormats: async (): Promise<OutputFormat[]> => {
    const response = await apiClient.get('/formats');
    return response.data;
  },

  addOutputFormat: async (data: Omit<OutputFormat, 'id'>): Promise<OutputFormat> => {
    const response = await apiClient.post('/formats', data);
    return response.data;
  },

  updateOutputFormat: async (id: string, data: Partial<Omit<OutputFormat, 'id'>>): Promise<OutputFormat> => {
    const response = await apiClient.put(`/formats/${id}`, data);
    return response.data;
  },

  deleteOutputFormat: async (id: string): Promise<void> => {
    await apiClient.delete(`/formats/${id}`);
  },
};
