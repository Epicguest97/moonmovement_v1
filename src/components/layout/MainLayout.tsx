
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
      return 'w-full px-4 max-w-full overflow-x-hidden';
    }
    
    // Desktop spacing - middle component should be 50% of screen width
    if (location.pathname === '/chat') {
      return 'w-full max-w-[50vw] mx-auto px-4';
    }
    
    // For pages with sidebar, account for the fixed 256px sidebar + 80px left margin + 20px gap
    // Then use 50% of remaining space for content
    if (showDesktopSidebar) {
      return 'w-[50vw] ml-[356px] pr-8 max-w-[50vw]';
    }
    
    // For pages without sidebar (like chat) - center and limit to 50% width
    return 'w-full max-w-[50vw] mx-auto px-4';
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
        <Header onToggleMobileSidebar={toggleMobileSidebar} />
      </div>
      
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
          <div className="w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
