import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Tenant } from '../types/Tenant';

interface AddTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: Omit<Tenant, 'id'>) => void;
}

export const AddTenantDialog: React.FC<AddTenantDialogProps> = ({ open, onOpenChange, onAdd }) => {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [settings, setSettings] = useState('{}');

  const handleSubmit = () => {
    try {
      onAdd({ name, domain, settings: JSON.parse(settings) });
      onOpenChange(false);
    } catch (e) {
      console.error("Invalid JSON for settings", e);
      alert("Invalid JSON for settings");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold-500">Add Tenant</DialogTitle>
          <DialogDescription>Create a new tenant account.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-700 border-gray-600" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="domain">Domain</Label>
            <Input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} className="bg-gray-700 border-gray-600" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings">Settings (JSON)</Label>
            <Textarea id="settings" value={settings} onChange={(e) => setSettings(e.target.value)} className="bg-gray-700 border-gray-600" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-gold-500 hover:bg-gold-600">Add Tenant</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
