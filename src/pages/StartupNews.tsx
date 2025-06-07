
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import StartupNewsList from '@/components/startup/StartupNewsList';

const StartupNews = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 sm:mb-6 px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Startup News</h1>
          <p className="text-gray-400 text-sm sm:text-base">Latest news and updates from the startup world</p>
        </div>
        <StartupNewsList />
      </div>
    </MainLayout>
  );
};

export default StartupNews;
