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
import { Asset } from '../types/Asset';

interface EditAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onUpdate: (id: string, data: Partial<Pick<Asset, 'fileName' | 'type'>>) => void;
}

export const EditAssetDialog: React.FC<EditAssetDialogProps> = ({ open, onOpenChange, asset, onUpdate }) => {
  const [fileName, setFileName] = useState('');
  const [type, setType] = useState<Asset['type']>('Image');

  useEffect(() => {
    if (asset) {
      setFileName(asset.fileName);
      setType(asset.type);
    }
  }, [asset]);

  const handleSubmit = () => {
    if (asset) {
      onUpdate(asset.id, { fileName, type });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold-500">Edit Asset</DialogTitle>
          <DialogDescription>Update the asset details.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input id="fileName" value={fileName} onChange={(e) => setFileName(e.target.value)} className="bg-gray-700 border-gray-600" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Asset Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as Asset['type'])}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="Image">Image</SelectItem>
                <SelectItem value="Logo">Logo</SelectItem>
                <SelectItem value="Design Template">Design Template</SelectItem>
              </SelectContent>
            </Select>
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
