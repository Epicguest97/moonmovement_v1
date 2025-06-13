import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostCard, { Post } from '@/components/post/PostCard';
import CreatePostModal from '@/components/post/CreatePostModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, TrendingUp, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('https://moonmovement.onrender.com/api/posts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        const transformedPosts: Post[] = data.map((post: any) => ({
          ...post,
          id: post.id.toString(),
          voteScore: post.likeCount || 0, // Use likeCount from backend
          commentCount: post.comments?.length || 0,
          timestamp: new Date(post.createdAt).toLocaleString(),
          subreddit: post.subreddit || 'general'
        }));
        
        setPosts(transformedPosts);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('Failed to load posts. Please try again.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const subreddits = useMemo(() => {
    const subs = posts.map(post => post.subreddit || 'general');
    return Array.from(new Set(subs));
  }, [posts]);

  const sortedPosts = useMemo(() => {
    let filtered = [...posts];
    
    if (searchQuery) {
      filtered = filtered.filter(post => {
        const authorName = typeof post.author === 'string' ? post.author : post.author.username;
        return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
               post.subreddit.toLowerCase().includes(searchQuery.toLowerCase()) ||
               authorName.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    switch (sortBy) {
      case 'new':
        return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      case 'top':
        return filtered.sort((a, b) => b.voteScore - a.voteScore);
      case 'hot':
      default:
        return filtered;
    }
  }, [sortBy, searchQuery, posts]);

  const handleSortChange = (newSort: 'hot' | 'new' | 'top') => {
    setSortBy(newSort);
  };

  const handleCommunityClick = (communityName: string) => {
    navigate(`/r/${communityName}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full max-w-full">
          <div className="bg-sidebar/50 p-8 border border-sidebar-border rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2 text-foreground">Loading posts...</h2>
            <p className="text-muted-foreground">Please wait while we fetch the latest content.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="w-full max-w-full">
          <div className="bg-sidebar/50 p-8 border border-sidebar-border rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2 text-red-400">Error</h2>
            <p className="text-muted-foreground mb-4 break-words">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Hero Section with natural landscape background - TALLER VERSION */}
        <div className="relative rounded-lg overflow-hidden h-[400px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/banner.jpeg)',
              backgroundPosition: 'center 30%'
            }}
          >
          </div>
          <div className="relative z-10 p-6 pb-5 text-white flex flex-col justify-end h-full">
            <div className="text-xs opacity-90">02:23 PM</div>
            <h1 className="text-xl font-medium mb-2">Build It!</h1>
            
            {/* Embed the input box directly in the hero section */}
            <div onClick={() => setIsCreatePostModalOpen(true)} className="block">
              <Input 
                placeholder="Create a post..." 
                className="bg-sidebar/60 hover:bg-sidebar/80 border-sidebar-border/50 cursor-pointer text-white placeholder:text-gray-300 rounded-full px-4 py-2 text-sm backdrop-blur-sm w-full"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="bg-sidebar/30 border border-sidebar-border rounded-lg p-4">
            <p className="text-foreground break-words">
              Showing results for: <span className="font-semibold break-all">"{searchQuery}"</span>
              {sortedPosts.length > 0 && (
                <span className="text-muted-foreground ml-2">({sortedPosts.length} results)</span>
              )}
            </p>
          </div>
        )}
        
        {/* Sort Controls + Posts List - Combined */}
        <div className="space-y-0 w-full max-w-full"> 
          {/* Sort Controls with rounded top corners */}
          <div className="bg-sidebar border border-sidebar-border rounded-t-lg border-b-0 overflow-x-hidden">
            <div className="flex p-3 gap-2 flex-wrap">
              <Button 
                variant={sortBy === 'hot' ? 'default' : 'ghost'} 
                size="sm" 
                className={sortBy === 'hot' ? 'bg-primary text-primary-foreground' : ''}
                onClick={() => handleSortChange('hot')}
              >
                <Flame size={16} className="mr-2" />
                Popular
              </Button>
              <Button 
                variant={sortBy === 'new' ? 'default' : 'ghost'} 
                size="sm" 
                className={sortBy === 'new' ? 'bg-primary text-primary-foreground' : ''}
                onClick={() => handleSortChange('new')}
              >
                <Clock size={16} className="mr-2" />
                New
              </Button>
              <Button 
                variant={sortBy === 'top' ? 'default' : 'ghost'} 
                size="sm" 
                className={sortBy === 'top' ? 'bg-primary text-primary-foreground' : ''}
                onClick={() => handleSortChange('top')}
              >
                <TrendingUp size={16} className="mr-2" />
                Top
              </Button>
            </div>
          </div>

          {/* Posts List with only bottom rounded corners on last post */}
          {sortedPosts.length > 0 ? (
            <div className="overflow-hidden border border-sidebar-border rounded-b-lg w-full">
              {sortedPosts.map((post, index) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  isFirst={false} /* No post should have top rounded corners */
                  isLast={index === sortedPosts.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="bg-sidebar/30 p-8 border border-sidebar-border rounded-lg text-center w-full">
              <p className="text-muted-foreground break-words">
                {searchQuery ? 'No posts match your search.' : 'No posts available yet.'}
              </p>
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  className="mt-4" 
                  onClick={() => navigate('/')}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
    </MainLayout>
  );
};

export default Index;
