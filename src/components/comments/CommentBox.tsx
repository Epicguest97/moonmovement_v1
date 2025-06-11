import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SmileIcon, ArrowUpCircle, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentBoxProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
}

const CommentBox = ({ onSubmit, placeholder = "Add a comment..." }: CommentBoxProps) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get username for avatar
  const username = localStorage.getItem('username') || 'Guest';
  
  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(commentText);
      setCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex gap-2">
      <Avatar className="w-8 h-8">
        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}`} />
        <AvatarFallback className="bg-sidebar-accent">
          <User size={16} className="text-gray-400" />
        </AvatarFallback>
      </Avatar>
      
      <div className="relative flex-1 rounded-lg border border-sidebar-border bg-sidebar">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] resize-none border-0 bg-transparent py-3 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-500"
        />
        
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon"
            type="button"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          >
            <SmileIcon size={18} />
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!commentText.trim() || isSubmitting}
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-full ${commentText.trim() ? 'text-primary hover:text-primary' : 'text-muted-foreground'}`}
          >
            <ArrowUpCircle size={22} className={commentText.trim() ? 'fill-primary' : ''} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentBox;
