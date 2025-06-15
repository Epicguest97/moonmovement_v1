
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface EventCardProps {
  event: Event;
  isFirst?: boolean;
  isLast?: boolean;
  onEventSelect: (event: Event) => void;
  onRegister: (eventId: number) => void;
  isUserRegistered: (event: Event) => boolean;
  isLoggedIn: boolean;
}

const EventCard = ({ 
  event, 
  isFirst = false, 
  isLast = false,
  onEventSelect,
  onRegister,
  isUserRegistered,
  isLoggedIn
}: EventCardProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isEventFull = event.maxAttendees ? event._count.registrations >= event.maxAttendees : false;
  const isRegistered = isUserRegistered(event);

  const handleCardClick = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <Card className={`event-card overflow-hidden bg-sidebar border-0 cursor-pointer hover:bg-sidebar-accent/50 transition-colors
      ${!isFirst && !isLast ? "rounded-none" : ""}
      ${isFirst && !isLast ? "rounded-t-lg rounded-b-none" : ""}
      ${!isFirst && isLast ? "rounded-b-lg rounded-t-none" : ""}
      ${isFirst && isLast ? "" : ""}
    `} onClick={handleCardClick}>
      <div className="flex flex-col">
        {event.imageUrl && (
          <div className="w-full md:hidden">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row">
          {event.imageUrl && (
            <div className="hidden md:block md:w-1/4">
              <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="w-full h-48 md:h-full object-cover"
              />
            </div>
          )}
          
          <CardContent className={`flex-1 p-3 sm:p-4 ${event.imageUrl ? 'md:w-3/4' : 'w-full'}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
              <Badge variant="secondary" className="text-xs">
                {event.category}
              </Badge>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(event.eventDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {event.eventTime}
              </span>
              <span className="text-gray-500">by {event.organizer.username}</span>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-2 text-white hover:text-sidebar-primary transition-colors">
                {event.title}
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-300 mb-2 line-clamp-3 sm:line-clamp-2">{event.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                {event.location}
              </div>
              <div className="flex items-center gap-1">
                <Users size={12} />
                {event._count.registrations}
                {event.maxAttendees && `/${event.maxAttendees}`}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs border-sidebar-border bg-transparent text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventSelect(event);
                  }}
                >
                  View Details
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs border-sidebar-border bg-transparent text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share size={12} className="mr-1" />
                  Share
                </Button>
              </div>
              
              <div className="flex gap-2">
                {isLoggedIn && !isRegistered && !isEventFull && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegister(event.id);
                    }}
                    size="sm"
                    className="text-xs"
                  >
                    Register
                  </Button>
                )}
                
                {isEventFull && (
                  <Badge variant="destructive" className="text-xs">
                    Event Full
                  </Badge>
                )}
                
                {isRegistered && (
                  <Badge variant="default" className="text-xs">
                    Registered
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </div>
      
      {/* Add the subtle divider line only between event items (not after the last one) */}
      {!isLast && (
        <div className="mx-8 h-[0.5px] bg-gray-700/50"></div>
      )}
    </Card>
  );
};

export default EventCard;
