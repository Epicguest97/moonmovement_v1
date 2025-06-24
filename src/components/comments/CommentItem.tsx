
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CommentType } from './CommentList';
import { MessageSquare, Share, MoreHorizontal, ArrowUp, ArrowDown, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import EditCommentDialog from './EditCommentDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface CommentProps {
  comment: CommentType;
  depth?: number;
  postId: string;
  onReplySubmit: (parentId: string, content: string) => Promise<void>;
  onCommentUpdate?: () => void;
}

const Comment = ({ comment, depth = 0, postId, onReplySubmit, onCommentUpdate }: CommentProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [voteScore, setVoteScore] = useState(comment.voteScore);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [commentContent, setCommentContent] = useState(comment.content);
  const maxDepth = 5;

  // Check if current user is the author
  const currentUsername = localStorage.getItem('username');
  const isAuthor = currentUsername === comment.author;

  const handleVote = (direction: 'up' | 'down') => {
    if (voteStatus === direction) {
      // Remove vote
      setVoteStatus(null);
      setVoteScore(direction === 'up' ? voteScore - 1 : voteScore + 1);
    } else {
      // Change vote or add new vote
      const scoreDelta = voteStatus === null 
        ? (direction === 'up' ? 1 : -1) 
        : (direction === 'up' ? 2 : -2);
      setVoteStatus(direction);
      setVoteScore(voteScore + scoreDelta);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim() || isSubmitting) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to reply');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Submitting reply to comment ID:', comment.id);
      console.log('Reply text:', replyText);
      
      await onReplySubmit(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    } catch (error) {
      console.error('Failed to submit reply:', error);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (newContent: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('You must be logged in to edit comments');
    }

    try {
      const response = await fetch(`https://moonmovement.onrender.com/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newContent })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update comment');
      }

      setCommentContent(newContent);
      if (onCommentUpdate) {
        onCommentUpdate();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  };

  // Format score for display
  const formatScore = (score: number): string => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  };

  return (
    <div 
      className="comment mt-2 pt-2"
      style={{ marginLeft: depth > 0 ? '16px' : '0' }}
    >
      <div className={`pl-2 border-l-2 ${depth % maxDepth === 0 ? 'border-primary' : 
                      depth % maxDepth === 1 ? 'border-blue-500' : 
                      depth % maxDepth === 2 ? 'border-green-500' : 
                      depth % maxDepth === 3 ? 'border-yellow-500' : 
                      'border-purple-500'}`}>
        <div className="flex items-center text-xs text-muted-foreground mb-1">
          <Link to={`/u/${comment.author}`} className="font-medium text-foreground hover:underline mr-1">
            u/{comment.author}
          </Link>
          <span className="mx-1">•</span>
          <span>{comment.timestamp}</span>
          {isAuthor && (
            <>
              <span className="mx-1">•</span>
              <span className="text-primary text-xs">you</span>
            </>
          )}
        </div>
        
        <div className="text-sm mb-2 text-foreground">{commentContent}</div>
        
        <div className="flex items-center text-xs text-muted-foreground">
          <div className="flex items-center mr-2">
            <button 
              className={cn(
                "vote-button flex items-center justify-center w-6 h-6 rounded-sm",
                voteStatus === 'up' ? "text-sidebar-primary" : "text-gray-400 hover:text-gray-200"
              )}
              onClick={() => handleVote('up')}
              aria-label="Upvote"
            >
              <ArrowUp size={14} />
            </button>
            
            <span className={cn(
              "font-medium text-xs px-1",
              voteStatus === 'up' ? "text-sidebar-primary" : 
              voteStatus === 'down' ? "text-blue-600" : "text-gray-200"
            )}>
              {formatScore(voteScore)}
            </span>
            
            <button 
              className={cn(
                "vote-button flex items-center justify-center w-6 h-6 rounded-sm",
                voteStatus === 'down' ? "text-blue-600" : "text-gray-400 hover:text-gray-200"
              )}
              onClick={() => handleVote('down')}
              aria-label="Downvote"
            >
              <ArrowDown size={14} />
            </button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-xs text-muted-foreground p-1 h-auto hover:text-primary"
            onClick={() => setIsReplying(!isReplying)}
          >
            <MessageSquare size={14} className="mr-1" />
            <span>Reply</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-xs text-muted-foreground ml-1 p-1 h-auto hover:text-primary"
          >
            <Share size={14} className="mr-1" />
            <span>Share</span>
          </Button>

          {isAuthor && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-xs text-muted-foreground ml-1 p-1 h-auto hover:text-primary"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit size={14} className="mr-1" />
              <span>Edit</span>
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-xs text-muted-foreground ml-1 p-1 h-auto hover:text-primary"
              >
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-card border-border">
              <DropdownMenuItem className="text-foreground hover:bg-accent">Save</DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">Report</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="text-foreground hover:bg-accent">Block User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {isReplying && (
          <div className="mt-2 mb-4">
            <textarea 
              className="w-full p-2 border border-border rounded resize-y min-h-[100px] bg-background text-foreground placeholder:text-muted-foreground"
              placeholder="What are your thoughts?"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex justify-end mt-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2 text-foreground hover:bg-accent"
                onClick={() => {
                  setIsReplying(false);
                  setReplyText('');
                }}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleReplySubmit}
                disabled={!replyText.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Reply'}
              </Button>
            </div>
          </div>
        )}
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => (
              <Comment 
                key={reply.id} 
                comment={reply} 
                depth={depth + 1} 
                postId={postId}
                onReplySubmit={onReplySubmit}
                onCommentUpdate={onCommentUpdate}
              />
            ))}
          </div>
        )}
      </div>

      <EditCommentDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleEditComment}
        initialContent={commentContent}
      />
    </div>
  );
};

export default Comment;
