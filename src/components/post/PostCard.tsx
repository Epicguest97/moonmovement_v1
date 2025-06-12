
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import PostContent from './PostContent';
import PostFooter from './PostFooter';
import PostModerationActions from '../moderation/PostModerationActions';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: number;
    username: string;
    email: string;
    password: string;
    createdAt: string;
  } | string;
  subreddit: string;
  timestamp: string;
  voteScore: number;
  commentCount: number;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  isText?: boolean;
  isLink?: boolean;
}

interface PostCardProps {
  post: Post;
  onPostUpdate?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const PostCard = ({ post, onPostUpdate, isFirst = false, isLast = false }: PostCardProps) => {
  const authorName = typeof post.author === 'string' ? post.author : post.author.username;
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeScore, setLikeScore] = useState(post.voteScore);
  const [moderationInfo, setModerationInfo] = useState<{ isModerator: boolean; permissions: any } | null>(null);
  
  useEffect(() => {
    const checkModeratorStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`https://moonmovement.onrender.com/api/moderation/${post.subreddit}/check`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setModerationInfo(data);
        }
      } catch (err) {
        console.error('Failed to check moderator status:', err);
      }
    };

    checkModeratorStatus();
  }, [post.subreddit]);
  
  const handleLike = async () => {
    const username = localStorage.getItem('username');
    if (!username) {
      alert('You must be signed in to like posts.');
      return;
    }

    try {
      const res = await fetch(`https://moonmovement.onrender.com/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      if (!res.ok) throw new Error('Failed to like post');
      
      const updatedPost = await res.json();
      setLikeScore(updatedPost.likeCount || 0);
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Failed to like post:', err);
      alert('Failed to like post');
    }
  };
  
  return (
    <Card className={`post-card overflow-hidden bg-sidebar border-0
      ${!isFirst && !isLast ? "rounded-none" : ""}
      ${isFirst && !isLast ? "rounded-t-lg rounded-b-none" : ""}
      ${!isFirst && isLast ? "rounded-b-lg rounded-t-none" : ""}
      ${isFirst && isLast ? "" : ""}
    `}>
      {moderationInfo?.isModerator && moderationInfo.permissions?.managePosts && (
        <PostModerationActions 
          postId={post.id}
          subreddit={post.subreddit}
          canManagePosts={moderationInfo.permissions.managePosts}
          onPostRemoved={onPostUpdate}
        />
      )}
      
      <div className="p-4">
        <div className="flex items-center text-xs text-gray-400 mb-2">
          <Link to={`/r/${post.subreddit}`} className="font-medium text-gray-200 hover:underline mr-1">
            r/{post.subreddit}
          </Link>
          <span className="mx-1">•</span>
          Posted by{" "}
          <Link to={`/u/${authorName}`} className="hover:underline mx-1 text-gray-400">
            u/{authorName}
          </Link>
          <span className="mx-1">•</span>
          <span>{post.timestamp}</span>
        </div>
        
        <Link to={`/post/${post.id}`}>
          <h3 className="text-lg font-semibold mb-2 text-white hover:text-primary cursor-pointer">
            {post.title}
          </h3>
        </Link>
        
        <PostContent post={post} />
        
        <PostFooter 
          commentCount={post.commentCount}
          postId={post.id}
          likeScore={likeScore}
          isLiked={isLiked}
          onLike={handleLike}
        />
      </div>
      
      {!isLast && (
        <div className="mx-8 h-[0.5px] bg-gray-700/50"></div>
      )}
    </Card>
  );
};

export default PostCard;
