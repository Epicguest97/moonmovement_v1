
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, Filter, Search } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  const [searchQuery, setSearchQuery] = useState('');
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
            <p className="text-gray-300">Loading networking events...</p>
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
              <div className="text-center bg-sidebar/60 hover:bg-sidebar/80 backdrop-blur-sm border border-sidebar-border/50 rounded-lg px-3 py-2 transition-all duration-300">
                <div className="text-lg font-bold text-blue-400">{categories.length - 1}</div>
                <div className="text-xs text-gray-200 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Categories
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

        {/* Main Events Section */}
        <div className="space-y-6">
          {/* Header with Create Button */}
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
          <div className="bg-sidebar border border-sidebar-border rounded-lg p-4">
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
            
            <div className="text-xs text-gray-400 mt-2">
              Showing {filteredEvents.length} events
            </div>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'No events match your search criteria.' :
                   categoryFilter !== 'all' || showUpcoming 
                    ? 'Try adjusting your filters to see more events.'
                    : 'Be the first to create an event!'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
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
