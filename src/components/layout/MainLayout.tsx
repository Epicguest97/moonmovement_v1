import React, { useState } from 'react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import FloatingChatWidget from '@/components/chat/FloatingChatWidget';
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
  
  // Check if we're on a post detail page for mobile styling
  const isPostDetailPage = location.pathname.startsWith('/post/');
  
  // Show sidebar on all pages except chat (which no longer exists as a page)
  const showDesktopSidebar = !isMobile;
  const showMobileSidebar = isMobile && mobileSidebarOpen;

  // Adjust the main content positioning to accommodate the fixed sidebar
  const getMainContentClasses = () => {
    if (isMobile) {
      if (isPostDetailPage) {
        return 'mobile-full-width mobile-post-container';
      }
      return 'w-full px-4 max-w-full overflow-x-hidden';
    }
    
    // Use margin-left to create space for the fixed sidebar
    if (showDesktopSidebar) {
      return 'w-[50vw] ml-[356px] pr-8 max-w-[50vw] mt-0';
    }
    
    return 'w-full max-w-[50vw] mx-auto px-4';
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className={`flex flex-col min-h-screen bg-background ${isMobile && isPostDetailPage ? 'mobile-post-detail' : ''}`}>
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background" style={{ 
        backgroundColor: isMobile && isPostDetailPage ? '#000000' : '#111114',
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
          <div className={`w-full max-w-full overflow-x-hidden ${isMobile && isPostDetailPage ? 'mobile-text-fix' : ''}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
};

export default MainLayout;
