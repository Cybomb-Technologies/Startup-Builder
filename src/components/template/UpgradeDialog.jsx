import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const UpgradeDialog = ({ open, onOpenChange, user, navigate }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade Required</DialogTitle>
          <DialogDescription>
            {user ? "Your current plan doesn't include access to this template." : "Please log in or sign up to access templates."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="mb-6">
            {user ? "Upgrade your plan to unlock this template and many more powerful features." : "Join StartupDocs Builder to start creating and downloading documents."}
          </p>
          <Button onClick={() => navigate(user ? '/pricing' : '/login')} className="bg-gradient-to-r from-blue-600 to-indigo-600">
            {user ? 'Upgrade to Pro' : 'Login or Sign Up'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeDialog;