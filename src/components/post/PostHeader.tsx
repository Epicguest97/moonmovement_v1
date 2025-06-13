import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from './PostCard';

interface PostHeaderProps {
  post: Post;
}

const PostHeader = ({ post }: PostHeaderProps) => {
  return (
    <div className="mb-2">
      {/* Community name - small and above title */}
      <Link to={`/r/${post.subreddit}`} className="text-xs text-gray-400 hover:underline">
        r/{post.subreddit}
      </Link>
      
      {/* Post title */}
      <Link to={`/post/${post.id}`} className="block">
        <h3 className="text-base font-semibold text-sidebar-foreground hover:text-sidebar-primary">
          {post.title}
        </h3>
      </Link>
    </div>
  );
};

export default PostHeader;