
import React from 'react';
import { Newspaper, Search } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import NewsList from '@/components/news/NewsList';
import { Input } from '@/components/ui/input';

const News = () => {
  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Hero Section */}
        <div className="relative rounded-lg overflow-hidden h-[350px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/news.jpeg)',
              backgroundPosition: 'center 30%'
            }}
          >
          </div>
          <div className="relative z-10 p-6 pb-5 text-white flex flex-col justify-end h-full">
            {/* Stats in top right */}
            <div className="absolute top-6 right-6 flex gap-4">
              <div className="text-center bg-sidebar/60 hover:bg-sidebar/80 backdrop-blur-sm border border-sidebar-border/50 rounded-lg px-3 py-2 transition-all duration-300">
                <div className="text-lg font-bold text-blue-400">Latest</div>
                <div className="text-xs text-gray-200 flex items-center gap-1">
                  <Newspaper className="w-3 h-3" />
                  News
                </div>
              </div>
            </div>

            {/* Full Width Glassy Search bar */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                <Input 
                  placeholder="Search news..." 
                  className="bg-sidebar/60 hover:bg-sidebar/80 border-sidebar-border/50 text-white placeholder:text-gray-300 rounded-full px-4 py-2 text-sm backdrop-blur-sm w-full pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Single News Container */}
        <div className="space-y-0 w-full max-w-full">
          {/* News Content */}
          <div className="bg-sidebar border border-sidebar-border rounded-lg p-6">
            <NewsList />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default News;
