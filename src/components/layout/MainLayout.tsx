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
  
  // Show sidebar on all pages except chat and not on mobile
  const showSidebar = !isMobile && location.pathname !== '/chat';

  // Determine main content width based on path
  const mainContentWidth = 
    location.pathname === '/' || location.pathname === '/news'
      ? 'w-[50%]' 
      : location.pathname === '/chat'
        ? 'w-full' // Full width for chat page
        : 'w-full md:w-[80%] lg:w-[70%] xl:w-[60%]';

  // Prevent body overscrolling and hide scrollbar
  useEffect(() => {
    // Set page background color
    document.body.style.backgroundColor = '#0C0C0F';
    
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
        
        /* Custom background colors */
        body {
          background-color: #0C0C0F !important;
        }
        .bg-background {
          background-color: #0C0C0F !important;
        }
        .bg-sidebar, .bg-sidebar-border {
          background-color: #131316 !important;
        }
        header.bg-background, header.backdrop-blur {
          background-color: #111114 !important;
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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#0C0C0F' }}>
      <div className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#111114' }}>
        <Header />
      </div>
      <div className="flex flex-1 pt-16"> 
        {showSidebar && <LeftSidebar />}
        <div className="w-full flex justify-center">
          <main className={`${mainContentWidth} min-w-0 relative overflow-auto`}>
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

