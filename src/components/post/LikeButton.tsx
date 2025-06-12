
import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  score: number;
  isLiked: boolean;
  onLike: () => void;
}

const LikeButton = ({ score, isLiked, onLike }: LikeButtonProps) => {
  const formatScore = (score: number): string => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  };

  return (
    <button 
      className={cn(
        "flex items-center space-x-1 text-xs transition-colors",
        isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
      )}
      onClick={onLike}
    >
      <Heart 
        size={16} 
        className={cn(
          "transition-all",
          isLiked ? "fill-red-500" : "hover:fill-red-500"
        )} 
      />
      <span className="font-medium">{formatScore(score)}</span>
    </button>
  );
};

export default LikeButton;
