import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Post } from './PostCard';

interface PostHeaderProps {
  post: Post;
}

const PostHeader = ({ post }: PostHeaderProps) => {
  const authorName = typeof post.author === 'string' ? post.author : post.author.username;
  
  return (
    <div className="mb-2">
      <Link to={`/post/${post.id}`} className="block">
        <h3 className="text-base font-semibold text-sidebar-foreground hover:text-sidebar-primary">
          {post.title}
        </h3>
      </Link>
      
      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400">
        <Link to={`/r/${post.subreddit}`} className="hover:underline">
          <Badge variant="outline" className="border-sidebar-border text-gray-300 h-5 px-1.5 py-0">
            r/{post.subreddit}
          </Badge>
        </Link>
        
        <span className="flex items-center">
          Posted by{" "}
          <Link to={`/u/${authorName}`} className="hover:underline ml-1">
            u/{authorName}
          </Link>
        </span>
        
        <span className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {post.timestamp}
        </span>
      </div>
    </div>
  );
};

export default PostHeader;