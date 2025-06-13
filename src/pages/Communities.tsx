
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
      const response = await fetch('https://moonmovement.onrender.com/api/community');
      
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
                `https://moonmovement.onrender.com/api/community/${community.id}/membership`,
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
      
      const response = await fetch(`https://moonmovement.onrender.com/api/community/${communityId}/${endpoint}`, {
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
        <div className="container mx-auto py-8">
          <div className="text-center">
            <p className="text-sidebar-foreground">Loading communities...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sidebar-foreground mb-4">Communities</h1>
          
          {/* Search and Create */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-sidebar border-sidebar-border text-sidebar-foreground"
              />
            </div>
            {isLoggedIn && (
              <Button 
                onClick={() => navigate('/create-community')}
                className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Community
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="text-red-400 mb-4 text-center">
            {error}
          </div>
        )}

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

        {filteredCommunities.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No communities found</p>
            {searchTerm && (
              <p className="text-gray-500">Try adjusting your search terms</p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Communities;
