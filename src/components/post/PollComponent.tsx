
import React, { useState } from 'react';
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
  const { user } = useAuth();

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

  const handleVote = async (optionId: number) => {
    if (!user || hasVoted) return;

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
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  };

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  return (
    <div className="bg-sidebar-accent/30 rounded-lg p-4 space-y-3">
      <h4 className="font-medium text-foreground">{poll.question}</h4>
      
      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes.length);
          const isSelected = selectedOption === option.id;
          
          return (
            <div key={option.id} className="relative">
              <Button
                variant="outline"
                className={`w-full justify-start text-left h-auto p-3 ${
                  hasVoted 
                    ? 'cursor-default' 
                    : 'hover:bg-sidebar-accent/50'
                } ${
                  isSelected ? 'border-primary bg-primary/10' : ''
                }`}
                onClick={() => !hasVoted && handleVote(option.id)}
                disabled={hasVoted}
              >
                <div className="flex justify-between items-center w-full">
                  <span>{option.text}</span>
                  {hasVoted && (
                    <span className="text-sm text-muted-foreground">
                      {percentage}% ({option.votes.length})
                    </span>
                  )}
                </div>
              </Button>
              
              {hasVoted && (
                <div 
                  className="absolute left-0 top-0 h-full bg-primary/20 rounded transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="text-sm text-muted-foreground">
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        {poll.expiresAt && (
          <span> • Expires {new Date(poll.expiresAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

export default PollComponent;
