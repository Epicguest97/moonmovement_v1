
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="container mx-auto flex flex-1 px-2 sm:px-4 py-2 sm:py-4 gap-2 sm:gap-4">
        <main className="flex-1 min-w-0">{children}</main>
        {!isMobile && (
          <div className="hidden lg:block w-80">
            <Sidebar />
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
