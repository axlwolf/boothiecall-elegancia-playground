import React, { useEffect, useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { outputFormatService } from '../services/outputFormatService';
import { OutputFormat } from '../types/OutputFormat';
import { Button } from '@/components/ui/button';
import { getColumns } from './formats/columns';
import { AddOutputFormatDialog } from '../components/AddOutputFormatDialog';
import { EditOutputFormatDialog } from '../components/EditOutputFormatDialog';
import { DeleteOutputFormatDialog } from '../components/DeleteOutputFormatDialog';

const Formats: React.FC = () => {
  const [formats, setFormats] = useState<OutputFormat[]>([]);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat | null>(null);

  const fetchFormats = useCallback(() => {
    outputFormatService.getOutputFormats().then(setFormats);
  }, []);

  useEffect(() => {
    fetchFormats();
  }, [fetchFormats]);

  const handleAdd = (data: Omit<OutputFormat, 'id'>) => {
    outputFormatService.addOutputFormat(data).then(() => fetchFormats());
  };

  const handleUpdate = (id: string, data: Partial<Omit<OutputFormat, 'id'>>) => {
    outputFormatService.updateOutputFormat(id, data).then(() => fetchFormats());
  };

  const handleDelete = (id: string) => {
    outputFormatService.deleteOutputFormat(id).then(() => fetchFormats());
  };

  const openEditDialog = (format: OutputFormat) => {
    setSelectedFormat(format);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (format: OutputFormat) => {
    setSelectedFormat(format);
    setDeleteDialogOpen(true);
  };

  const columns = getColumns(openEditDialog, openDeleteDialog);

  return (
    <div>
      <PageHeader 
        title="Output Formats" 
        description="Manage output file types, quality, and watermarks." 
        actions={
          <Button onClick={() => setAddDialogOpen(true)} className="bg-gold-500 hover:bg-gold-600">
            Add Format
          </Button>
        }
      />
      <DataTable columns={columns} data={formats} />
      <AddOutputFormatDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} onAdd={handleAdd} />
      <EditOutputFormatDialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen} format={selectedFormat} onUpdate={handleUpdate} />
      <DeleteOutputFormatDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen} format={selectedFormat} onDelete={handleDelete} />
    </div>
  );
};

export default Formats;
