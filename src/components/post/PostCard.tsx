
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostFooter from './PostFooter';
import EditPostDialog from './EditPostDialog';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    id?: number;
    email?: string;
    password?: string;
  };
  subreddit: string;
  voteScore: number;
  commentCount: number;
  timestamp: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  poll?: {
    id: number;
    question: string;
    options: Array<{
      id: number;
      text: string;
      votes: any[];
    }>;
    expiresAt?: string;
  };
}

interface PostCardProps {
  post: Post;
  isFirst?: boolean;
  isLast?: boolean;
  onPostUpdate?: () => void;
}

export const PostCard = ({ post, isFirst = true, isLast = false, onPostUpdate }: PostCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [postData, setPostData] = useState(post);
  
  const isMainFeed = location.pathname === '/';
  const hideTextContent = isMainFeed && !!post.imageUrl;
  const hasOnlyText = !post.imageUrl && !post.linkUrl;

  const handleEditPost = async (title: string, content: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('You must be logged in to edit posts');
    }

    try {
      const response = await fetch(`https://moonmovement.onrender.com/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      const updatedPost = await response.json();
      setPostData({ ...postData, title, content });
      
      if (onPostUpdate) {
        onPostUpdate();
      }
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  return (
    <>
      <Card className={cn(
        "post-card bg-sidebar border-sidebar-border border-t-0 first:border-t",
        isFirst ? "rounded-t-lg" : "rounded-t-none",
        isLast ? "rounded-b-lg" : "border-b-0 rounded-b-none",
        "divide-y divide-sidebar-border overflow-hidden"
      )}>
        <div className="p-0 pt-2 px-3 relative">
          <PostHeader post={postData} />
          
          <PostContent 
            post={postData} 
            isDetailView={false}
            hideTextContent={hideTextContent} 
          />
          
          <div className="flex items-center justify-between text-xs text-gray-400 py-2">
            <PostFooter 
              commentCount={postData.commentCount || 0} 
              postId={postData.id}
              subreddit={postData.subreddit}
              authorUsername={typeof postData.author === 'string' ? postData.author : postData.author.username}
              onEditClick={() => setIsEditDialogOpen(true)}
            />
          </div>
        </div>
      </Card>

      <EditPostDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleEditPost}
        initialTitle={postData.title}
        initialContent={postData.content}
      />
    </>
  );
};

export default PostCard;
