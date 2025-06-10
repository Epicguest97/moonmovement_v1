
import React from 'react';
import { Calendar, MapPin, Clock, Users, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

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

interface EventRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onRegister: (eventId: number) => void;
  isRegistered: boolean;
}

const EventRegistrationDialog = ({ 
  open, 
  onOpenChange, 
  event, 
  onRegister, 
  isRegistered 
}: EventRegistrationDialogProps) => {
  const { isLoggedIn } = useAuth();

  if (!event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isEventFull = event.maxAttendees ? event._count.registrations >= event.maxAttendees : false;
  const isPastEvent = new Date(event.eventDate) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {event.imageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Organized by @{event.organizer.username}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                {formatDate(event.eventDate)}
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                {event.eventTime}
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                {event.location}
              </div>
              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                {event._count.registrations}
                {event.maxAttendees && ` / ${event.maxAttendees}`} attendees
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>

            {event.registrations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Registered Attendees</h3>
                <ScrollArea className="h-32 w-full border rounded-md p-3">
                  <div className="space-y-2">
                    {event.registrations.map((registration) => (
                      <div key={registration.user.id} className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        @{registration.user.username}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            
            {isLoggedIn && !isRegistered && !isPastEvent && (
              <Button
                onClick={() => {
                  onRegister(event.id);
                  onOpenChange(false);
                }}
                disabled={isEventFull}
                className="w-full sm:flex-1"
              >
                {isEventFull ? 'Event Full' : 'Register for Event'}
              </Button>
            )}
            
            {isRegistered && (
              <Badge variant="default" className="w-full sm:flex-1 justify-center py-2">
                You're Registered
              </Badge>
            )}
            
            {!isLoggedIn && (
              <Button disabled className="w-full sm:flex-1">
                Login to Register
              </Button>
            )}
            
            {isPastEvent && (
              <Badge variant="secondary" className="w-full sm:flex-1 justify-center py-2">
                Event Ended
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationDialog;
