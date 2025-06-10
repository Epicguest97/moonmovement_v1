
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  DollarSign, 
  Briefcase, 
  Building2, 
  TrendingUp, 
  Heart, 
  MapPin, 
  FileText, 
  Users, 
  Building, 
  Calculator 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LeftSidebar = () => {
  const location = useLocation();

  const navigationItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: Home,
      category: 'main'
    },
    { 
      name: 'Salaries', 
      path: '/salary', 
      icon: DollarSign,
      category: 'main'
    },
    { 
      name: 'Careers', 
      path: '/careers', 
      icon: Briefcase,
      category: 'dropdown'
    },
    { 
      name: 'Sectors', 
      path: '/sectors', 
      icon: Building2,
      category: 'dropdown'
    },
    { 
      name: "What's Happening", 
      path: '/news', 
      icon: TrendingUp,
      category: 'dropdown'
    },
    { 
      name: 'Interests', 
      path: '/communities', 
      icon: Heart,
      category: 'dropdown'
    },
    { 
      name: 'Cities', 
      path: '/districts', 
      icon: MapPin,
      category: 'dropdown'
    },
    { 
      name: 'For everything else', 
      path: '/misc', 
      icon: FileText,
      category: 'dropdown'
    }
  ];

  const exploreItems = [
    { name: 'Explore Posts', path: '/' },
    { name: 'Explore Communities', path: '/communities' },
    { name: 'Explore Companies', path: '/startup-news' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 overflow-y-auto">
      <div className="p-4">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive(item.path)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Separator */}
        <div className="my-6 border-t border-sidebar-border"></div>

        {/* Explore Section */}
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
            Explore
          </h3>
          <nav className="space-y-1">
            {exploreItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                  isActive(item.path) && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Additional Links */}
        <div className="mt-6">
          <nav className="space-y-1">
            <Link
              to="/events"
              className={cn(
                "block px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                isActive('/events') && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              In Hand Salary Calculator
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
