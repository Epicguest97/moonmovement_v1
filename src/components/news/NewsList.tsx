import { API_BASE_URL } from '@/config';
import React, { useState, useEffect } from 'react';
import NewsCard, { NewsItem } from './NewsCard';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock } from 'lucide-react';

const NewsList = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'trending' | 'latest' | 'funding'>('trending');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/news`);
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const newsData = await response.json();
        // Make sure newsData is an array before setting it
        if (Array.isArray(newsData)) {
          setNews(newsData);
        } else {
          console.error('Expected an array of news items but got:', newsData);
          setError('Received invalid data format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Startup News</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-300">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Startup News</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400">Error: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-sidebar-primary hover:bg-sidebar-primary/90"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Ensure news is an array before rendering
  const newsItems = Array.isArray(news) ? news : [];

  const handleSortChange = (newSort: 'trending' | 'latest' | 'funding') => {
    setSortBy(newSort);
  };

  // Sort news based on selected sort criteria
  const sortedNews = [...newsItems].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'funding':
        // Sort by funding if available (this is placeholder logic)
        const fundingA = a.funding ? parseFloat(a.funding.replace(/[^\d.-]/g, '')) : 0;
        const fundingB = b.funding ? parseFloat(b.funding.replace(/[^\d.-]/g, '')) : 0;
        return fundingB - fundingA;
      case 'trending':
      default:
        // Default trending logic (could be based on views or other metrics)
        return 0; // Maintain original order for now
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Startup News</h2>
      </div>

      {/* Sort Controls + News List - Combined */}
      <div className="space-y-0">
        {/* Sort Controls with rounded top corners */}
        <div className="bg-sidebar border border-sidebar-border rounded-t-lg border-b-0">
          <div className="flex p-3 gap-2">
            <Button 
              variant={sortBy === 'trending' ? 'default' : 'ghost'} 
              size="sm" 
              className={sortBy === 'trending' ? 'bg-primary text-primary-foreground' : ''}
              onClick={() => handleSortChange('trending')}
            >
              <TrendingUp size={16} className="mr-2" />
              Trending
            </Button>
            <Button 
              variant={sortBy === 'latest' ? 'default' : 'ghost'} 
              size="sm" 
              className={sortBy === 'latest' ? 'bg-primary text-primary-foreground' : ''}
              onClick={() => handleSortChange('latest')}
            >
              <Clock size={16} className="mr-2" />
              Latest
            </Button>
            <Button 
              variant={sortBy === 'funding' ? 'default' : 'ghost'} 
              size="sm" 
              className={sortBy === 'funding' ? 'bg-primary text-primary-foreground' : ''}
              onClick={() => handleSortChange('funding')}
            >
              <TrendingUp size={16} className="mr-2" />
              Funding
            </Button>
          </div>
        </div>

        {/* News List with only bottom rounded corners on last item */}
        {sortedNews.length > 0 ? (
          <div className="overflow-hidden border border-sidebar-border rounded-b-lg">
            {sortedNews.map((item, index) => (
              <NewsCard 
                key={item.id}
                news={item}
                isFirst={false} /* No item should have top rounded corners */
                isLast={index === sortedNews.length - 1}
              />
            ))}
          </div>
        ) : (
          <div className="bg-sidebar/30 p-8 border border-sidebar-border rounded-lg text-center">
            <p className="text-muted-foreground">No news items available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;
