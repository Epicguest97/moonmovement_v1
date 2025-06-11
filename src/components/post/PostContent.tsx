import React, { useState } from 'react';
import { Post } from './PostCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostContentProps {
  post: Post;
  isCompact?: boolean;
  isDetailView?: boolean;
}

const PostContent = ({ post, isCompact = false, isDetailView = false }: PostContentProps) => {
  const [isExpanded, setIsExpanded] = useState(isDetailView);
  const shouldTruncate = post.content?.length > 300 && !isExpanded && !isDetailView;
  
  const renderImage = () => {
    if (post.imageUrl) {
      return (
        <div className={cn(
          "mt-2 mb-4",
          isCompact && !isDetailView ? "max-h-32 overflow-hidden" : ""
        )}>
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="max-w-full rounded-md" 
          />
        </div>
      );
    }
    return null;
  };
  
  const renderTextContent = () => {
    if (post.content) {
      const content = shouldTruncate
        ? `${post.content.substring(0, 300)}...`
        : post.content;
        
      return (
        <div className="mt-2 text-sm">
          <p className="whitespace-pre-line">{content}</p>
          
          {shouldTruncate && (
            <Button 
              variant="link" 
              className="text-sidebar-primary p-0 h-auto font-medium mt-1"
              onClick={() => setIsExpanded(true)}
            >
              Read more
            </Button>
          )}
        </div>
      );
    }
    return null;
  };
  
  const renderLinkContent = () => {
    if (post.linkUrl) {
      return (
        <div className="mt-2 mb-2">
          <a 
            href={post.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline break-all"
          >
            {post.linkUrl}
          </a>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      isCompact && !isDetailView ? "max-h-96 overflow-hidden" : "",
      "relative"
    )}>
      {renderImage()}
      {renderTextContent()}
      {renderLinkContent()}
      
      {!isDetailView && (
        <Link to={`/post/${post.id}`} className="absolute inset-0 z-10">
          <span className="sr-only">View post</span>
        </Link>
      )}
    </div>
  );
};

export default PostContent;
