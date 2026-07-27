import { API_BASE_URL } from '@/config';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Ban, UserX, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BannedUser {
  id: number;
  reason?: string;
  duration?: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
  };
  bannedByUser: {
    username: string;
  };
}

interface UserManagementProps {
  subreddit: string;
  canManageUsers: boolean;
}

const UserManagement = ({ subreddit, canManageUsers }: UserManagementProps) => {
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banForm, setBanForm] = useState({
    username: '',
    reason: '',
    duration: 'permanent'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (canManageUsers) {
      fetchBannedUsers();
    }
  }, [subreddit, canManageUsers]);

  const fetchBannedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/moderation/${subreddit}/banned`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBannedUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch banned users:', err);
    }
  };

  const handleBanUser = async () => {
    if (!banForm.username.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/moderation/${subreddit}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(banForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User banned successfully"
        });
        setBanDialogOpen(false);
        setBanForm({ username: '', reason: '', duration: 'permanent' });
        fetchBannedUsers();
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
        description: "Failed to ban user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/moderation/${subreddit}/ban/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User unbanned successfully"
        });
        fetchBannedUsers();
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
        description: "Failed to unban user",
        variant: "destructive"
      });
    }
  };

  if (!canManageUsers) return null;

  return (
    <Card className="bg-sidebar border-sidebar-border">
      <CardHeader>
        <CardTitle className="text-sidebar-foreground flex items-center gap-2">
          <Shield size={20} />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ban User Section */}
        <div className="flex justify-between items-center">
          <h3 className="text-sidebar-foreground font-medium">Banned Users</h3>
          <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Ban size={16} className="mr-2" />
                Ban User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-sidebar border-sidebar-border">
              <DialogHeader>
                <DialogTitle className="text-sidebar-foreground">Ban User</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Ban a user from this community. This will prevent them from posting or commenting.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-sidebar-foreground">Username</Label>
                  <Input
                    id="username"
                    value={banForm.username}
                    onChange={(e) => setBanForm({ ...banForm, username: e.target.value })}
                    placeholder="Enter username to ban"
                    className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration" className="text-sidebar-foreground">Ban Duration</Label>
                  <Select value={banForm.duration} onValueChange={(value) => setBanForm({ ...banForm, duration: value })}>
                    <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-sidebar border-sidebar-border">
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="reason" className="text-sidebar-foreground">Reason</Label>
                  <Textarea
                    id="reason"
                    value={banForm.reason}
                    onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                    placeholder="Reason for ban (optional)"
                    className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleBanUser}
                  disabled={loading || !banForm.username.trim()}
                >
                  Ban User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Banned Users List */}
        <div className="space-y-2">
          {bannedUsers.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No banned users</p>
          ) : (
            bannedUsers.map((ban) => (
              <Card key={ban.id} className="bg-sidebar-accent border-sidebar-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sidebar-foreground font-medium">u/{ban.user.username}</div>
                      <div className="text-sm text-gray-400">
                        Banned by u/{ban.bannedByUser.username} • {ban.duration} • {new Date(ban.createdAt).toLocaleDateString()}
                      </div>
                      {ban.reason && (
                        <div className="text-sm text-gray-400 mt-1">Reason: {ban.reason}</div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnbanUser(ban.user.id)}
                      className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <UserX size={16} className="mr-1" />
                      Unban
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
