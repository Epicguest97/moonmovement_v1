import React, { useState } from 'react';
import { Post } from './PostCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostContentProps {
  post: Post;
  isCompact?: boolean;
  isDetailView?: boolean;
  hideTextContent?: boolean;
  hasOnlyText?: boolean;
}

const PostContent = ({ 
  post, 
  isCompact = false, 
  isDetailView = false, 
  hideTextContent = false,
  hasOnlyText = false
}: PostContentProps) => {
  const [isExpanded, setIsExpanded] = useState(isDetailView);
  const shouldTruncate = post.content?.length > 300 && !isExpanded && !isDetailView;
  
  const renderImage = () => {
    if (post.imageUrl) {
      return (
        <div className="mt-1 mb-0 overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="max-w-full w-full h-auto rounded-md object-cover" 
          />
        </div>
      );
    }
    return null;
  };
  
  const renderVideo = () => {
    if (post.videoUrl) {
      return (
        <div 
          className="mt-1 mb-0 overflow-hidden relative z-20" 
          onClick={(e) => e.stopPropagation()}
        >
          <video 
            src={post.videoUrl} 
            controls
            className="max-w-full w-full h-auto rounded-md object-contain"
            preload="metadata"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      );
    }
    return null;
  };
  
  const renderTextContent = () => {
    if (hideTextContent) return null;
    
    if (post.content && (isDetailView || !post.imageUrl)) {
      const content = shouldTruncate
        ? `${post.content.substring(0, 300)}...`
        : post.content;
        
      return (
        <div className={cn(
          "mt-1 text-sm overflow-hidden",
          hasOnlyText && !isDetailView ? "mb-0 pb-0" : "mb-1 pb-1"
        )}>
          <p className="whitespace-pre-line break-words overflow-wrap-anywhere">{content}</p>
          
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
    // Don't render link if hideTextContent is true
    if (hideTextContent) return null;
    
    if (post.linkUrl && (isDetailView || !post.imageUrl)) {
      return (
        <div className="mt-2 mb-2 overflow-hidden">
          <a 
            href={post.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline break-all overflow-wrap-anywhere"
          >
            {post.linkUrl}
          </a>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative overflow-hidden py-0">
      {renderImage()}
      {renderVideo()}
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
