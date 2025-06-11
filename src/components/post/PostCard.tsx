import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { MessageSquare, Share } from 'lucide-react';
import VoteControls from './VoteControls';
import PostContent from './PostContent';
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
  } | string; // Support both formats for backward compatibility
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
  // Handle both author object and string formats
  const authorName = typeof post.author === 'string' ? post.author : post.author.username;
  
  // Voting state
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [voteScore, setVoteScore] = useState(post.voteScore);
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
  
  const handleVote = async (direction: 'up' | 'down') => {
    const username = localStorage.getItem('username');
    if (!username) {
      alert('You must be signed in to vote.');
      return;
    }
    const type = direction === 'up' ? 1 : -1;
    try {
      const res = await fetch(`https://moonmovement.onrender.com/api/posts/${post.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, type })
      });
      if (!res.ok) throw new Error('Failed to vote');
      const updatedPost = await res.json();
      // Calculate new vote score from updatedPost.votes
      const newScore = Array.isArray(updatedPost.votes)
        ? updatedPost.votes.reduce((sum: number, v: any) => sum + (v.type === 1 ? 1 : v.type === -1 ? -1 : 0), 0)
        : 0;
      setVoteScore(newScore);
      setVoteStatus(direction);
    } catch (err) {
      alert('Failed to vote');
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
      
      <div className="flex">
        <VoteControls 
          score={voteScore} 
          voteStatus={voteStatus} 
          onVote={handleVote} 
        />
        
        <div className="flex-1 p-4">
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
          
          <div className="flex items-center mt-3 text-xs text-gray-400">
            <Link 
              to={`/post/${post.id}`}
              className="flex items-center hover:bg-sidebar-accent hover:text-white rounded p-1 -ml-1"
            >
              <MessageSquare size={16} className="mr-1" />
              {post.commentCount} Comments
            </Link>
            
            <button className="flex items-center hover:bg-sidebar-accent hover:text-white rounded p-1 ml-2">
              <Share size={16} className="mr-1" />
              Share
            </button>
          </div>
        </div>
      </div>
      
      {/* Add the subtle divider line only between posts (not after the last one) */}
      {!isLast && (
        <div className="mx-8 h-[0.5px] bg-gray-700/50"></div>
      )}
    </Card>
  );
};

export default PostCard;
