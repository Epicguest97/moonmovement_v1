
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StartupNewsItem } from '@/types/startupNews';

interface StartupNewsCardProps {
  news: StartupNewsItem;
}

const StartupNewsCard = ({ news }: StartupNewsCardProps) => {
  return (
    <Card className="overflow-hidden bg-sidebar border-sidebar-border hover:border-sidebar-primary transition-all duration-200">
      <div className="flex flex-col">
        {news.imageUrl && (
          <div className="w-full md:hidden">
            <img 
              src={news.imageUrl} 
              alt={news.title} 
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row">
          {news.imageUrl && (
            <div className="hidden md:block md:w-1/3">
              <img 
                src={news.imageUrl} 
                alt={news.title} 
                className="w-full h-48 md:h-full object-cover"
              />
            </div>
          )}
          
          <CardContent className={`flex-1 p-4 sm:p-6 ${news.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-3">
              <span className="bg-sidebar-primary text-sidebar-primary-foreground px-2 py-1 rounded text-xs font-medium">
                {news.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {news.publishedAt}
              </span>
              {news.funding && (
                <span className="flex items-center gap-1 text-green-400">
                  <TrendingUp size={12} />
                  {news.funding}
                </span>
              )}
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-white hover:text-sidebar-primary cursor-pointer">
              {news.title}
            </h3>
            
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-300">{news.company}</span>
            </div>
            
            <p className="text-sm text-gray-300 mb-4 line-clamp-3 sm:line-clamp-2">{news.summary}</p>
            
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
              {news.tags && news.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-sidebar-accent text-sidebar-accent-foreground px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <a 
                href={news.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-sidebar-primary hover:underline"
              >
                <ExternalLink size={12} />
                Read full story
              </a>
              
              <Button variant="outline" size="sm" className="text-xs border-sidebar-border bg-transparent text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default StartupNewsCard;
