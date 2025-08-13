import React, { useEffect, useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { userService } from '../services/userService';
import { User } from '../types/User';
import { Button } from '@/components/ui/button';
import { getColumns } from './users/columns';
import { AddUserDialog } from '../components/AddUserDialog';
import { EditUserDialog } from '../components/EditUserDialog';
import { DeleteUserDialog } from '../components/DeleteUserDialog';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(() => {
    userService.getUsers().then(setUsers);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = (data: Omit<User, 'id'>) => {
    userService.addUser(data).then(() => fetchUsers());
  };

  const handleUpdate = (id: string, data: Partial<Omit<User, 'id'>>) => {
    userService.updateUser(id, data).then(() => fetchUsers());
  };

  const handleDelete = (id: string) => {
    userService.deleteUser(id).then(() => fetchUsers());
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const columns = getColumns(openEditDialog, openDeleteDialog);

  return (
    <div>
      <PageHeader 
        title="Users" 
        description="Manage user accounts and permissions." 
        actions={
          <Button onClick={() => setAddDialogOpen(true)} className="bg-gold-500 hover:bg-gold-600">
            Add User
          </Button>
        }
      />
      <DataTable columns={columns} data={users} />
      <AddUserDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} onAdd={handleAdd} />
      <EditUserDialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen} user={selectedUser} onUpdate={handleUpdate} />
      <DeleteUserDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen} user={selectedUser} onDelete={handleDelete} />
    </div>
  );
};

export default Users;
