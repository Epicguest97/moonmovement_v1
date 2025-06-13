
import React, { useState, useEffect } from 'react';
import { X, Image, Video, Link, List, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const [mainContent, setMainContent] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle clicking outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-sidebar border border-sidebar-border rounded-xl w-full max-w-lg shadow-2xl transform transition-all duration-300 ease-out animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Create a Post</h2>
            <span className="text-green-500">✅</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-4">
          {/* Main Input */}
          <div>
            <Textarea
              placeholder="What would you like to share?"
              value={mainContent}
              onChange={(e) => setMainContent(e.target.value)}
              className="min-h-[100px] resize-none border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Additional Details */}
          <div>
            <Textarea
              placeholder="Add more details... (optional)"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="min-h-[80px] resize-none border-0 bg-sidebar-accent/30 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
              >
                <Image className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
              >
                <Video className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
              >
                <Link className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
              >
                <List className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>

            {/* Next Button */}
            <Button
              disabled={!mainContent.trim()}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                mainContent.trim()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Next →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
