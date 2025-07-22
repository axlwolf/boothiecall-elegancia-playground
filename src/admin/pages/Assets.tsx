import React, { useEffect, useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { usePersistenceContext } from '../providers/PersistenceProvider';
import { AdminAsset } from '@/types/persistence';
import { Asset } from '../types/Asset';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UploadAssetDialog } from '../components/UploadAssetDialog';
import { EditAssetDialog } from '../components/EditAssetDialog';
import { DeleteAssetDialog } from '../components/DeleteAssetDialog';

const Assets: React.FC = () => {
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AdminAsset | null>(null);

  // Use persistence context
  const { 
    getAllEntities, 
    saveEntity, 
    deleteEntity, 
    loading, 
    errors 
  } = usePersistenceContext();

  const fetchAssets = useCallback(async () => {
    try {
      const fetchedAssets = await getAllEntities<AdminAsset>('assets');
      setAssets(fetchedAssets);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  }, [getAllEntities]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleUpload = async (file: File, type: AdminAsset['type']) => {
    try {
      const newAsset: AdminAsset = {
        id: crypto.randomUUID(),
        name: file.name,
        type,
        url: URL.createObjectURL(file),
        thumbnailUrl: URL.createObjectURL(file),
        metadata: {
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          size: file.size
        },
        tenantId: 'default',
        tags: [],
        isActive: true
      };
      
      const success = await saveEntity('assets', newAsset);
      if (success) {
        await fetchAssets();
      }
    } catch (error) {
      console.error('Failed to upload asset:', error);
    }
  };

  const handleUpdate = (id: string, data: Partial<Pick<Asset, 'fileName' | 'type'>>) => {
    assetService.updateAsset(id, data).then(() => fetchAssets());
  };

  const handleDelete = (id: string) => {
    assetService.deleteAsset(id).then(() => fetchAssets());
  };

  const columns: ColumnDef<Asset>[] = [
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
              <DropdownMenuItem onClick={() => {
                setSelectedAsset(asset);
                setEditDialogOpen(true);
              }}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedAsset(asset);
                setDeleteDialogOpen(true);
              }} className="text-red-500">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
      <UploadAssetDialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen} onUpload={handleUpload} />
      <EditAssetDialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen} asset={selectedAsset} onUpdate={handleUpdate} />
      <DeleteAssetDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen} asset={selectedAsset} onDelete={handleDelete} />
    </div>
  );
};

export default Assets;
