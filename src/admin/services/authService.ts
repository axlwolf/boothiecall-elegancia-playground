interface LoginResponse {
  token: string;
  user: {
    name: string;
    email: string;
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
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

  logout: async (): Promise<void> => {
    return Promise.resolve();
  },
};
