
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ExternalLink, Share, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  createdAt: string;
  subreddit: string;
  author: {
    username: string;
  };
}

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Fetch all posts and find the specific news item
        const response = await fetch('https://moonmovement.onrender.com/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const allPosts = await response.json();
        
        // Find the specific news item by ID
        const newsData = allPosts.find((post: NewsItem) => post.id === parseInt(id));
        if (!newsData) {
          throw new Error('News article not found');
        }
        
        setNewsItem(newsData);
        
        // Get related news (other posts, excluding current one)
        const related = allPosts
          .filter((post: NewsItem) => post.id !== parseInt(id))
          .slice(0, 3);
        setRelatedNews(related);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share && newsItem) {
      navigator.share({
        title: newsItem.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
          {/* Hero Section Skeleton */}
          <div className="relative rounded-lg overflow-hidden h-[200px]">
            <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80"></div>
            <div className="relative z-10 p-6 text-white flex items-center justify-center h-full">
              <p className="text-lg">Loading news article...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !newsItem) {
    return (
      <MainLayout>
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
          {/* Hero Section */}
          <div className="relative rounded-lg overflow-hidden h-[200px]">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800"></div>
            <div className="relative z-10 p-6 text-white flex flex-col items-center justify-center h-full">
              <h2 className="text-2xl font-bold mb-4">News article not found</h2>
              <p className="text-gray-200 text-center mb-4">
                {error || "The news article you're looking for doesn't exist or has been removed."}
              </p>
              <Button 
                onClick={() => navigate('/news')} 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-red-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Hero Section with News Title */}
        <div className="relative rounded-lg overflow-hidden h-[300px]">
          {newsItem.imageUrl ? (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${newsItem.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80"></div>
          )}
          
          <div className="relative z-10 p-6 text-white flex flex-col justify-between h-full">
            {/* Back button */}
            <div className="flex justify-between items-start">
              <Button 
                onClick={() => navigate('/news')} 
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Button>
              
              <Button 
                onClick={handleShare}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Title and meta info */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-200 mb-3">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  r/{newsItem.subreddit}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(newsItem.createdAt)}
                </span>
                <span>by u/{newsItem.author.username}</span>
              </div>
              
              <h1 className="text-3xl font-bold leading-tight">{newsItem.title}</h1>
            </div>
          </div>
        </div>

        {/* Single News Container */}
        <div className="space-y-0 w-full max-w-full">
          {/* News Content */}
          <div className="bg-sidebar border border-sidebar-border rounded-lg p-6">
            {/* Content */}
            <div className="prose prose-invert max-w-none mb-6">
              {newsItem.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-300 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center justify-between border-t border-sidebar-border pt-4">
              {newsItem.linkUrl ? (
                <a 
                  href={newsItem.linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sidebar-primary hover:underline"
                >
                  <ExternalLink size={16} />
                  Read the original article
                </a>
              ) : (
                <div></div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleShare}
                  variant="outline" 
                  className="border-sidebar-border bg-transparent text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Share size={16} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            {/* Related News */}
            {relatedNews.length > 0 && (
              <div className="mt-8 border-t border-sidebar-border pt-6">
                <h3 className="text-xl font-bold text-white mb-4">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedNews.map(news => (
                    <Card 
                      key={news.id} 
                      className="bg-sidebar-accent border-sidebar-border hover:border-sidebar-primary cursor-pointer transition-all duration-200"
                      onClick={() => navigate(`/news/${news.id}`)}
                    >
                      {news.imageUrl && (
                        <div className="h-32">
                          <img 
                            src={news.imageUrl} 
                            alt={news.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h4 className="font-bold text-white mb-2 line-clamp-2 text-sm">
                          {news.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar size={12} />
                          {formatDate(news.createdAt)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewsDetail;
