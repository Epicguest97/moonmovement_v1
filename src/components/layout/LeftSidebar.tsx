import React, { useState, useEffect, useRef } from 'react';
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

// Define News interface
interface NewsItem {
  id: number;
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
}

// Add these interfaces after the existing ones
interface Community {
  id: number;
  name: string;
  memberCount: number;
  description?: string;
}

interface City {
  id: string;
  name: string;
  state: string;
  coordinates?: [number, number];
  color?: string;
}

const LeftSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [sidebarHeight, setSidebarHeight] = useState<number | null>(null);

  const navigationItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Hall of Fame', path: '/unicorns-india', icon: Trophy },
    { name: 'Events', path: '/events', icon: Calendar, hasDropdown: true },
    { name: "What's Happening", path: '/news', icon: TrendingUp, hasDropdown: true },
    { name: 'Communities', path: '/communities', icon: Users, hasDropdown: true },
    { name: 'Cities', path: '/districts', icon: MapPin, hasDropdown: true },
    { name: 'For everything else', path: '/misc', icon: FileText, hasDropdown: true }
  ];

  // Fetch events/news when their respective dropdowns are opened
  useEffect(() => {
    if (openDropdowns.includes('Events')) {
      fetchEvents();
    }
    if (openDropdowns.includes("What's Happening")) {
      fetchNews();
    }
    if (openDropdowns.includes('Communities')) {
      fetchCommunities();
    }
    if (openDropdowns.includes('Cities')) {
      fetchCities();
    }
  }, [openDropdowns]);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
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
      setLoadingEvents(false);
    }
  };

  const fetchNews = async () => {
    try {
      setLoadingNews(true);
      const response = await fetch('https://moonmovement.onrender.com/api/news');
      if (response.ok) {
        const data = await response.json();
        // Get latest 5 news items
        const latestNews = data.slice(0, 5);
        setNews(latestNews);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchCommunities = async () => {
    try {
      setLoadingCommunities(true);
      const response = await fetch('https://moonmovement.onrender.com/api/community');
      if (response.ok) {
        const data = await response.json();
        // Get top 5 communities by member count
        const topCommunities = data
          .sort((a: Community, b: Community) => b.memberCount - a.memberCount)
          .slice(0, 5);
        setCommunities(topCommunities);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoadingCommunities(false);
    }
  };

  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const response = await fetch('https://moonmovement.onrender.com/api/districts');
      if (response.ok) {
        const data = await response.json();
        setCities(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdowns(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name) // Remove if already open
        : [...prev, name] // Add if not already open
    );
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Fix the sidebar positioning and scrolling behavior

  const sidebarClasses = isMobile 
    ? "w-full h-full bg-sidebar p-4 overflow-y-auto" 
    : "fixed left-20 top-20 w-64 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-10 p-4 max-h-[calc(100vh-6rem)] overflow-y-auto";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div ref={sidebarRef} className={sidebarClasses}>
      {/* Main Navigation */}
      <nav className="space-y-1">
        {navigationItems.map((item) => (
          <div key={item.path} className="flex flex-col">
            {/* Wrap both link and button in a div with hover styles */}
            <div 
              className={cn(
                "flex items-center rounded-md transition-colors hover:bg-sidebar-accent group",
                isActive(item.path) && "bg-sidebar-accent"
              )}
            >
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium transition-colors flex-grow",
                  isActive(item.path)
                    ? "text-sidebar-accent-foreground"
                    : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
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
                  className="p-2 text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
                >
                  {openDropdowns.includes(item.name) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
            </div>

            {/* Dropdown content for Events */}
            {item.name === 'Events' && openDropdowns.includes('Events') && (
              <div className="mt-1 mb-2 -ml-2 w-[calc(100%+16px)] bg-sidebar">
                <div className="p-3 space-y-1.5">
                  {loadingEvents ? (
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
                      <div className="pt-2 border-t border-sidebar-border/50">
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
                </div>
              </div>
            )}

            {/* Dropdown content for What's Happening */}
            {item.name === "What's Happening" && openDropdowns.includes("What's Happening") && (
              <div className="mt-1 mb-2 -ml-2 w-[calc(100%+16px)] bg-sidebar">
                <div className="p-3 space-y-1.5">
                  {loadingNews ? (
                    <div className="text-xs py-2 text-center text-sidebar-foreground opacity-70">Loading news...</div>
                  ) : news.length > 0 ? (
                    <>
                      {news.map(newsItem => (
                        <button
                          key={newsItem.id}
                          className="w-full text-left text-xs p-2 hover:bg-sidebar/70 rounded-md flex justify-between items-center transition-colors"
                          onClick={() => navigate(`/news/${newsItem.id}`)}
                        >
                          <span className="truncate flex-1">{newsItem.title}</span>
                          <span className="ml-2 text-sidebar-primary whitespace-nowrap">{formatDate(newsItem.publishedAt)}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="text-xs py-2 text-center text-sidebar-foreground opacity-70">No news available</div>
                  )}
                </div>
              </div>
            )}

            {/* Dropdown content for Communities */}
            {item.name === 'Communities' && openDropdowns.includes('Communities') && (
              <div className="mt-1 mb-2 -ml-2 w-[calc(100%+16px)] bg-sidebar">
                <div className="p-3 space-y-1.5">
                  {loadingCommunities ? (
                    <div className="text-xs py-2 text-center text-sidebar-foreground opacity-70">Loading communities...</div>
                  ) : communities.length > 0 ? (
                    <>
                      {communities.map(community => (
                        <button
                          key={community.id}
                          className="w-full text-left text-xs p-2 hover:bg-sidebar/70 rounded-md flex justify-between items-center transition-colors"
                          onClick={() => navigate(`/r/${community.name}`)}
                        >
                          <span className="truncate flex-1">r/{community.name}</span>
                          <span className="ml-2 text-sidebar-primary whitespace-nowrap">{community.memberCount} members</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="text-xs py-2 text-center text-sidebar-foreground opacity-70">No communities available</div>
                  )}
                </div>
              </div>
            )}

            {/* Dropdown content for Cities */}
            {item.name === 'Cities' && openDropdowns.includes('Cities') && (
              <div className="mt-1 mb-2 -ml-2 w-[calc(100%+16px)] bg-sidebar">
                <div className="p-3 space-y-1.5">
                  {loadingCities ? (
                    <div className="text-xs py-2 text-center text-sidebar-foreground opacity-70">Loading cities...</div>
                  ) : cities.length > 0 ? (
                    <>
                      {cities.map(city => (
                        <button
                          key={city.id}
                          className="w-full text-left text-xs p-2 hover:bg-sidebar/70 rounded-md flex justify-between items-center transition-colors"
                          onClick={() => navigate(`/districts#${city.id}`)}
                        >
                          <span className="truncate flex-1">{city.name}</span>
                          <span className="ml-2 text-sidebar-primary whitespace-nowrap">{city.state}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="text-xs py-2 text-center text-sidebar-foreground opacity-70">No cities available</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default LeftSidebar;
