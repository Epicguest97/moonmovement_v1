import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LikeButton from './LikeButton';
import { 
  MessageSquare,
  Share,
  Bookmark,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface PostFooterProps {
  commentCount: number;
  postId: string;
  likeScore: number;
  isLiked: boolean;
  onLike: () => void;
}

const PostFooter = ({ commentCount, postId, likeScore, isLiked, onLike }: PostFooterProps) => {
  return (
    <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-2">
      <div className="flex items-center space-x-4">
        <LikeButton 
          score={likeScore}
          isLiked={isLiked}
          onLike={onLike}
        />
        
        <Link 
          to={`/post/${postId}`}
          className="flex items-center space-x-1 hover:text-white transition-colors"
        >
          <MessageSquare size={16} />
          <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
        </Link>

        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center text-xs text-gray-400 hover:text-white p-1 h-auto"
        >
          <Share size={16} className="mr-1" />
          <span>Share</span>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center text-xs text-gray-400 hover:text-white p-1 h-auto"
        >
          <Bookmark size={16} className="mr-1" />
          <span>Save</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-xs text-gray-400 hover:text-white p-1 h-auto"
            >
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Hide</DropdownMenuItem>
            <DropdownMenuItem>Report</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Block Community</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default PostFooter;
