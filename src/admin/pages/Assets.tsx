import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { assetService } from '../services/assetService';
import { Asset } from '../types/Asset';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UploadAssetDialog } from '../components/UploadAssetDialog';

export const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: 'fileName',
    header: 'File Name',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return date.toLocaleDateString();
    },
  },
  {
    id: 'preview',
    header: 'Preview',
    cell: ({ row }) => {
      const asset = row.original;
      return <img src={asset.url} alt={asset.fileName} className="h-10 w-10 object-cover rounded-md" />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const asset = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
            <DropdownMenuItem onClick={() => console.log('Edit', asset.id)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Delete', asset.id)} className="text-red-500">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const Assets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    assetService.getAssets().then(setAssets);
  }, []);

  return (
    <div>
      <PageHeader 
        title="Assets" 
        description="Manage your logos, images, and design templates." 
        actions={
          <Button onClick={() => setUploadDialogOpen(true)} className="bg-gold-500 hover:bg-gold-600">
            Upload Asset
          </Button>
        }
      />
      <DataTable columns={columns} data={assets} />
      <UploadAssetDialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen} />
    </div>
  );
};

export default Assets;
