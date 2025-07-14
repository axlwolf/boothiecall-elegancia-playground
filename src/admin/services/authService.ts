import apiClient from './apiClient';

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    // Assuming the backend returns { token: string, user: any }
    return response.data;
  },

  logout: async () => {
    // Optionally call a logout endpoint on the backend
    // await apiClient.post('/auth/logout');
    // For now, just clear the token locally
    return Promise.resolve();
  },
};
