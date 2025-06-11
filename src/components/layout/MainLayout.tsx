import React from 'react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import '@/styles/theme.css'; // Import the theme CSS

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Show sidebar on all pages except chat and not on mobile
  const showSidebar = !isMobile && location.pathname !== '/chat';

  // Determine main content width based on path
  const mainContentWidth = 
    location.pathname === '/' || 
    location.pathname === '/news' ||
    location.pathname === '/unicorns-india' || // Hall of Fame
    location.pathname === '/events' ||
    location.pathname === '/communities' ||
    location.pathname === '/districts'
      ? 'w-[50%]' 
      : location.pathname === '/chat'
        ? 'w-full' // Full width for chat page
        : 'w-full md:w-[80%] lg:w-[70%] xl:w-[60%]';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background" style={{ 
        backgroundColor: '#111114',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Header />
      </div>
      
      <div className="flex w-full pt-16"> 
        {showSidebar && <LeftSidebar />}
        
        <div className="w-full flex justify-center overflow-x-hidden">
          <main className={`${mainContentWidth} relative pb-20 pl-0 ml-2`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

