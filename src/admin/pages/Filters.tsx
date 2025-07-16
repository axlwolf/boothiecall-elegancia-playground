import React, { useEffect, useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { filterService } from '../services/filterService';
import { Filter } from '../types/Filter';
import { Button } from '@/components/ui/button';
import { getColumns } from './filters/columns';
import { AddFilterDialog } from '../components/AddFilterDialog';
import { EditFilterDialog } from '../components/EditFilterDialog';
import { DeleteFilterDialog } from '../components/DeleteFilterDialog';

const Filters: React.FC = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null);

  const fetchFilters = useCallback(() => {
    filterService.getFilters().then(setFilters);
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const handleAdd = (data: Omit<Filter, 'id'>) => {
    filterService.addFilter(data).then(() => fetchFilters());
  };

  const handleUpdate = (id: string, data: Partial<Omit<Filter, 'id'>>) => {
    filterService.updateFilter(id, data).then(() => fetchFilters());
  };

  const handleDelete = (id: string) => {
    filterService.deleteFilter(id).then(() => fetchFilters());
  };

  const openEditDialog = (filter: Filter) => {
    setSelectedFilter(filter);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (filter: Filter) => {
    setSelectedFilter(filter);
    setDeleteDialogOpen(true);
  };

  const columns = getColumns(openEditDialog, openDeleteDialog);

  return (
    <div>
      <PageHeader 
        title="Filters" 
        description="Manage your photo filters." 
        actions={
          <Button onClick={() => setAddDialogOpen(true)} className="bg-gold-500 hover:bg-gold-600">
            Add Filter
          </Button>
        }
      />
      <DataTable columns={columns} data={filters} />
      <AddFilterDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} onAdd={handleAdd} />
      <EditFilterDialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen} filter={selectedFilter} onUpdate={handleUpdate} />
      <DeleteFilterDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen} filter={selectedFilter} onDelete={handleDelete} />
    </div>
  );
};

export default Filters;
