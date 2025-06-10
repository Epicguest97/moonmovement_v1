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

  // Prevent body overscrolling and hide scrollbar
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
      
      // Hide scrollbar across different browsers
      (mainContent.style as any).msOverflowStyle = 'none';  // IE and Edge
      mainContent.style.scrollbarWidth = 'none';   // Firefox
      
      // For WebKit browsers (Chrome, Safari, newer Edge)
      const style = document.createElement('style');
      style.textContent = `
        main::-webkit-scrollbar {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // Restore original overflow style when component unmounts
      document.body.style.overflow = originalStyle;
      // Remove the added style element
      const addedStyle = document.querySelector('style');
      if (addedStyle) {
        addedStyle.remove();
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background">
        <Header />
      </div>
      <div className="flex flex-1 pt-16"> 
        {showSidebar && <LeftSidebar />}
        <div className="w-full flex justify-center">
          <main className={`w-[50%] min-w-0 relative overflow-auto`}>
            <div className="py-6">
              <div className="overflow-hidden overscroll-none">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

