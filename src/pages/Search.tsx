import { API_BASE_URL } from '@/config';

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, User, MessageSquare, Users, Calendar } from 'lucide-react';

interface SearchUser {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  _count: {
    posts: number;
    comments: number;
    communityMemberships: number;
  };
}

interface SearchPost {
  id: number;
  title: string;
  content: string;
  subreddit: string;
  createdAt: string;
  author: {
    username: string;
  };
  _count: {
    votes: number;
    comments: number;
  };
}

interface SearchCommunity {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  onlineCount: number;
  createdAt: string;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [communities, setCommunities] = useState<SearchCommunity[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const baseUrl = `${API_BASE_URL}/search`;
      
      // Search users
      const usersResponse = await fetch(`${baseUrl}/users?q=${encodeURIComponent(searchQuery)}`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
      
      // Search posts
      const postsResponse = await fetch(`${baseUrl}/posts?q=${encodeURIComponent(searchQuery)}`);
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData);
      }
      
      // Search communities
      const communitiesResponse = await fetch(`${baseUrl}/communities?q=${encodeURIComponent(searchQuery)}`);
      if (communitiesResponse.ok) {
        const communitiesData = await communitiesResponse.json();
        setCommunities(communitiesData);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setQuery(queryParam);
      performSearch(queryParam);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      performSearch(query);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="mb-6 bg-sidebar border-sidebar-border">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users, posts, and communities..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-sidebar-primary hover:bg-sidebar-primary/90">
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {query && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-sidebar border border-sidebar-border mb-6">
              <TabsTrigger value="users" className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground">
                Users ({users.length})
              </TabsTrigger>
              <TabsTrigger value="posts" className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground">
                Posts ({posts.length})
              </TabsTrigger>
              <TabsTrigger value="communities" className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground">
                Communities ({communities.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="space-y-4">
                {users.length > 0 ? (
                  users.map((user) => (
                    <Card key={user.id} className="bg-sidebar border-sidebar-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-sidebar-primary text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <Link to={`/u/${user.username}`} className="text-lg font-semibold text-sidebar-foreground hover:text-sidebar-primary">
                              u/{user.username}
                            </Link>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <MessageSquare size={14} />
                                {user._count.posts} posts
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare size={14} />
                                {user._count.comments} comments
                              </span>
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                {user._count.communityMemberships} communities
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Joined {formatDate(user.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <User size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No users found for "{query}"</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="posts">
              <div className="space-y-4">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <Card key={post.id} className="bg-sidebar border-sidebar-border">
                      <CardContent className="p-4">
                        <Link to={`/post/${post.id}`} className="block">
                          <h3 className="text-lg font-semibold text-sidebar-foreground hover:text-sidebar-primary mb-2">
                            {post.title}
                          </h3>
                          {post.content && (
                            <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                              {post.content.substring(0, 200)}...
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <Badge variant="outline" className="border-sidebar-border text-gray-300">
                              r/{post.subreddit}
                            </Badge>
                            <span>by u/{post.author.username}</span>
                            <span>{post._count.votes} votes</span>
                            <span>{post._count.comments} comments</span>
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No posts found for "{query}"</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="communities">
              <div className="space-y-4">
                {communities.length > 0 ? (
                  communities.map((community) => (
                    <Card key={community.id} className="bg-sidebar border-sidebar-border">
                      <CardContent className="p-4">
                        <Link to={`/r/${community.name}`} className="block">
                          <h3 className="text-lg font-semibold text-sidebar-foreground hover:text-sidebar-primary mb-2">
                            r/{community.name}
                          </h3>
                          <p className="text-gray-300 text-sm mb-3">{community.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{community.memberCount} members</span>
                            <span>{community.onlineCount} online</span>
                            <span>Created {formatDate(community.createdAt)}</span>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No communities found for "{query}"</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;
