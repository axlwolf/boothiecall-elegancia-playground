import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/admin', // Base URL for admin API endpoints
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling (e.g., 401, 403)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Handle unauthorized/forbidden errors, e.g., redirect to login
      console.error('Authentication error', error.response.status);
      // Optionally, redirect to login page
      // window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
