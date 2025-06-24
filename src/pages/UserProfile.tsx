import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Cake, MapPin, MessageSquare, Users, TrendingUp, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Better check that handles "undefined" string too
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
    if (!username) return;
    
    if (!isLoggedIn) {
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
        const chatRoom = await response.json();
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
    if (!username) return;
    
    if (!isLoggedIn) {
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
      <MainLayout>
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="text-center">
            <p className="text-sidebar-foreground">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto p-2 sm:p-4">
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

  return (
    <MainLayout hideChat={true}>
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Profile Header */}
        <Card className="mb-4 sm:mb-6 bg-sidebar border-sidebar-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <Avatar className="h-16 w-16 sm:h-24 sm:w-24 mx-auto sm:mx-0">
                <AvatarFallback className="bg-sidebar-primary text-white text-lg sm:text-2xl">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-sidebar-foreground">u/{profile.username}</h1>
                  {!isCurrentUser && (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddFriend}
                        disabled={addingFriend}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
                        size="sm"
                      >
                        <UserPlus size={16} className="mr-2" />
                        {addingFriend ? 'Adding...' : 'Add Friend'}
                      </Button>
                      <Button
                        onClick={handleStartChat}
                        disabled={startingChat}
                        className="bg-sidebar-primary hover:bg-sidebar-primary/80 text-white text-sm sm:text-base"
                        size="sm"
                      >
                        <MessageSquare size={16} className="mr-2" />
                        {startingChat ? 'Starting Chat...' : 'Start Chat'}
                      </Button>
                    </div>
                  )}
                </div>
                
                {isCurrentUser && (
                  <p className="text-sm text-sidebar-primary mb-2">This is your profile</p>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-300 mb-4 text-sm">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <Calendar size={16} />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      <MapPin size={16} />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
                
                {profile.bio && (
                  <p className="text-gray-300 text-sm sm:text-base">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp size={24} className="text-blue-400 sm:h-8 sm:w-8" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-sidebar-foreground">{profile.karma}</div>
              <div className="text-gray-300 text-xs sm:text-sm">Karma</div>
            </CardContent>
          </Card>
          
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageSquare size={24} className="text-green-400 sm:h-8 sm:w-8" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-sidebar-foreground">{profile._count.posts}</div>
              <div className="text-gray-300 text-xs sm:text-sm">Posts</div>
            </CardContent>
          </Card>
          
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageSquare size={24} className="text-green-400 sm:h-8 sm:w-8" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-sidebar-foreground">{profile._count.comments}</div>
              <div className="text-gray-300 text-xs sm:text-sm">Comments</div>
            </CardContent>
          </Card>
          
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users size={24} className="text-purple-400 sm:h-8 sm:w-8" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-sidebar-foreground">{profile._count.communityMemberships}</div>
              <div className="text-gray-300 text-xs sm:text-sm">Communities</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList className="bg-sidebar border border-sidebar-border w-full grid grid-cols-3">
            <TabsTrigger value="posts" className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground text-xs sm:text-sm">
              Posts ({profile.posts.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground text-xs sm:text-sm">
              Comments ({profile.comments.length})
            </TabsTrigger>
            <TabsTrigger value="communities" className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground text-xs sm:text-sm">
              Communities ({profile.communityMemberships.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            <Card className="bg-sidebar border-sidebar-border">
              <CardContent className="p-4 sm:p-6">
                {profile.posts.length > 0 ? (
                  <div className="space-y-4">
                    {profile.posts.map((post) => (
                      <div key={post.id} className="border-b border-sidebar-border pb-4 last:border-b-0">
                        <h3 className="font-semibold text-sidebar-foreground mb-2 text-sm sm:text-base">{post.title}</h3>
                        {post.content && (
                          <p className="text-gray-300 text-xs sm:text-sm mb-2 line-clamp-3">{post.content.substring(0, 200)}...</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-400">
                          <Badge variant="outline" className="border-sidebar-border text-gray-300 text-xs">
                            r/{post.subreddit}
                          </Badge>
                          <span>{formatDate(post.createdAt)}</span>
                          <span>{post.votes.reduce((sum, vote) => sum + vote.type, 0)} votes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">{isCurrentUser ? "You haven't posted anything yet." : "No posts yet."}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comments">
            <Card className="bg-sidebar border-sidebar-border">
              <CardContent className="p-4 sm:p-6">
                {profile.comments.length > 0 ? (
                  <div className="space-y-4">
                    {profile.comments.map((comment) => (
                      <div key={comment.id} className="border-b border-sidebar-border pb-4 last:border-b-0">
                        <div className="text-xs text-gray-400 mb-2">
                          Commented on "{comment.post.title}" in r/{comment.post.subreddit}
                        </div>
                        <p className="text-sidebar-foreground text-xs sm:text-sm mb-2">{comment.content}</p>
                        <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">{isCurrentUser ? "You haven't commented yet." : "No comments yet."}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="communities">
            <Card className="bg-sidebar border-sidebar-border">
              <CardContent className="p-4 sm:p-6">
                {profile.communityMemberships.length > 0 ? (
                  <div className="grid gap-4">
                    {profile.communityMemberships.map((membership) => (
                      <div key={membership.community.id} className="p-3 sm:p-4 border border-sidebar-border rounded-lg">
                        <h3 className="font-semibold text-sidebar-foreground text-sm sm:text-base">r/{membership.community.name}</h3>
                        <p className="text-gray-300 text-xs sm:text-sm">{membership.community.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">{isCurrentUser ? "You haven't joined any communities yet." : "No communities joined yet."}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
