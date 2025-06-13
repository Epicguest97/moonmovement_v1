import React from 'react';
import { Card } from '@/components/ui/card';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostFooter from './PostFooter';
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
}

export const PostCard = ({ post, isFirst = true, isLast = false }: PostCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isMainFeed = location.pathname === '/';
  const hideTextContent = isMainFeed && !!post.imageUrl;
  const hasOnlyText = !post.imageUrl && !post.linkUrl;

  return (
    <Card className={cn(
      "post-card bg-sidebar border-sidebar-border border-t-0 first:border-t",
      isFirst ? "rounded-t-lg" : "rounded-t-none",
      isLast ? "rounded-b-lg" : "border-b-0 rounded-b-none",
      "divide-y divide-sidebar-border overflow-hidden"
    )}>
      <div className="p-0 pt-2 px-3 relative">
        <PostHeader post={post} />
        
        <PostContent 
          post={post} 
          isDetailView={false}
          hideTextContent={hideTextContent} 
        />
        
        <div className="flex items-center justify-between text-xs text-gray-400 py-2">
          <PostFooter 
            commentCount={post.commentCount || 0} 
            postId={post.id}
            subreddit={post.subreddit}
          />
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
