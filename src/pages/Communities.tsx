import { API_BASE_URL } from '@/config';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Community {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  onlineCount: number;
  bannerImage?: string;
  icon?: string;
  createdAt: string;
}

interface CommunityWithJoinStatus extends Community {
  isJoined: boolean;
}

const Communities = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [communities, setCommunities] = useState<CommunityWithJoinStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunities();
  }, [isLoggedIn]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/community`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch communities');
      }
      
      const communitiesData = await response.json();
      
      // Check join status for each community if user is logged in
      if (isLoggedIn) {
        const token = localStorage.getItem('token');
        const communitiesWithStatus = await Promise.all(
          communitiesData.map(async (community: Community) => {
            try {
              const membershipResponse = await fetch(
                `${API_BASE_URL}/community/${community.id}/membership`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              
              if (membershipResponse.ok) {
                const membershipData = await membershipResponse.json();
                return { ...community, isJoined: membershipData.isMember };
              }
              return { ...community, isJoined: false };
            } catch (err) {
              console.error('Error checking membership for community:', community.name, err);
              return { ...community, isJoined: false };
            }
          })
        );
        setCommunities(communitiesWithStatus);
      } else {
        setCommunities(communitiesData.map((community: Community) => ({ ...community, isJoined: false })));
      }
    } catch (err) {
      console.error('Error fetching communities:', err);
      setError('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async (communityId: number, isCurrentlyJoined: boolean) => {
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = isCurrentlyJoined ? 'leave' : 'join';
      const method = isCurrentlyJoined ? 'DELETE' : 'POST';
      
      const response = await fetch(`${API_BASE_URL}/community/${communityId}/${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Update the community status locally
        setCommunities(prev => prev.map(community => 
          community.id === communityId 
            ? { 
                ...community, 
                isJoined: !isCurrentlyJoined,
                memberCount: community.memberCount + (isCurrentlyJoined ? -1 : 1)
              }
            : community
        ));
      } else {
        throw new Error('Failed to update membership');
      }
    } catch (err) {
      console.error('Error updating membership:', err);
      setError('Failed to update membership');
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMemberCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
          {/* Hero Section Skeleton */}
          <div className="relative rounded-lg overflow-hidden h-[350px]">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/community.jpeg)',
                backgroundPosition: 'center 30%'
              }}
            >
            </div>
            <div className="relative z-10 p-8 text-white h-full flex flex-col justify-between">
              <div className="absolute top-6 right-6 flex gap-4 animate-pulse">
                <div className="text-center bg-sidebar/60 backdrop-blur-sm border border-sidebar-border/50 rounded-lg px-3 py-2">
                  <div className="h-6 bg-white/20 rounded w-12 mb-1"></div>
                  <div className="h-4 bg-white/20 rounded w-16"></div>
                </div>
              </div>
              
              <div className="w-full">
                <div className="h-10 bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-300">Loading communities...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Hero Section */}
        <div className="relative rounded-lg overflow-hidden h-[350px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/community.jpeg)',
              backgroundPosition: 'center 30%'
            }}
          >
          </div>
          <div className="relative z-10 p-6 pb-5 text-white flex flex-col justify-end h-full">
            {/* Stats in top right */}
            <div className="absolute top-6 right-6 flex gap-4">
              <div className="text-center bg-sidebar/60 hover:bg-sidebar/80 backdrop-blur-sm border border-sidebar-border/50 rounded-lg px-3 py-2 transition-all duration-300">
                <div className="text-lg font-bold text-purple-400">{communities.length}</div>
                <div className="text-xs text-gray-200 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Communities
                </div>
              </div>
            </div>

            {/* Full Width Glassy Search bar */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                <Input 
                  placeholder="Search communities..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-sidebar/60 hover:bg-sidebar/80 border-sidebar-border/50 text-white placeholder:text-gray-300 rounded-full px-4 py-2 text-sm backdrop-blur-sm w-full pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="bg-sidebar/30 border border-sidebar-border rounded-lg p-4">
            <p className="text-foreground break-words">
              Showing results for: <span className="font-semibold break-all">"{searchTerm}"</span>
              {filteredCommunities.length > 0 && (
                <span className="text-muted-foreground ml-2">({filteredCommunities.length} results)</span>
              )}
            </p>
          </div>
        )}

        {/* Single Communities Container */}
        <div className="space-y-0 w-full max-w-full">
          {/* Header section with rounded top corners */}
          <div className="bg-sidebar border border-sidebar-border rounded-t-lg border-b-0 overflow-x-hidden">
            <div className="border-t border-sidebar-border p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-sidebar-foreground">Communities</h1>
                  <p className="text-muted-foreground text-sm">Discover and join amazing communities</p>
                </div>
                {isLoggedIn && (
                  <Button 
                    onClick={() => navigate('/create-community')}
                    className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Community
                  </Button>
                )}
              </div>
              
              <div className="text-xs text-gray-400 mt-2">
                Showing {filteredCommunities.length} communities
              </div>
            </div>
          </div>

          {/* Communities Content */}
          {error && (
            <div className="bg-sidebar border border-sidebar-border rounded-b-lg border-t-0 p-4">
              <div className="text-red-400 text-center">
                {error}
              </div>
            </div>
          )}

          {filteredCommunities.length === 0 && !loading ? (
            <div className="bg-sidebar border border-sidebar-border rounded-b-lg border-t-0 p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Communities Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No communities match your search criteria.' : 'Be the first to create a community!'}
              </p>
            </div>
          ) : (
            <div className="bg-sidebar border border-sidebar-border rounded-b-lg border-t-0 p-6">
              {/* Communities Grid - 2 per row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCommunities.map((community) => (
                  <Card key={community.id} className="overflow-hidden bg-sidebar border-sidebar-border hover:border-sidebar-primary/50 transition-all duration-200">
                    {/* Banner */}
                    <div 
                      className="h-24 bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80"
                      style={community.bannerImage ? { 
                        backgroundImage: `url(${community.bannerImage})`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center' 
                      } : {}}
                    />
                    
                    <CardContent className="relative pt-8 pb-4">
                      {/* Community Icon */}
                      <div className="absolute -top-6 left-4">
                        <div className="w-12 h-12 bg-sidebar-primary text-white rounded-full flex items-center justify-center border-4 border-sidebar">
                          {community.icon ? (
                            <img src={community.icon} alt={community.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold">r/</span>
                          )}
                        </div>
                      </div>

                      <div className="ml-16">
                        <h3 
                          className="text-xl font-bold text-sidebar-foreground mb-2 cursor-pointer hover:text-sidebar-primary"
                          onClick={() => navigate(`/r/${community.name}`)}
                        >
                          r/{community.name}
                        </h3>
                        
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{community.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{formatMemberCount(community.memberCount)} members</span>
                          </div>
                          <div>
                            <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => handleJoinLeave(community.id, community.isJoined)}
                          className={community.isJoined 
                            ? "w-full bg-gray-600 hover:bg-gray-700 text-white" 
                            : "w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
                          }
                          size="sm"
                        >
                          {community.isJoined ? 'Leave' : 'Join'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Communities;
