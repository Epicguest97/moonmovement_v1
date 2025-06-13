
import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteControlsProps {
  postId: string;
  initialScore: number;
  className?: string;
  vertical?: boolean;
}

const VoteControls = ({ 
  postId,
  initialScore,
  className,
  vertical = true
}: VoteControlsProps) => {
  const [score, setScore] = useState(initialScore);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);

  const handleVote = async (direction: 'up' | 'down') => {
    try {
      const response = await fetch(`https://moonmovement.onrender.com/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type: direction === 'up' ? 1 : -1 })
      });

      if (response.ok) {
        const data = await response.json();
        setScore(data.newScore);
        setVoteStatus(direction === voteStatus ? null : direction);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Format score for display
  const formatScore = (score: number): string => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  };

  return (
    <div className={cn(
      "flex items-center", 
      vertical ? "flex-col py-2 px-2 bg-sidebar" : "flex-row space-x-2",
      className
    )}>
      <button 
        className={cn(
          "vote-button flex items-center justify-center w-6 h-6 rounded-sm",
          voteStatus === 'up' ? "text-sidebar-primary" : "text-gray-400 hover:text-gray-200"
        )}
        onClick={() => handleVote('up')}
        aria-label="Upvote"
      >
        <ArrowUp size={18} />
      </button>
      
      <span className={cn(
        "font-medium text-xs py-1",
        voteStatus === 'up' ? "text-sidebar-primary" : 
        voteStatus === 'down' ? "text-blue-600" : "text-gray-200"
      )}>
        {formatScore(score)}
      </span>
      
      <button 
        className={cn(
          "vote-button flex items-center justify-center w-6 h-6 rounded-sm",
          voteStatus === 'down' ? "text-blue-600" : "text-gray-400 hover:text-gray-200"
        )}
        onClick={() => handleVote('down')}
        aria-label="Downvote"
      >
        <ArrowDown size={18} />
      </button>
    </div>
  );
};

export default VoteControls;
