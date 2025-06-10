
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, Filter } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CreateEventDialog from '@/components/events/CreateEventDialog';
import EventRegistrationDialog from '@/components/events/EventRegistrationDialog';

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

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const { isLoggedIn, user } = useAuth();
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (showUpcoming) params.append('upcoming', 'true');

      const response = await fetch(`https://moonmovement.onrender.com/api/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, showUpcoming]);

  const handleRegisterEvent = async (eventId: number) => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to register for events",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://moonmovement.onrender.com/api/events/${eventId}/register`, {
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
        fetchEvents(); // Refresh events
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

  const isUserRegistered = (event: Event) => {
    return event.registrations.some(reg => reg.user.id === parseInt(user?.id || '0'));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const categories = ['all', 'networking', 'workshop', 'conference', 'meetup', 'seminar'];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Loading events...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Networking Events</h1>
            <p className="text-muted-foreground">Discover and join amazing networking events</p>
          </div>
          {isLoggedIn && (
            <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showUpcoming ? "default" : "outline"}
            onClick={() => setShowUpcoming(!showUpcoming)}
            className="w-full sm:w-auto"
          >
            {showUpcoming ? 'Upcoming Events' : 'All Events'}
          </Button>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
              <p className="text-muted-foreground">
                {categoryFilter !== 'all' || showUpcoming 
                  ? 'Try adjusting your filters to see more events.'
                  : 'Be the first to create an event!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                {event.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {event.category}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      {event._count.registrations}
                      {event.maxAttendees && `/${event.maxAttendees}`}
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.eventDate)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {event.eventTime}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowRegistrationDialog(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      View Details
                    </Button>
                    
                    {isLoggedIn && !isUserRegistered(event) && (
                      <Button
                        onClick={() => handleRegisterEvent(event.id)}
                        size="sm"
                        className="w-full"
                        disabled={event.maxAttendees ? event._count.registrations >= event.maxAttendees : false}
                      >
                        {event.maxAttendees && event._count.registrations >= event.maxAttendees 
                          ? 'Event Full' 
                          : 'Register'
                        }
                      </Button>
                    )}
                    
                    {isUserRegistered(event) && (
                      <Badge variant="default" className="w-full justify-center py-2">
                        Registered
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Event Dialog */}
        <CreateEventDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onEventCreated={fetchEvents}
        />

        {/* Event Registration Dialog */}
        <EventRegistrationDialog
          open={showRegistrationDialog}
          onOpenChange={setShowRegistrationDialog}
          event={selectedEvent}
          onRegister={handleRegisterEvent}
          isRegistered={selectedEvent ? isUserRegistered(selectedEvent) : false}
        />
      </div>
    </MainLayout>
  );
};

export default Events;
