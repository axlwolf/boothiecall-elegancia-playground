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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Asset } from '../types/Asset';

interface UploadAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, type: Asset['type']) => void;
}

export const UploadAssetDialog: React.FC<UploadAssetDialogProps> = ({ open, onOpenChange, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<Asset['type']>('Image');

  const handleSubmit = () => {
    if (file) {
      onUpload(file, type);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold-500">Upload Asset</DialogTitle>
          <DialogDescription>Select a file and choose the asset type.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-gray-700 border-gray-600" />
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
          <Button onClick={handleSubmit} className="bg-gold-500 hover:bg-gold-600">Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
