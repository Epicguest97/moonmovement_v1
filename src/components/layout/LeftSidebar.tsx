import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Trophy, 
  Calendar, 
  TrendingUp, 
  Users, 
  MapPin, 
  FileText,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const LeftSidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const navigationItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: Home,
    },
    { 
      name: 'Hall of Fame', 
      path: '/unicorns-india', 
      icon: Trophy,
    },
    { 
      name: 'Events', 
      path: '/events', 
      icon: Calendar,
      hasDropdown: true
    },
    { 
      name: "What's Happening", 
      path: '/news', 
      icon: TrendingUp,
      hasDropdown: true
    },
    { 
      name: 'Communities', 
      path: '/communities', 
      icon: Users,
      hasDropdown: true
    },
    { 
      name: 'Cities', 
      path: '/districts', 
      icon: MapPin,
      hasDropdown: true
    },
    { 
      name: 'For everything else', 
      path: '/misc', 
      icon: FileText,
      hasDropdown: true
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const sidebarClasses = isMobile 
    ? "w-full h-full bg-sidebar p-4" 
    : "fixed left-20 top-20 w-64 bg-sidebar border border-sidebar-border rounded-lg shadow-lg h-auto max-h-[500px] overflow-y-auto z-10 p-4";

  return (
    <div className={sidebarClasses}>
      {/* Main Navigation */}
      <nav className="space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive(item.path)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </div>
            {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default LeftSidebar;
