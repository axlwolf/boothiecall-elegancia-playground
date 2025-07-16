export const authService = {
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@example.com' && password === 'password') {
          resolve({
            token: 'mock-jwt-token',
            user: { name: 'Admin User', email: 'admin@example.com' },
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  },

  logout: async () => {
    // For now, just clear the token locally
    return Promise.resolve();
  },
};
