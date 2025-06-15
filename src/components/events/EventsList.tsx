
import React, { useState } from 'react';
import EventCard from './EventCard';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Calendar } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  eventTime: string;
  maxAttendees?: number;
  imageUrl?: string;
  category: string;
  organizer: {
    id: number;
    username: string;
  };
  registrations: Array<{
    user: {
      id: number;
      username: string;
    };
  }>;
  _count: {
    registrations: number;
  };
}

interface EventsListProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  onRegister: (eventId: number) => void;
  isUserRegistered: (event: Event) => boolean;
  isLoggedIn: boolean;
}

const EventsList = ({ 
  events, 
  onEventSelect, 
  onRegister, 
  isUserRegistered, 
  isLoggedIn 
}: EventsListProps) => {
  const [sortBy, setSortBy] = useState<'trending' | 'latest' | 'upcoming'>('upcoming');

  const handleSortChange = (newSort: 'trending' | 'latest' | 'upcoming') => {
    setSortBy(newSort);
  };

  // Sort events based on selected sort criteria
  const sortedEvents = [...events].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
      case 'upcoming':
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      case 'trending':
      default:
        // Sort by registration count (trending)
        return b._count.registrations - a._count.registrations;
    }
  });

  return (
    <div className="space-y-0">
      {/* Sort Controls with rounded top corners */}
      <div className="bg-sidebar border border-sidebar-border rounded-t-lg border-b-0">
        <div className="flex p-3 gap-2">
          <Button 
            variant={sortBy === 'upcoming' ? 'default' : 'ghost'} 
            size="sm" 
            className={sortBy === 'upcoming' ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => handleSortChange('upcoming')}
          >
            <Calendar size={16} className="mr-2" />
            Upcoming
          </Button>
          <Button 
            variant={sortBy === 'trending' ? 'default' : 'ghost'} 
            size="sm" 
            className={sortBy === 'trending' ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => handleSortChange('trending')}
          >
            <TrendingUp size={16} className="mr-2" />
            Trending
          </Button>
          <Button 
            variant={sortBy === 'latest' ? 'default' : 'ghost'} 
            size="sm" 
            className={sortBy === 'latest' ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => handleSortChange('latest')}
          >
            <Clock size={16} className="mr-2" />
            Latest
          </Button>
        </div>
      </div>

      {/* Events List with only bottom rounded corners on last item */}
      {sortedEvents.length > 0 ? (
        <div className="overflow-hidden border border-sidebar-border rounded-b-lg">
          {sortedEvents.map((event, index) => (
            <EventCard 
              key={event.id}
              event={event}
              isFirst={false}
              isLast={index === sortedEvents.length - 1}
              onEventSelect={onEventSelect}
              onRegister={onRegister}
              isUserRegistered={isUserRegistered}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      ) : (
        <div className="bg-sidebar/30 p-8 border border-sidebar-border rounded-lg text-center">
          <p className="text-muted-foreground">No events available.</p>
        </div>
      )}
    </div>
  );
};

export default EventsList;
