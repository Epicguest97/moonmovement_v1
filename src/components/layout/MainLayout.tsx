
import React, { useState } from 'react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import '@/styles/theme.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Show sidebar on all pages except chat and not on mobile (unless mobile menu is open)
  const showDesktopSidebar = !isMobile && location.pathname !== '/chat';
  const showMobileSidebar = isMobile && mobileSidebarOpen;

  // Determine main content width and margins based on path and screen size
  const getMainContentClasses = () => {
    if (isMobile) {
      return 'w-full px-4';
    }
    
    // Desktop spacing - maintain exact distances
    if (location.pathname === '/chat') {
      return 'w-full';
    }
    
    // For pages with sidebar, account for the fixed 256px sidebar + 80px left margin + 20px gap
    if (showDesktopSidebar) {
      return 'w-[calc(100%-356px)] ml-[356px] pr-8';
    }
    
    // For pages without sidebar (like chat)
    return 'w-full max-w-4xl mx-auto px-4';
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background" style={{ 
        backgroundColor: '#111114',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Header />
      </div>
      
      {/* Mobile menu button */}
      {isMobile && (
        <Button
          onClick={toggleMobileSidebar}
          className="fixed top-20 left-4 z-40 bg-sidebar hover:bg-sidebar-accent border border-sidebar-border"
          size="icon"
        >
          {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      )}
      
      <div className="flex w-full pt-16 relative">
        {/* Desktop Sidebar */}
        {showDesktopSidebar && <LeftSidebar />}
        
        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Mobile Sidebar */}
            <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-sidebar-border z-40 md:hidden overflow-y-auto">
              <LeftSidebar />
            </div>
          </>
        )}
        
        {/* Main Content */}
        <main className={`${getMainContentClasses()} relative min-h-[calc(100vh-4rem)] pt-4`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
