import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '../types/User';
import { Tenant } from '../types/Tenant';
import { tenantService } from '../services/tenantService';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: Omit<User, 'id'>) => void;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({ open, onOpenChange, onAdd }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('Viewer');
  const [tenantId, setTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    tenantService.getTenants().then(setTenants);
  }, []);

  const handleSubmit = () => {
    onAdd({ email, role, tenantId, permissions: [] }); // Permissions can be managed separately later
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold-500">Add User</DialogTitle>
          <DialogDescription>Create a new user account.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-700 border-gray-600" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as User['role'])}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Tenant Admin">Tenant Admin</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenantId">Tenant</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select a tenant" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {Array.isArray(tenants) && tenants.map(tenant => (
                  <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-gold-500 hover:bg-gold-600">Add User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
