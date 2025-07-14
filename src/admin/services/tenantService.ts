import { Tenant } from '../types/Tenant';

let mockTenants: Tenant[] = [
  {
    id: 'tenant1',
    name: 'Acme Corp',
    domain: 'acme.com',
    settings: { theme: 'dark', logo: 'acme-logo.png' },
  },
  {
    id: 'tenant2',
    name: 'Globex Inc.',
    domain: 'globex.com',
    settings: { theme: 'light', logo: 'globex-logo.png' },
  },
];

export const tenantService = {
  getTenants: async (): Promise<Tenant[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockTenants]);
      }, 300);
    });
  },

  addTenant: async (data: Omit<Tenant, 'id'>): Promise<Tenant> => {
    return new Promise((resolve) => {
      const newTenant: Tenant = {
        id: 'tenant' + (mockTenants.length + 1),
        ...data,
      };
      mockTenants.push(newTenant);
      setTimeout(() => {
        resolve(newTenant);
      }, 300);
    });
  },

  updateTenant: async (id: string, data: Partial<Omit<Tenant, 'id'>>): Promise<Tenant> => {
    return new Promise((resolve, reject) => {
      const tenantIndex = mockTenants.findIndex(tenant => tenant.id === id);
      if (tenantIndex === -1) {
        return reject(new Error('Tenant not found'));
      }
      mockTenants[tenantIndex] = { ...mockTenants[tenantIndex], ...data };
      setTimeout(() => {
        resolve(mockTenants[tenantIndex]);
      }, 300);
    });
  },

  deleteTenant: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const initialLength = mockTenants.length;
      mockTenants = mockTenants.filter(tenant => tenant.id !== id);
      if (mockTenants.length === initialLength) {
        return reject(new Error('Tenant not found'));
      }
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },
};
