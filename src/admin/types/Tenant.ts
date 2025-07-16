export type Tenant = {
  id: string;
  name: string;
  domain: string;
  settings: Record<string, any>;
};
