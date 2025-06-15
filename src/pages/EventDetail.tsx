
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, User, Share } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`https://moonmovement.onrender.com/api/events/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        navigate('/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isLoggedIn || !event) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://moonmovement.onrender.com/api/events/${event.id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Successfully registered for event!",
        });
        fetchEvent(); // Refresh event data
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to register for event",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Error",
        description: "Failed to register for event",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isUserRegistered = () => {
    if (!event || !user) return false;
    return event.registrations.some(reg => reg.user.id === parseInt(user.id || '0'));
  };

  const isEventFull = event?.maxAttendees ? event._count.registrations >= event.maxAttendees : false;
  const isPastEvent = event ? new Date(event.eventDate) < new Date() : false;
  const isRegistered = isUserRegistered();

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading event...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Event not found.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>

        {/* Event Content */}
        <div className="bg-sidebar border border-sidebar-border rounded-lg overflow-hidden">
          {/* Event Image */}
          {event.imageUrl && (
            <div className="aspect-video w-full">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Event Details */}
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                </Badge>
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              <h1 className="text-3xl font-bold text-white">{event.title}</h1>

              <div className="flex items-center text-sm text-muted-foreground">
                <span>Organized by @{event.organizer.username}</span>
              </div>
            </div>

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-sidebar-accent/30 rounded-lg">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                <div>
                  <div className="font-medium text-white">Date</div>
                  <div className="text-muted-foreground">{formatDate(event.eventDate)}</div>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                <div>
                  <div className="font-medium text-white">Time</div>
                  <div className="text-muted-foreground">{event.eventTime}</div>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-3 text-muted-foreground" />
                <div>
                  <div className="font-medium text-white">Location</div>
                  <div className="text-muted-foreground">{event.location}</div>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-3 text-muted-foreground" />
                <div>
                  <div className="font-medium text-white">Attendees</div>
                  <div className="text-muted-foreground">
                    {event._count.registrations}
                    {event.maxAttendees && ` / ${event.maxAttendees}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Registration Section */}
            <div className="border-t border-sidebar-border pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h3 className="font-semibold text-white mb-1">Registration</h3>
                  <p className="text-sm text-muted-foreground">
                    {isEventFull ? 'This event is full' : 
                     isPastEvent ? 'This event has ended' :
                     isRegistered ? 'You are registered for this event' :
                     'Join this event'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {isLoggedIn && !isRegistered && !isPastEvent && !isEventFull && (
                    <Button onClick={handleRegister}>
                      Register for Event
                    </Button>
                  )}
                  
                  {isRegistered && (
                    <Badge variant="default" className="px-4 py-2">
                      You're Registered
                    </Badge>
                  )}
                  
                  {!isLoggedIn && (
                    <Button disabled>
                      Login to Register
                    </Button>
                  )}
                  
                  {isEventFull && (
                    <Badge variant="destructive" className="px-4 py-2">
                      Event Full
                    </Badge>
                  )}
                  
                  {isPastEvent && (
                    <Badge variant="secondary" className="px-4 py-2">
                      Event Ended
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Registered Attendees */}
            {event.registrations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Registered Attendees ({event._count.registrations})</h3>
                <ScrollArea className="h-32 w-full border border-sidebar-border rounded-md p-3">
                  <div className="space-y-2">
                    {event.registrations.map((registration) => (
                      <div key={registration.user.id} className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">@{registration.user.username}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EventDetail;
