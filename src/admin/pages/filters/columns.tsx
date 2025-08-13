import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Filter } from '../../types/Filter';

export const getColumns = (openEditDialog: (filter: Filter) => void, openDeleteDialog: (filter: Filter) => void): ColumnDef<Filter>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'cssProperties',
    header: 'CSS Properties',
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
      const filter = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
            <DropdownMenuItem onClick={() => openEditDialog(filter)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDeleteDialog(filter)} className="text-red-500">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
