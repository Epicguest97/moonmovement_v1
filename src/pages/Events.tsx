
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, Search } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CreateEventDialog from '@/components/events/CreateEventDialog';
import EventRegistrationDialog from '@/components/events/EventRegistrationDialog';
import EventsList from '@/components/events/EventsList';

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoggedIn, user } = useAuth();
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      const response = await fetch(`https://moonmovement.onrender.com/api/events`);
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
  }, []);

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

  const filteredEvents = events.filter(event => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return event.title.toLowerCase().includes(query) ||
           event.description.toLowerCase().includes(query) ||
           event.location.toLowerCase().includes(query) ||
           event.category.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
          {/* Hero Section Skeleton */}
          <div className="relative rounded-lg overflow-hidden h-[350px]">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/events.jpeg)',
                backgroundPosition: 'center 30%'
              }}
            >
            </div>
            <div className="relative z-10 p-8 text-white h-full flex flex-col justify-between">
              <div className="absolute top-6 right-6 flex gap-4 animate-pulse">
                <div className="text-center bg-sidebar/60 backdrop-blur-sm border border-sidebar-border/50 rounded-lg px-3 py-2">
                  <div className="h-6 bg-white/20 rounded w-12 mb-1"></div>
                  <div className="h-4 bg-white/20 rounded w-16"></div>
                </div>
              </div>
              
              <div className="w-full">
                <div className="h-10 bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-300">Loading events...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Hero Section */}
        <div className="relative rounded-lg overflow-hidden h-[350px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/events.jpeg)',
              backgroundPosition: 'center 30%'
            }}
          >
          </div>
          <div className="relative z-10 p-6 pb-5 text-white flex flex-col justify-end h-full">
            {/* Stats in top right */}
            <div className="absolute top-6 right-6 flex gap-4">
              <div className="text-center bg-sidebar/60 hover:bg-sidebar/80 backdrop-blur-sm border border-sidebar-border/50 rounded-lg px-3 py-2 transition-all duration-300">
                <div className="text-lg font-bold text-green-400">{events.length}</div>
                <div className="text-xs text-gray-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Events
                </div>
              </div>
            </div>

            {/* Full Width Glassy Search bar */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                <Input 
                  placeholder="Search events..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-sidebar/60 hover:bg-sidebar/80 border-sidebar-border/50 text-white placeholder:text-gray-300 rounded-full px-4 py-2 text-sm backdrop-blur-sm w-full pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="bg-sidebar/30 border border-sidebar-border rounded-lg p-4">
            <p className="text-foreground break-words">
              Showing results for: <span className="font-semibold break-all">"{searchQuery}"</span>
              {filteredEvents.length > 0 && (
                <span className="text-muted-foreground ml-2">({filteredEvents.length} results)</span>
              )}
            </p>
          </div>
        )}

        {/* Single Events Container */}
        <div className="space-y-0 w-full max-w-full">
          {/* Events Content */}
          <div className="bg-sidebar border border-sidebar-border rounded-lg p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Events</h2>
                {isLoggedIn && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </div>

              <EventsList 
                events={filteredEvents}
                onEventSelect={(event) => {
                  setSelectedEvent(event);
                  setShowRegistrationDialog(true);
                }}
                onRegister={handleRegisterEvent}
                isUserRegistered={isUserRegistered}
                isLoggedIn={isLoggedIn}
              />
            </div>
          </div>
        </div>

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
