import React, { useEffect, useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { designService } from '../services/designService';
import { Design } from '../types/Design';
import { Button } from '@/components/ui/button';
import { getColumns } from './designs/columns';
import { AddDesignDialog } from '../components/AddDesignDialog';
import { EditDesignDialog } from '../components/EditDesignDialog';
import { DeleteDesignDialog } from '../components/DeleteDesignDialog';

const Designs: React.FC = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

  const fetchDesigns = useCallback(() => {
    designService.getDesigns().then(setDesigns);
  }, []);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handleAdd = (data: Omit<Design, 'id'>) => {
    designService.addDesign(data).then(() => fetchDesigns());
  };

  const handleUpdate = (id: string, data: Partial<Omit<Design, 'id'>>) => {
    designService.updateDesign(id, data).then(() => fetchDesigns());
  };

  const handleDelete = (id: string) => {
    designService.deleteDesign(id).then(() => fetchDesigns());
  };

  const openEditDialog = (design: Design) => {
    setSelectedDesign(design);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (design: Design) => {
    setSelectedDesign(design);
    setDeleteDialogOpen(true);
  };

  const columns = getColumns(openEditDialog, openDeleteDialog);

  return (
    <div>
      <PageHeader 
        title="Designs" 
        description="Manage your design templates." 
        actions={
          <Button onClick={() => setAddDialogOpen(true)} className="bg-gold-500 hover:bg-gold-600">
            Add Design
          </Button>
        }
      />
      <DataTable columns={columns} data={designs} />
      <AddDesignDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} onAdd={handleAdd} />
      <EditDesignDialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen} design={selectedDesign} onUpdate={handleUpdate} />
      <DeleteDesignDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen} design={selectedDesign} onDelete={handleDelete} />
    </div>
  );
};

export default Designs;
