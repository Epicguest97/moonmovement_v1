
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import VoteControls from './VoteControls';
import PostFooter from './PostFooter';
import PollComponent from './PollComponent';

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

const PostCard = ({ post, isFirst = false, isLast = false }: PostCardProps) => {
  const authorName = typeof post.author === 'string' ? post.author : post.author.username;

  const getVideoEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Convert Vimeo URLs to embed format
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const borderRadiusClass = () => {
    if (isFirst && isLast) return 'rounded-lg';
    if (isFirst) return 'rounded-t-lg rounded-b-none';
    if (isLast) return 'rounded-b-lg rounded-t-none';
    return 'rounded-none';
  };

  return (
    <Card className={`bg-sidebar border-sidebar-border border-t-0 ${borderRadiusClass()} relative`}>
      <div className="flex p-4 gap-3">
        {/* Vote Controls */}
        <VoteControls 
          postId={post.id} 
          initialScore={post.voteScore}
          className="flex-shrink-0"
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">r/{post.subreddit}</span>
            <span>•</span>
            <span>Posted by</span>
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-xs">
                  {authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>u/{authorName}</span>
            </div>
            <span>•</span>
            <span>{post.timestamp}</span>
          </div>

          {/* Title */}
          <h3 className="font-medium text-foreground mb-2 break-words">
            {post.title}
          </h3>

          {/* Content */}
          {post.content && (
            <div className="text-foreground mb-3 break-words whitespace-pre-wrap">
              {post.content}
            </div>
          )}

          {/* Image */}
          {post.imageUrl && (
            <div className="mb-3">
              <img 
                src={post.imageUrl} 
                alt="Post content"
                className="max-w-full h-auto rounded-lg border border-sidebar-border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Video */}
          {post.videoUrl && (
            <div className="mb-3">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={getVideoEmbedUrl(post.videoUrl)}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video content"
                />
              </div>
            </div>
          )}

          {/* Link Preview */}
          {post.linkUrl && (
            <div className="mb-3">
              <a 
                href={post.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-sidebar-accent/30 border border-sidebar-border rounded-lg hover:bg-sidebar-accent/50 transition-colors"
              >
                <div className="text-primary hover:underline break-all">
                  {post.linkUrl}
                </div>
              </a>
            </div>
          )}

          {/* Poll */}
          {post.poll && (
            <div className="mb-3">
              <PollComponent poll={post.poll} postId={post.id} />
            </div>
          )}

          {/* Footer */}
          <PostFooter 
            postId={post.id}
            commentCount={post.commentCount}
            subreddit={post.subreddit}
          />
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
