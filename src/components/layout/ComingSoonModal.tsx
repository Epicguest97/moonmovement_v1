
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-sidebar border-sidebar-border">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-medium text-foreground">Coming Soon!</DialogTitle>
          <DialogDescription className="text-center pt-2 text-muted-foreground">
            Our mobile app is under construction. We are working hard to bring it to you soon.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonModal;
