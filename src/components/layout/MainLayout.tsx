
import React from 'react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Only show sidebar on home page and not on mobile
  const showSidebar = !isMobile && location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-1">
        {showSidebar && <LeftSidebar />}
        <main className={`flex-1 min-w-0 ${showSidebar ? 'ml-72' : ''}`}>
          <div className={`container mx-auto px-4 py-6 ${showSidebar ? 'max-w-4xl mr-80' : ''}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
