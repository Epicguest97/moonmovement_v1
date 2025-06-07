
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Check, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface PostModerationActionsProps {
  postId: string;
  subreddit: string;
  canManagePosts: boolean;
  onPostRemoved?: () => void;
}

const PostModerationActions = ({ postId, subreddit, canManagePosts, onPostRemoved }: PostModerationActionsProps) => {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removalReason, setRemovalReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!canManagePosts) return null;

  const removePost = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://moonmovement.onrender.com/api/moderation/${subreddit}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: removalReason })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Post removed successfully"
        });
        setRemoveDialogOpen(false);
        setRemovalReason('');
        onPostRemoved?.();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approvePost = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://moonmovement.onrender.com/api/moderation/${subreddit}/posts/${postId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Post approved successfully"
        });
        onPostRemoved?.();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to approve post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-red-900/20 border border-red-700 rounded">
      <AlertTriangle size={16} className="text-red-400" />
      <span className="text-red-400 text-sm font-medium">Moderation Actions</span>
      
      <Button
        variant="destructive"
        size="sm"
        onClick={approvePost}
        disabled={loading}
      >
        <Check size={16} className="mr-1" />
        Approve
      </Button>

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 size={16} className="mr-1" />
            Remove
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-sidebar border-sidebar-border">
          <DialogHeader>
            <DialogTitle className="text-sidebar-foreground">Remove Post</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will remove the post from the subreddit. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason" className="text-sidebar-foreground">Removal Reason</Label>
              <Input
                id="reason"
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder="Enter removal reason"
                className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={removePost}
              disabled={loading || !removalReason.trim()}
            >
              Remove Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostModerationActions;
