import { API_BASE_URL } from '@/config';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface PollOption {
  id: number;
  text: string;
  votes: any[];
}

interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  expiresAt?: string;
}

interface PollComponentProps {
  poll: Poll;
  postId: string;
}

const PollComponent = ({ poll, postId }: PollComponentProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

  // Check if user has already voted
  useEffect(() => {
    if (user && poll.options.length > 0) {
      const userVote = poll.options.find(option => 
        option.votes.some((vote: any) => vote.userId === user.id)
      );
      if (userVote) {
        setSelectedOption(userVote.id);
        setHasVoted(true);
      }
    }
  }, [user, poll.options]);

  const handleVote = async (optionId: number) => {
    if (!user || hasVoted || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/poll/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ optionId })
      });

      if (response.ok) {
        setSelectedOption(optionId);
        setHasVoted(true);
        // Reload page to show updated vote counts
        window.location.reload();
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  const isExpired = poll.expiresAt ? new Date(poll.expiresAt) < new Date() : false;

  return (
    <div 
      className="bg-sidebar-accent/30 rounded-lg p-4 space-y-3 relative z-20"
      onClick={(e) => e.stopPropagation()}
    >
      <h4 className="font-medium text-foreground">{poll.question}</h4>
      
      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes.length);
          const isSelected = selectedOption === option.id;
          
          return (
            <div key={option.id} className="relative" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                className={`w-full justify-start text-left h-auto p-3 relative overflow-hidden ${
                  hasVoted || isExpired
                    ? 'cursor-default' 
                    : 'hover:bg-sidebar-accent/50'
                } ${
                  isSelected ? 'border-primary bg-primary/10' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasVoted && !isExpired && !loading) handleVote(option.id);
                }}
                disabled={hasVoted || isExpired || loading}
              >
                {/* Vote percentage background */}
                {hasVoted && (
                  <div 
                    className="absolute left-0 top-0 h-full bg-primary/20 transition-all duration-300 rounded"
                    style={{ width: `${percentage}%` }}
                  />
                )}
                
                <div className="flex justify-between items-center w-full relative z-10">
                  <span className={isSelected ? 'font-medium' : ''}>{option.text}</span>
                  {hasVoted && (
                    <span className="text-sm text-muted-foreground">
                      {percentage}% ({option.votes.length})
                    </span>
                  )}
                </div>
              </Button>
            </div>
          );
        })}
      </div>
      
      <div className="text-sm text-muted-foreground">
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        {poll.expiresAt && (
          <span className={isExpired ? 'text-red-400' : ''}>
            {' • '}{isExpired ? 'Expired' : 'Expires'} {new Date(poll.expiresAt).toLocaleDateString()}
          </span>
        )}
        {!user && !hasVoted && (
          <div className="text-xs text-muted-foreground mt-1">
            Login to vote on this poll
          </div>
        )}
      </div>
    </div>
  );
};

export default PollComponent;
