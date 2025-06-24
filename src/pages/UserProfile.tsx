import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, MessageSquare, Users, TrendingUp, UserPlus, Link, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';

interface UserProfileData {
  id: number;
  username: string;
  createdAt: string;
  karma: number;
  bio?: string;
  location?: string;
  posts: Array<{
    id: number;
    title: string;
    content: string;
    subreddit: string;
    createdAt: string;
    votes: Array<{ type: number }>;
  }>;
  comments: Array<{
    id: number;
    content: string;
    createdAt: string;
    post: {
      title: string;
      subreddit: string;
    };
  }>;
  communityMemberships: Array<{
    community: {
      id: number;
      name: string;
      description: string;
    };
  }>;
  _count: {
    posts: number;
    comments: number;
    votes: number;
    communityMemberships: number;
  };
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingChat, setStartingChat] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username || username === "undefined") {
        setError("Invalid username");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://moonmovement.onrender.com/api/auth/user/${username}`);
        
        if (response.ok) {
          const userData = await response.json();
          setProfile(userData);
        } else if (response.status === 404) {
          setError('User not found');
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStartChat = async () => {
    if (!username || !isLoggedIn) {
      alert("Please log in to start a chat");
      return;
    }
    
    try {
      setStartingChat(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://moonmovement.onrender.com/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        navigate('/chat');
      } else {
        console.error('Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setStartingChat(false);
    }
  };

  const handleAddFriend = async () => {
    if (!username || !isLoggedIn) {
      alert("Please log in to add friends");
      return;
    }
    
    try {
      setAddingFriend(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://moonmovement.onrender.com/api/chat/friends/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        alert(`${username} has been added as a friend!`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add friend');
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      alert('Failed to add friend');
    } finally {
      setAddingFriend(false);
    }
  };

  const isCurrentUser = isLoggedIn && currentUser?.username === username;

  if (loading) {
    return (
      <MainLayout hideChat={true}>
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sidebar-foreground">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout hideChat={true}>
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="bg-sidebar p-6 sm:p-10 rounded-md border border-sidebar-border text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-sidebar-foreground">
              {error === 'User not found' ? 'User Not Found' : 'Error Loading Profile'}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              {error === 'User not found' 
                ? `The user u/${username} doesn't exist or has deleted their account.`
                : 'Unable to load the user profile. Please try again later.'
              }
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Create the user profile sidebar component
  const UserProfileSidebar = (
    <div className="bg-sidebar border border-sidebar-border rounded-lg overflow-hidden w-full">
      {/* Profile Header with Avatar */}
      <div className="p-6 bg-gradient-to-b from-sidebar-accent/30 to-sidebar flex flex-col items-center text-center border-b border-sidebar-border">
        {/* Background image if available */}
        {profile.backgroundImage && (
          <div className="absolute top-0 left-0 right-0 h-32 bg-cover bg-center" style={{ 
            backgroundImage: `url('${profile.backgroundImage}')`,
            opacity: 0.7
          }} />
        )}
        
        <Avatar className="h-24 w-24 mb-4 relative z-10">
          {profile.profileImage ? (
            <AvatarImage src={profile.profileImage} />
          ) : (
            <AvatarFallback className="bg-sidebar-primary text-white text-2xl">
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        
        <h2 className="text-2xl font-bold text-white mb-1 relative z-10">u/{profile.username}</h2>
        
        {/* Karma display */}
        <div className="flex items-center justify-center gap-2 text-sidebar-primary mb-3">
          <TrendingUp size={16} />
          <span className="font-medium">{profile.karma} karma</span>
        </div>
        
        {/* Join date */}
        <div className="text-sm text-gray-300 flex items-center gap-1 mb-4">
          <Calendar size={14} />
          <span>Member since {formatDate(profile.createdAt)}</span>
        </div>
        
        {/* Action Buttons */}
        {!isCurrentUser && (
          <div className="flex w-full gap-2">
            <Button
              onClick={handleStartChat}
              disabled={startingChat}
              className="flex-1 bg-sidebar-primary hover:bg-sidebar-primary/80"
              size="sm"
            >
              <MessageSquare size={16} className="mr-2" />
              {startingChat ? 'Starting...' : 'Message'}
            </Button>
            <Button
              onClick={handleAddFriend}
              disabled={addingFriend}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <UserPlus size={16} className="mr-2" />
              {addingFriend ? 'Adding...' : 'Follow'}
            </Button>
          </div>
        )}
        
        {isCurrentUser && (
          <Button
            onClick={() => navigate('/settings')}
            className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80"
            size="sm"
          >
            Edit Profile
          </Button>
        )}
      </div>
      
      {/* User Bio */}
      {profile.bio && (
        <div className="p-4 border-b border-sidebar-border">
          <h3 className="font-medium text-white mb-2">About</h3>
          <p className="text-gray-300 text-sm">{profile.bio}</p>
        </div>
      )}
      
      {/* Location if available */}
      {profile.location && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin size={16} />
            <span>{profile.location}</span>
          </div>
        </div>
      )}
      
      {/* Stats */}
      <div className="p-4">
        <h3 className="font-medium text-white mb-3">Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <MessageSquare size={16} />
              <span>Posts</span>
            </div>
            <span className="font-medium text-white">{profile._count.posts}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <MessageSquare size={16} />
              <span>Comments</span>
            </div>
            <span className="font-medium text-white">{profile._count.comments}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <Users size={16} />
              <span>Communities</span>
            </div>
            <span className="font-medium text-white">{profile._count.communityMemberships}</span>
          </div>
        </div>
      </div>
      
      {/* Communities */}
      {profile.communityMemberships.length > 0 && (
        <div className="p-4 border-t border-sidebar-border">
          <h3 className="font-medium text-white mb-3">Active In</h3>
          <div className="space-y-2">
            {profile.communityMemberships.slice(0, 5).map((membership) => (
              <div 
                key={membership.community.id}
                className="flex items-center gap-2 text-sm cursor-pointer"
                onClick={() => navigate(`/r/${membership.community.name}`)}
              >
                <div className="w-6 h-6 rounded-full bg-sidebar-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-white">r/</span>
                </div>
                <span className="text-gray-300 hover:text-white">
                  r/{membership.community.name}
                </span>
              </div>
            ))}
            {profile.communityMemberships.length > 5 && (
              <div className="text-sidebar-primary text-sm cursor-pointer hover:underline"
                   onClick={() => setActiveTab("communities")}>
                View all communities →
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <MainLayout 
      hideChat={true} 
      rightSidebar={UserProfileSidebar}
      mainContentClassName="max-w-2xl" // Narrower than default 3xl
      sidebarClassName="w-96" // Wider than default w-72
    >
      <div className="bg-sidebar border border-sidebar-border rounded-lg p-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-sidebar-accent/20 w-full grid grid-cols-2">
            <TabsTrigger 
              value="posts" 
              className="data-[state=active]:bg-sidebar-primary data-[state=active]:text-white"
            >
              Posts ({profile.posts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="data-[state=active]:bg-sidebar-primary data-[state=active]:text-white"
            >
              Comments ({profile.comments.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            {profile.posts.length > 0 ? (
              <div className="space-y-6">
                {profile.posts.map((post) => (
                  <Card key={post.id} className="bg-sidebar-accent/20 border-sidebar-border overflow-hidden">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white text-lg mb-2">{post.title}</h3>
                      {post.content && (
                        <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-sidebar-border text-gray-300">
                            r/{post.subreddit}
                          </Badge>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            {post.votes.reduce((sum, vote) => sum + vote.type, 0)} votes
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>{isCurrentUser ? "You haven't posted anything yet." : "No posts yet."}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="comments" className="mt-6">
            {profile.comments.length > 0 ? (
              <div className="space-y-6">
                {profile.comments.map((comment) => (
                  <Card key={comment.id} className="bg-sidebar-accent/20 border-sidebar-border overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-sidebar-primary">
                          r/{comment.post.subreddit}
                        </div>
                        <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
                      </div>
                      <h4 className="font-medium text-gray-200 mb-2">
                        Re: {comment.post.title}
                      </h4>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>{isCurrentUser ? "You haven't commented yet." : "No comments yet."}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
