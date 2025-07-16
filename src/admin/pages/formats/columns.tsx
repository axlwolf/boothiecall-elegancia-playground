import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { OutputFormat } from '../../types/OutputFormat';

export const getColumns = (openEditDialog: (format: OutputFormat) => void, openDeleteDialog: (format: OutputFormat) => void): ColumnDef<OutputFormat>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'fileType',
    header: 'File Type',
  },
  {
    accessorKey: 'quality',
    header: 'Quality',
  },
  {
    accessorKey: 'watermarkText',
    header: 'Watermark Text',
    cell: ({ row }) => row.original.watermarkText || 'None',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive');
      return <Badge variant={isActive ? 'default' : 'destructive'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const format = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
            <DropdownMenuItem onClick={() => openEditDialog(format)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDeleteDialog(format)} className="text-red-500">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
