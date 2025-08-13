import React, { useEffect, useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { tenantService } from '../services/tenantService';
import { Tenant } from '../types/Tenant';
import { Button } from '@/components/ui/button';
import { getColumns } from './tenants/columns';
import { AddTenantDialog } from '../components/AddTenantDialog';
import { EditTenantDialog } from '../components/EditTenantDialog';
import { DeleteTenantDialog } from '../components/DeleteTenantDialog';

const Tenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const fetchTenants = useCallback(() => {
    tenantService.getTenants().then(setTenants);
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleAdd = (data: Omit<Tenant, 'id'>) => {
    tenantService.addTenant(data).then(() => fetchTenants());
  };

  const handleUpdate = (id: string, data: Partial<Omit<Tenant, 'id'>>) => {
    tenantService.updateTenant(id, data).then(() => fetchTenants());
  };

  const handleDelete = (id: string) => {
    tenantService.deleteTenant(id).then(() => fetchTenants());
  };

  const openEditDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDeleteDialogOpen(true);
  };

  const columns = getColumns(openEditDialog, openDeleteDialog);

  return (
    <div>
      <PageHeader 
        title="Tenants" 
        description="Manage client organizations and their settings." 
        actions={
          <Button onClick={() => setAddDialogOpen(true)} className="bg-gold-500 hover:bg-gold-600">
            Add Tenant
          </Button>
        }
      />
      <DataTable columns={columns} data={tenants} />
      <AddTenantDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} onAdd={handleAdd} />
      <EditTenantDialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen} tenant={selectedTenant} onUpdate={handleUpdate} />
      <DeleteTenantDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen} tenant={selectedTenant} onDelete={handleDelete} />
    </div>
  );
};

export default Tenants;
