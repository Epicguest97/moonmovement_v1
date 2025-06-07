
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Check, Users, Settings, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ModeratorPermissions {
  managePosts: boolean;
  manageUsers: boolean;
  manageSettings: boolean;
}

interface Moderator {
  id: number;
  userId: number;
  permissions: string;
  assignedAt: string;
  user: {
    id: number;
    username: string;
    createdAt: string;
  };
}

interface ModerationAction {
  id: number;
  action: string;
  reason?: string;
  createdAt: string;
  moderator: {
    username: string;
  };
  post?: {
    title: string;
  };
}

interface ModerationPanelProps {
  subreddit: string;
  userPermissions: ModeratorPermissions;
}

const ModerationPanel = ({ subreddit, userPermissions }: ModerationPanelProps) => {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [moderationLog, setModerationLog] = useState<ModerationAction[]>([]);
  const [newModUsername, setNewModUsername] = useState('');
  const [newModPermissions, setNewModPermissions] = useState<ModeratorPermissions>({
    managePosts: false,
    manageUsers: false,
    manageSettings: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchModerators();
    fetchModerationLog();
  }, [subreddit]);

  const fetchModerators = async () => {
    try {
      const response = await fetch(`https://moonmovement.onrender.com/api/moderation/${subreddit}/moderators`);
      if (response.ok) {
        const data = await response.json();
        setModerators(data);
      }
    } catch (err) {
      console.error('Failed to fetch moderators:', err);
    }
  };

  const fetchModerationLog = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://moonmovement.onrender.com/api/moderation/${subreddit}/log`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setModerationLog(data);
      }
    } catch (err) {
      console.error('Failed to fetch moderation log:', err);
    }
  };

  const addModerator = async () => {
    if (!newModUsername.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://moonmovement.onrender.com/api/moderation/${subreddit}/moderators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newModUsername,
          permissions: newModPermissions
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Moderator added successfully"
        });
        setNewModUsername('');
        setNewModPermissions({ managePosts: false, manageUsers: false, manageSettings: false });
        fetchModerators();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add moderator",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeModerator = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://moonmovement.onrender.com/api/moderation/${subreddit}/moderators/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Moderator removed successfully"
        });
        fetchModerators();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove moderator",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="bg-sidebar border-sidebar-border">
      <CardHeader>
        <CardTitle className="text-sidebar-foreground flex items-center gap-2">
          <Settings size={20} />
          Moderation Panel - r/{subreddit}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="moderators" className="w-full">
          <TabsList className="bg-sidebar-accent">
            <TabsTrigger value="moderators" className="data-[state=active]:bg-sidebar text-sidebar-foreground">
              <Users size={16} className="mr-2" />
              Moderators
            </TabsTrigger>
            <TabsTrigger value="log" className="data-[state=active]:bg-sidebar text-sidebar-foreground">
              <History size={16} className="mr-2" />
              Moderation Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moderators" className="space-y-4">
            {userPermissions.manageUsers && (
              <Card className="bg-sidebar-accent border-sidebar-border">
                <CardHeader>
                  <CardTitle className="text-sm text-sidebar-foreground">Add Moderator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-sidebar-foreground">Username</Label>
                    <Input
                      id="username"
                      value={newModUsername}
                      onChange={(e) => setNewModUsername(e.target.value)}
                      placeholder="Enter username"
                      className="bg-sidebar border-sidebar-border text-sidebar-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sidebar-foreground">Permissions</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sidebar-foreground">
                        <input
                          type="checkbox"
                          checked={newModPermissions.managePosts}
                          onChange={(e) => setNewModPermissions({
                            ...newModPermissions,
                            managePosts: e.target.checked
                          })}
                        />
                        <span>Manage Posts</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sidebar-foreground">
                        <input
                          type="checkbox"
                          checked={newModPermissions.manageUsers}
                          onChange={(e) => setNewModPermissions({
                            ...newModPermissions,
                            manageUsers: e.target.checked
                          })}
                        />
                        <span>Manage Users</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sidebar-foreground">
                        <input
                          type="checkbox"
                          checked={newModPermissions.manageSettings}
                          onChange={(e) => setNewModPermissions({
                            ...newModPermissions,
                            manageSettings: e.target.checked
                          })}
                        />
                        <span>Manage Settings</span>
                      </label>
                    </div>
                  </div>
                  
                  <Button onClick={addModerator} disabled={loading}>
                    Add Moderator
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <h3 className="text-sidebar-foreground font-medium">Current Moderators</h3>
              {moderators.map((mod) => {
                const permissions = JSON.parse(mod.permissions);
                return (
                  <Card key={mod.id} className="bg-sidebar-accent border-sidebar-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sidebar-foreground font-medium">u/{mod.user.username}</div>
                          <div className="text-sm text-gray-400">Added {formatDate(mod.assignedAt)}</div>
                          <div className="flex gap-1 mt-1">
                            {permissions.managePosts && <Badge variant="secondary">Posts</Badge>}
                            {permissions.manageUsers && <Badge variant="secondary">Users</Badge>}
                            {permissions.manageSettings && <Badge variant="secondary">Settings</Badge>}
                          </div>
                        </div>
                        {userPermissions.manageUsers && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeModerator(mod.userId)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="log" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sidebar-foreground font-medium">Recent Actions</h3>
              {moderationLog.map((action) => (
                <Card key={action.id} className="bg-sidebar-accent border-sidebar-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sidebar-foreground">
                          <span className="font-medium">u/{action.moderator.username}</span>
                          <span className="ml-2">{action.action.replace('_', ' ')}</span>
                          {action.post && <span className="ml-2">"{action.post.title}"</span>}
                        </div>
                        {action.reason && (
                          <div className="text-sm text-gray-400 mt-1">Reason: {action.reason}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(action.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ModerationPanel;
