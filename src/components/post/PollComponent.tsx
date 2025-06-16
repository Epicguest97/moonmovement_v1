
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
      const response = await fetch(`https://moonmovement.onrender.com/api/posts/${postId}/poll/vote`, {
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
      className="bg-background border border-border rounded-lg p-4 space-y-3 relative z-20 mt-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-primary rounded-full"></div>
        <h4 className="font-medium text-foreground text-sm">Poll</h4>
      </div>
      
      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes.length);
          const isSelected = selectedOption === option.id;
          
          return (
            <div key={option.id} className="relative" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                className={`w-full justify-between text-left h-auto p-3 relative overflow-hidden border transition-all duration-200 ${
                  hasVoted || isExpired
                    ? 'cursor-default hover:bg-transparent' 
                    : 'hover:bg-accent/50 hover:border-primary/50'
                } ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border'
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
                    className="absolute left-0 top-0 h-full bg-primary/10 transition-all duration-500 ease-out rounded-md"
                    style={{ width: `${percentage}%` }}
                  />
                )}
                
                <div className="flex justify-between items-center w-full relative z-10">
                  <span className={`text-sm ${isSelected ? 'font-medium text-primary' : 'text-foreground'}`}>
                    {option.text}
                  </span>
                  {hasVoted && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {percentage}%
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {option.votes.length}
                      </span>
                    </div>
                  )}
                </div>
              </Button>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {poll.expiresAt && (
            <span className={isExpired ? 'text-destructive' : 'text-primary'}>
              {isExpired ? 'Expired' : 'Expires'} {new Date(poll.expiresAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      {!user && !hasVoted && (
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          Login to vote on this poll
        </div>
      )}
    </div>
  );
};

export default PollComponent;
