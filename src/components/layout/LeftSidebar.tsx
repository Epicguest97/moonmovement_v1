import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Trophy, 
  Calendar, 
  TrendingUp, 
  Users, 
  MapPin, 
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';

// Define Event interface
interface Event {
  id: number;
  title: string;
  eventDate: string;
  location: string;
}

const LeftSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const navigationItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Hall of Fame', path: '/unicorns-india', icon: Trophy },
    { name: 'Events', path: '/events', icon: Calendar, hasDropdown: true },
    { name: "What's Happening", path: '/news', icon: TrendingUp, hasDropdown: true },
    { name: 'Communities', path: '/communities', icon: Users, hasDropdown: true },
    { name: 'Cities', path: '/districts', icon: MapPin, hasDropdown: true },
    { name: 'For everything else', path: '/misc', icon: FileText, hasDropdown: true }
  ];

  // Fetch events when the Events dropdown is opened
  useEffect(() => {
    if (openDropdown === 'Events') {
      fetchEvents();
    }
  }, [openDropdown]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://moonmovement.onrender.com/api/events?upcoming=true');
      if (response.ok) {
        const data = await response.json();
        // Get only upcoming events, max 5
        const upcomingEvents = data
          .filter((event: Event) => new Date(event.eventDate) >= new Date())
          .slice(0, 5);
        setEvents(upcomingEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => prev === name ? null : name);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const sidebarClasses = isMobile 
    ? "w-full h-full bg-sidebar p-4" 
    : "fixed left-20 top-20 w-64 bg-sidebar border border-sidebar-border rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-10 p-4";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={sidebarClasses}>
      {/* Main Navigation */}
      <nav className="space-y-1">
        {navigationItems.map((item) => (
          <div key={item.path} className="flex flex-col">
            <div className="flex items-center">
              <Link
                to={item.path}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors flex-grow",
                  isActive(item.path)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <div className="flex items-center">
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </div>
              </Link>
              
              {item.hasDropdown && (
                <button 
                  onClick={() => toggleDropdown(item.name)}
                  className="p-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  {openDropdown === item.name ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
            </div>

            {/* Dropdown content for Events */}
            {item.name === 'Events' && openDropdown === 'Events' && (
              <Card className="ml-8 mt-1 mb-2 bg-sidebar-accent border-sidebar-border">
                <CardContent className="p-2 space-y-1">
                  {loading ? (
                    <div className="text-xs py-2 text-center text-sidebar-foreground opacity-70">Loading events...</div>
                  ) : events.length > 0 ? (
                    <>
                      {events.map(event => (
                        <button
                          key={event.id}
                          className="w-full text-left text-xs p-2 hover:bg-sidebar/70 rounded-md flex justify-between items-center transition-colors"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          <span className="truncate flex-1">{event.title}</span>
                          <span className="ml-2 text-sidebar-primary whitespace-nowrap">{formatDate(event.eventDate)}</span>
                        </button>
                      ))}
                      <div className="pt-1 border-t border-sidebar-border">
                        <Link 
                          to="/events" 
                          className="text-xs text-sidebar-primary hover:underline block text-center py-1"
                        >
                          View all events
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs py-2 text-center text-sidebar-foreground opacity-70">No upcoming events</div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default LeftSidebar;
