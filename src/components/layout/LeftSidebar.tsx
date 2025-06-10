
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
  Calculator,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LeftSidebar = () => {
  const location = useLocation();

  const navigationItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: Home,
    },
    { 
      name: 'Salaries', 
      path: '/salary', 
      icon: DollarSign,
    },
    { 
      name: 'Careers', 
      path: '/careers', 
      icon: Briefcase,
      hasDropdown: true
    },
    { 
      name: 'Sectors', 
      path: '/sectors', 
      icon: Building2,
      hasDropdown: true
    },
    { 
      name: "What's Happening", 
      path: '/news', 
      icon: TrendingUp,
      hasDropdown: true
    },
    { 
      name: 'Interests', 
      path: '/communities', 
      icon: Heart,
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

  const exploreItems = [
    { name: 'Explore Posts', path: '/explore-posts' },
    { name: 'Explore Communities', path: '/communities' },
    { name: 'Explore Companies', path: '/startup-news' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed left-4 top-20 w-64 bg-sidebar border border-sidebar-border rounded-lg shadow-lg h-[calc(100vh-6rem)] overflow-y-auto z-10">
      <div className="p-4">
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

        {/* Separator */}
        <div className="my-4 border-t border-sidebar-border"></div>

        {/* Explore Section */}
        <div>
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

        {/* In Hand Salary Calculator */}
        <div className="mt-4">
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
