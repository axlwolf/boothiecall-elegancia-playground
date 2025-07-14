import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import PageHeader from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { assetService } from '../services/assetService';
import { Asset } from '../types/Asset';

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
];

const Assets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    assetService.getAssets().then(setAssets);
  }, []);

  return (
    <div>
      <PageHeader title="Assets" description="Manage your logos, images, and design templates." />
      <DataTable columns={columns} data={assets} />
    </div>
  );
};

export default Assets;
