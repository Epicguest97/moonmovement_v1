import React, { useState } from 'react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import FloatingChatWidget from '@/components/chat/FloatingChatWidget';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import '@/styles/theme.css';
import DownloadApp from './DownloadApp';

interface MainLayoutProps {
  children: React.ReactNode;
  hideChat?: boolean;
  rightSidebar?: React.ReactNode;
  mainContentClassName?: string; // Add this prop
  sidebarClassName?: string; // Add this prop
}

const MainLayout = ({ 
  children, 
  hideChat = false, 
  rightSidebar,
  mainContentClassName = "max-w-3xl", // Default value
  sidebarClassName = "w-72" // Default value
}: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const isPostDetailPage = location.pathname.startsWith('/post/');
  
  const showDesktopSidebar = !isMobile;
  const showMobileSidebar = isMobile && mobileSidebarOpen;

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className={`flex flex-col min-h-screen bg-background ${isMobile ? 'mobile-layout' : ''}`}>
      <div className="fixed top-0 left-0 right-0 z-50 bg-background" style={{ 
        backgroundColor: '#111114',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Header onToggleMobileSidebar={toggleMobileSidebar} />
      </div>
      
      <div className="flex w-full pt-16 relative">
        {showDesktopSidebar && <LeftSidebar />}
        
        {showMobileSidebar && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-sidebar-border z-40 md:hidden overflow-y-auto">
              <LeftSidebar />
            </div>
          </>
        )}
        
        <div className={`flex-1 ${showDesktopSidebar ? 'ml-[356px]' : ''} ${isMobile ? 'w-full overflow-x-hidden' : ''}`}>
          <div className="flex justify-center">
            <main className={`relative min-h-[calc(100vh-4rem)] pt-4 w-full ${isMobile ? 'px-0' : 'pr-8'} ${isMobile ? 'max-w-full' : mainContentClassName}`}>
              <div className="w-full max-w-full overflow-x-hidden">
                {children}
              </div>
            </main>
            
            {!isMobile && (
              <aside className={`hidden xl:block ${sidebarClassName} pt-4 pr-8`}>
                <div className="sticky top-20">
                  {rightSidebar || <DownloadApp />}
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {!isMobile && !hideChat && <FloatingChatWidget />}
    </div>
  );
};

export default MainLayout;
