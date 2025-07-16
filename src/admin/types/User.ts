export type User = {
  id: string;
  tenantId: string;
  email: string;
  role: 'Super Admin' | 'Tenant Admin' | 'Editor' | 'Viewer';
  permissions: string[];
};
