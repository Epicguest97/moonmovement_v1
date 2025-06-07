
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import CreatePostCard from '@/components/post/CreatePostCard';
import PostCard, { Post } from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, TrendingUp, Clock } from 'lucide-react';

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get search query from URL params
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
        
        // Transform the data to match our expected format
        const transformedPosts: Post[] = data.map((post: any) => ({
          ...post,
          id: post.id.toString(),
          voteScore: post.votes?.length || 0,
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

  // Get unique subreddits for trending
  const subreddits = useMemo(() => {
    const subs = posts.map(post => post.subreddit || 'general');
    return Array.from(new Set(subs));
  }, [posts]);

  // Filter and sort posts
  const sortedPosts = useMemo(() => {
    let filtered = [...posts];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(post => {
        const authorName = typeof post.author === 'string' ? post.author : post.author.username;
        return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
               post.subreddit.toLowerCase().includes(searchQuery.toLowerCase()) ||
               authorName.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'new':
        return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      case 'top':
        return filtered.sort((a, b) => b.voteScore - a.voteScore);
      case 'hot':
      default:
        // Hot could be a combination of votes and recency, for now just return as is
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
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-sidebar p-6 md:p-8 border border-sidebar-border rounded-md text-center">
            <h2 className="text-lg md:text-xl font-bold mb-2 text-white">Loading posts...</h2>
            <p className="text-sm md:text-base text-gray-300">Please wait while we fetch the latest content.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-sidebar p-6 md:p-8 border border-sidebar-border rounded-md text-center">
            <h2 className="text-lg md:text-xl font-bold mb-2 text-red-400">Error</h2>
            <p className="text-sm md:text-base text-gray-300 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} size="sm" className="md:size-default">
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4">
        <CreatePostCard />
        
        <Tabs defaultValue="posts" className="mb-4">
          <TabsList className="bg-sidebar border border-sidebar-border rounded-md p-1 h-auto w-full">
            <TabsTrigger 
              value="posts"
              className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground py-2 h-auto flex-1 text-sm md:text-base"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="trending"
              className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground py-2 h-auto flex-1 text-sm md:text-base"
            >
              Trending
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            {/* Sort Controls */}
            <div className="bg-sidebar border border-sidebar-border rounded-md mb-4">
              <div className="flex p-2 gap-1 overflow-x-auto">
                <Button 
                  variant={sortBy === 'hot' ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`${sortBy === 'hot' ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'} flex-shrink-0 text-xs md:text-sm`}
                  onClick={() => handleSortChange('hot')}
                >
                  <Flame size={14} className="mr-1" />
                  Hot
                </Button>
                <Button 
                  variant={sortBy === 'new' ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`${sortBy === 'new' ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'} flex-shrink-0 text-xs md:text-sm`}
                  onClick={() => handleSortChange('new')}
                >
                  <Clock size={14} className="mr-1" />
                  New
                </Button>
                <Button 
                  variant={sortBy === 'top' ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`${sortBy === 'top' ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'} flex-shrink-0 text-xs md:text-sm`}
                  onClick={() => handleSortChange('top')}
                >
                  <TrendingUp size={14} className="mr-1" />
                  Top
                </Button>
              </div>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="bg-sidebar border border-sidebar-border rounded-md mb-4 p-3">
                <p className="text-sidebar-foreground text-xs md:text-sm break-words">
                  Showing results for: <span className="font-semibold">"{searchQuery}"</span>
                  {sortedPosts.length > 0 && (
                    <span className="text-gray-400 ml-2">({sortedPosts.length} results)</span>
                  )}
                </p>
              </div>
            )}
            
            {/* Posts List */}
            {sortedPosts.length > 0 ? (
              <div className="space-y-4">
                {sortedPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-sidebar p-6 md:p-8 border border-sidebar-border rounded-md text-center">
                <p className="text-gray-400 text-sm md:text-base">
                  {searchQuery ? 'No posts match your search.' : 'No posts available yet.'}
                </p>
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    className="mt-2" 
                    size="sm"
                    onClick={() => navigate('/home')}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="trending">
            <div className="bg-sidebar border border-sidebar-border rounded-md">
              <h3 className="text-base md:text-lg font-medium p-4 border-b border-sidebar-border text-sidebar-foreground">
                Trending Communities
              </h3>
              <div className="p-2">
                {subreddits.length > 0 ? (
                  subreddits.slice(0, 5).map((subreddit, index) => (
                    <div 
                      key={subreddit} 
                      className="p-3 hover:bg-sidebar-accent rounded-md cursor-pointer transition-colors"
                      onClick={() => handleCommunityClick(subreddit)}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="font-bold text-xs md:text-sm">{index + 1}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium hover:underline text-sidebar-foreground text-sm md:text-base truncate">
                            r/{subreddit}
                          </div>
                          <p className="text-xs text-gray-400">
                            {Math.floor(Math.random() * 1000) + 100} members online
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm md:text-base">
                    No communities available yet.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Index;
