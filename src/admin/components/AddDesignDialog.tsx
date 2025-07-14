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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Design } from '../types/Design';

interface AddDesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: Omit<Design, 'id'>) => void;
}

export const AddDesignDialog: React.FC<AddDesignDialogProps> = ({ open, onOpenChange, onAdd }) => {
  const [name, setName] = useState('');
  const [layoutType, setLayoutType] = useState<Design['layoutType']>('4-shot');
  const [frameMappings, setFrameMappings] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = () => {
    onAdd({ name, layoutType, frameMappings, isActive });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold-500">Add Design</DialogTitle>
          <DialogDescription>Create a new design template.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-700 border-gray-600" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="layoutType">Layout Type</Label>
            <Select value={layoutType} onValueChange={(value) => setLayoutType(value as Design['layoutType'])}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select a layout" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="1-shot">1-shot</SelectItem>
                <SelectItem value="3-shot">3-shot</SelectItem>
                <SelectItem value="4-shot">4-shot</SelectItem>
                <SelectItem value="6-shot">6-shot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frameMappings">Frame Mappings (JSON)</Label>
            <Textarea 
              id="frameMappings" 
              value={frameMappings} 
              onChange={(e) => setFrameMappings(e.target.value)} 
              className="bg-gray-700 border-gray-600"
              placeholder={`e.g., [{"x":10,"y":10,"width":100,"height":100}, {"x":120,"y":10,"width":100,"height":100}]`}
            />
            <p className="text-xs text-gray-400">JSON array of objects with 'x', 'y', 'width', 'height' for each frame. Number of objects should match layout type.</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="isActive">Active</Label>
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-gold-500 hover:bg-gold-600">Add Design</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
