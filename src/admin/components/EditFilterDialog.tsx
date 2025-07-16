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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Filter } from '../types/Filter';

interface EditFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: Filter | null;
  onUpdate: (id: string, data: Partial<Omit<Filter, 'id'>>) => void;
}

export const EditFilterDialog: React.FC<EditFilterDialogProps> = ({ open, onOpenChange, filter, onUpdate }) => {
  const [name, setName] = useState('');
  const [cssProperties, setCssProperties] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (filter) {
      setName(filter.name);
      setCssProperties(filter.cssProperties);
      setIsActive(filter.isActive);
    }
  }, [filter]);

  const handleSubmit = () => {
    if (filter) {
      onUpdate(filter.id, { name, cssProperties, isActive });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold-500">Edit Filter</DialogTitle>
          <DialogDescription>Update the filter details.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-700 border-gray-600" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cssProperties">CSS Properties</Label>
            <Textarea id="cssProperties" value={cssProperties} onChange={(e) => setCssProperties(e.target.value)} className="bg-gray-700 border-gray-600" />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="isActive">Active</Label>
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-gold-500 hover:bg-gold-600">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
