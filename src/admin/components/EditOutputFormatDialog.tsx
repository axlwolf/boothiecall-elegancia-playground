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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OutputFormat } from '../types/OutputFormat';

interface EditOutputFormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  format: OutputFormat | null;
  onUpdate: (id: string, data: Partial<Omit<OutputFormat, 'id'>>) => void;
}

export const EditOutputFormatDialog: React.FC<EditOutputFormatDialogProps> = ({ open, onOpenChange, format, onUpdate }) => {
  const [name, setName] = useState('');
  const [fileType, setFileType] = useState<OutputFormat['fileType']>('PNG');
  const [quality, setQuality] = useState(90);
  const [watermarkText, setWatermarkText] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (format) {
      setName(format.name);
      setFileType(format.fileType);
      setQuality(format.quality);
      setWatermarkText(format.watermarkText || '');
      setIsActive(format.isActive);
    }
  }, [format]);

  const handleSubmit = () => {
    if (format) {
      onUpdate(format.id, { name, fileType, quality, watermarkText, isActive });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold-500">Edit Output Format</DialogTitle>
          <DialogDescription>Update the output format configuration.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-700 border-gray-600" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fileType">File Type</Label>
            <Select value={fileType} onValueChange={(value) => setFileType(value as OutputFormat['fileType'])}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select a file type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="PNG">PNG</SelectItem>
                <SelectItem value="GIF">GIF</SelectItem>
                <SelectItem value="Print">Print</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quality">Quality (0-100)</Label>
            <Input id="quality" type="number" value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} className="bg-gray-700 border-gray-600" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="watermarkText">Watermark Text (Optional)</Label>
            <Input id="watermarkText" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="bg-gray-700 border-gray-600" />
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
