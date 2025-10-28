import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const PreviewDialog = ({ template, onClose }) => {
  if (!template) return null;

  return (
    <Dialog open={!!template} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{template.title || template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">File preview would be shown here.</p>
          </div>
          <div className="mt-4 space-y-2">
            <p><strong>Category:</strong> {template.category}</p>
            <p><strong>Subcategory:</strong> {template.subcategory}</p>
            <p><strong>Format:</strong> {template.format}</p>
            <p><strong>Access:</strong> {template.access}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;