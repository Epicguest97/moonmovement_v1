import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar, Edit, Save, X, TrendingUp, MessageSquare, ThumbsUp, Users } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

interface Community {
  id: number;
  name: string;
  description: string;
  memberCount: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  subreddit: string;
  createdAt: string;
  votes: { type: number }[];
  comments: any[];
}

interface UserActivity {
  id: number;
  activityType: string;
  description: string;
  points: number;
  metadata?: string;
  createdAt: string;
}

interface ActivityStats {
  totalKarma: number;
  posts: number;
  comments: number;
  votes: number;
  communitiesJoined: number;
  activities: UserActivity[];
}

const Profile = () => {
  const { user, isLoggedIn } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Set basic profile from auth context
        setProfile({
          id: typeof user.id === 'number' ? user.id : parseInt(user.id?.toString() || '1'),
          username: user.username,
          email: user.email,
          bio: 'Welcome to my profile!',
          createdAt: new Date().toISOString()
        });

        const token = localStorage.getItem('token');
        
        // Fetch user activities
        if (token) {
          const userId = typeof user.id === 'number' ? user.id : parseInt(user.id?.toString() || '1');
          const activitiesResponse = await fetch(`https://moonmovement.onrender.com/api/user-activity/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (activitiesResponse.ok) {
            const activities = await activitiesResponse.json();
            setActivityStats(activities);
          }

          // Fetch joined communities
          const communitiesResponse = await fetch('https://moonmovement.onrender.com/api/community', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (communitiesResponse.ok) {
            const communities = await communitiesResponse.json();
            setJoinedCommunities(communities.slice(0, 3));
          }
        }

        // Fetch user posts
        const postsResponse = await fetch('https://moonmovement.onrender.com/api/posts');
        if (postsResponse.ok) {
          const posts = await postsResponse.json();
          const filteredPosts = posts.filter((post: any) => post.author.username === user.username);
          setUserPosts(filteredPosts);
        }

      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, user]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedBio('');
    } else {
      setEditedBio(profile?.bio || '');
    }
    setIsEditing(!isEditing);
  };

  const handleSaveBio = () => {
    if (profile) {
      setProfile({ ...profile, bio: editedBio });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateKarma = (posts: Post[]) => {
    return posts.reduce((total, post) => {
      const postKarma = post.votes.reduce((sum, vote) => sum + vote.type, 0);
      return total + postKarma;
    }, 0);
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'post_created':
        return <MessageSquare size={16} className="text-blue-400" />;
      case 'comment_created':
        return <MessageSquare size={16} className="text-green-400" />;
      case 'vote_cast':
        return <ThumbsUp size={16} className="text-orange-400" />;
      case 'community_joined':
        return <Users size={16} className="text-purple-400" />;
      default:
        return <TrendingUp size={16} className="text-gray-400" />;
    }
  };

  const getActivityTypeLabel = (activityType: string) => {
    switch (activityType) {
      case 'post_created':
        return 'Created post';
      case 'comment_created':
        return 'Added comment';
      case 'vote_cast':
        return 'Cast vote';
      case 'community_joined':
        return 'Joined community';
      default:
        return activityType;
    }
  };

  if (!isLoggedIn) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-sidebar-foreground">Please Log In</h2>
              <p className="text-gray-300 mb-4">You need to be logged in to view your profile.</p>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sidebar-foreground">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-sidebar-foreground">Profile Not Found</h2>
              <p className="text-gray-300">Unable to load your profile.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] px-4 py-8">
        {/* Left side - Content area with tabs (scrollable) */}
        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-sidebar border-sidebar-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-sidebar-foreground">{userPosts.length}</div>
                <div className="text-gray-300">Posts</div>
              </CardContent>
            </Card>
            
            <Card className="bg-sidebar border-sidebar-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-sidebar-foreground">
                  {activityStats?.totalKarma || calculateKarma(userPosts)}
                </div>
                <div className="text-gray-300">Karma</div>
              </CardContent>
            </Card>
            
            <Card className="bg-sidebar border-sidebar-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-sidebar-foreground">
                  {activityStats?.comments || 0}
                </div>
                <div className="text-gray-300">Comments</div>
              </CardContent>
            </Card>

            <Card className="bg-sidebar border-sidebar-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-sidebar-foreground">
                  {activityStats?.votes || 0}
                </div>
                <div className="text-gray-300">Votes</div>
              </CardContent>
            </Card>
            
            <Card className="bg-sidebar border-sidebar-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-sidebar-foreground">{joinedCommunities.length}</div>
                <div className="text-gray-300">Communities</div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="posts" className="space-y-4">
            <TabsList className="bg-sidebar border border-sidebar-border sticky top-0 z-10">
              <TabsTrigger value="posts" className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground">
                Posts
              </TabsTrigger>
              <TabsTrigger value="activities" className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground">
                Activity
              </TabsTrigger>
              <TabsTrigger value="communities" className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground">
                Communities
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts">
              <Card className="bg-sidebar border-sidebar-border">
                <CardHeader>
                  <CardTitle className="text-sidebar-foreground">Your Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  {userPosts.length > 0 ? (
                    <div className="space-y-4">
                      {userPosts.map((post) => (
                        <div key={post.id} className="border-b border-sidebar-border pb-4 last:border-b-0">
                          <h3 className="font-semibold text-sidebar-foreground mb-2">{post.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-300">
                            <Badge variant="outline" className="border-sidebar-border text-gray-300">
                              r/{post.subreddit}
                            </Badge>
                            <span>{formatDate(post.createdAt)}</span>
                            <span>{post.votes.reduce((sum, vote) => sum + vote.type, 0)} karma</span>
                            <span>{post.comments.length} comments</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>You haven't posted anything yet.</p>
                      <Button 
                        onClick={() => window.location.href = '/submit'}
                        className="mt-4 bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
                      >
                        Create Your First Post
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activities">
              <Card className="bg-sidebar border-sidebar-border">
                <CardHeader>
                  <CardTitle className="text-sidebar-foreground">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {activityStats?.activities && activityStats.activities.length > 0 ? (
                    <div className="space-y-3">
                      {activityStats.activities.slice(0, 20).map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 p-3 border border-sidebar-border rounded-lg">
                          {getActivityIcon(activity.activityType)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sidebar-foreground font-medium">
                                {getActivityTypeLabel(activity.activityType)}
                              </span>
                              {activity.points > 0 && (
                                <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                                  +{activity.points} karma
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm">{activity.description}</p>
                            <span className="text-gray-500 text-xs">{formatDate(activity.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>No activity recorded yet.</p>
                      <p className="text-sm mt-2">Start posting and commenting to see your activity here!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="communities">
              <Card className="bg-sidebar border-sidebar-border">
                <CardHeader>
                  <CardTitle className="text-sidebar-foreground">Joined Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  {joinedCommunities.length > 0 ? (
                    <div className="grid gap-4">
                      {joinedCommunities.map((community) => (
                        <div key={community.id} className="flex items-center justify-between p-4 border border-sidebar-border rounded-lg">
                          <div>
                            <h3 className="font-semibold text-sidebar-foreground">r/{community.name}</h3>
                            <p className="text-gray-300 text-sm">{community.description}</p>
                            <p className="text-gray-400 text-xs">{community.memberCount} members</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/r/${community.name}`}
                            className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                          >
                            Visit
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>You haven't joined any communities yet.</p>
                      <Button 
                        onClick={() => window.location.href = '/communities'}
                        className="mt-4 bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
                      >
                        Browse Communities
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right side - Profile card (separately scrollable) */}
        <div className="lg:w-96 overflow-y-auto pr-2">
          {/* Profile Header Card */}
          <Card className="mb-6 bg-sidebar border-sidebar-border">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-sidebar-primary text-white text-2xl">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="w-full text-center">
                  <h1 className="text-2xl font-bold text-sidebar-foreground mb-2">{profile.username}</h1>
                  
                  <div className="flex flex-col items-center gap-2 text-gray-300 mb-4">
                    <div className="flex items-center gap-1">
                      <Mail size={16} />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>Joined {formatDate(profile.createdAt)}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditToggle}
                    className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent mb-4"
                  >
                    {isEditing ? <X size={16} /> : <Edit size={16} />}
                    <span className="ml-2">{isEditing ? 'Cancel' : 'Edit Bio'}</span>
                  </Button>
                  
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <Textarea
                        value={editedBio}
                        onChange={(e) => setEditedBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                        rows={3}
                      />
                      <Button
                        onClick={handleSaveBio}
                        className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
                      >
                        <Save size={16} className="mr-2" />
                        Save Bio
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-sidebar-accent/20 p-3 rounded-md">
                      <p className="text-gray-300">{profile.bio || "No bio yet. Click 'Edit Bio' to add one."}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional user info could go here */}
          <Card className="mb-6 bg-sidebar border-sidebar-border">
            <CardHeader>
              <CardTitle className="text-sidebar-foreground">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={() => window.location.href = '/submit'}
                >
                  <MessageSquare size={16} className="mr-2" />
                  Create New Post
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={() => window.location.href = '/communities'}
                >
                  <Users size={16} className="mr-2" />
                  Browse Communities
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={() => window.location.href = '/settings'}
                >
                  <User size={16} className="mr-2" />
                  Account Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
