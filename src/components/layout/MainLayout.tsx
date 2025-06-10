import React, { useEffect } from 'react';
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

  // Prevent body overscrolling
  useEffect(() => {
    // Save original overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // Prevent overscroll on the entire page
    document.body.style.overflow = 'hidden';
    
    // Create a container with scrolling that doesn't overscroll
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.style.overflow = 'auto';
      mainContent.style.height = '100vh';
      mainContent.style.position = 'relative';
    }
    
    return () => {
      // Restore original overflow style when component unmounts
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background">
        <Header />
      </div>
      <div className="flex flex-1 pt-16"> {/* Add padding-top to prevent content from being hidden behind the fixed header */}
        {showSidebar && <LeftSidebar />}
        <main className={`flex-1 min-w-0 relative ${showSidebar ? 'ml-72' : ''}`}>
          <div className={`container mx-auto px-4 py-6 ${showSidebar ? 'max-w-4xl mr-80' : ''}`}>
            <div className="overflow-hidden overscroll-none">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

