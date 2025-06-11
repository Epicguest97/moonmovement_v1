import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Link as LinkIcon, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  source: string;
  category: string;
  url: string;
  imageUrl?: string;
  funding?: string;
  company?: string;
  tags?: string[];
}

interface NewsCardProps {
  news: NewsItem;
  isFirst?: boolean;
  isLast?: boolean;
}

const NewsCard = ({ news, isFirst = false, isLast = false }: NewsCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={`news-card overflow-hidden bg-sidebar border-0
      ${!isFirst && !isLast ? "rounded-none" : ""}
      ${isFirst && !isLast ? "rounded-t-lg rounded-b-none" : ""}
      ${!isFirst && isLast ? "rounded-b-lg rounded-t-none" : ""}
      ${isFirst && isLast ? "" : ""}
    `}>
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
            <div className="hidden md:block md:w-1/4">
              <img 
                src={news.imageUrl} 
                alt={news.title} 
                className="w-full h-48 md:h-full object-cover"
              />
            </div>
          )}
          
          <CardContent className={`flex-1 p-3 sm:p-4 ${news.imageUrl ? 'md:w-3/4' : 'w-full'}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
              <span className="bg-sidebar-accent text-sidebar-accent-foreground px-2 py-0.5 rounded text-xs">
                {news.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(news.publishedAt)}
              </span>
              <span className="text-gray-500">{news.source}</span>
            </div>
            
            <Link to={`/news/${news.id}`} className="block">
              <h3 className="text-base sm:text-lg font-bold mb-2 text-white hover:text-sidebar-primary cursor-pointer transition-colors">
                {news.title}
              </h3>
            </Link>
            
            <p className="text-xs sm:text-sm text-gray-300 mb-4 line-clamp-3 sm:line-clamp-2">{news.summary}</p>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <a 
                href={news.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-sidebar-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <LinkIcon size={12} />
                Read full story
              </a>
              
              <div className="flex gap-2">
                <Link to={`/news/${news.id}`} className="flex-1 sm:flex-none">
                  <Button variant="outline" size="sm" className="text-xs border-sidebar-border bg-transparent text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full sm:w-auto">
                    Read More
                  </Button>
                </Link>
                
                <Button variant="outline" size="sm" className="text-xs border-sidebar-border bg-transparent text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={(e) => e.stopPropagation()}>
                  <Share size={12} className="mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
      
      {/* Add the subtle divider line only between news items (not after the last one) */}
      {!isLast && (
        <div className="mx-8 h-[0.5px] bg-gray-700/50"></div>
      )}
    </Card>
  );
};

export default NewsCard;
