import { User } from '../types/User';

let mockUsers: User[] = [
  {
    id: 'user1',
    tenantId: 'tenant1',
    email: 'admin@tenant1.com',
    role: 'Tenant Admin',
    permissions: ['manage_assets', 'manage_filters'],
  },
  {
    id: 'user2',
    tenantId: 'tenant1',
    email: 'editor@tenant1.com',
    role: 'Editor',
    permissions: ['edit_designs'],
  },
  {
    id: 'user3',
    tenantId: 'tenant2',
    email: 'viewer@tenant2.com',
    role: 'Viewer',
    permissions: ['view_analytics'],
  },
  {
    id: 'user4',
    tenantId: 'super',
    email: 'superadmin@example.com',
    role: 'Super Admin',
    permissions: ['manage_tenants', 'manage_users'],
  },
];

export const userService = {
  getUsers: async (): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockUsers]);
      }, 300);
    });
  },

  addUser: async (data: Omit<User, 'id'>): Promise<User> => {
    return new Promise((resolve) => {
      const newUser: User = {
        id: 'user' + (mockUsers.length + 1),
        ...data,
      };
      mockUsers.push(newUser);
      setTimeout(() => {
        resolve(newUser);
      }, 300);
    });
  },

  updateUser: async (id: string, data: Partial<Omit<User, 'id'>>): Promise<User> => {
    return new Promise((resolve, reject) => {
      const userIndex = mockUsers.findIndex(user => user.id === id);
      if (userIndex === -1) {
        return reject(new Error('User not found'));
      }
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
      setTimeout(() => {
        resolve(mockUsers[userIndex]);
      }, 300);
    });
  },

  deleteUser: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const initialLength = mockUsers.length;
      mockUsers = mockUsers.filter(user => user.id !== id);
      if (mockUsers.length === initialLength) {
        return reject(new Error('User not found'));
      }
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },
};
