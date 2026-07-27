import { API_BASE_URL } from '@/config';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, User, Lock, Mail, Save } from 'lucide-react';

const Settings = () => {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  // Profile settings
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Account settings
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [accountLoading, setAccountLoading] = useState(false);
  
  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName,
          bio,
          location
        })
      });
      
      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/account`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          email
        })
      });
      
      if (response.ok) {
        toast({
          title: "Account updated",
          description: "Your account details have been updated successfully.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update account');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update account',
        variant: "destructive",
      });
    } finally {
      setAccountLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      if (response.ok) {
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully.",
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-sidebar-foreground">Please Log In</h2>
              <p className="text-gray-300 mb-4">You need to be logged in to access settings.</p>
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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon size={24} className="text-sidebar-foreground" />
          <h1 className="text-2xl font-bold text-sidebar-foreground">Settings</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-sidebar border border-sidebar-border">
            <TabsTrigger value="profile" className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground">
              <User size={16} className="mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground">
              <Mail size={16} className="mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="password" className="data-[state=active]:bg-sidebar-accent text-sidebar-foreground">
              <Lock size={16} className="mr-2" />
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-sidebar border-sidebar-border">
              <CardHeader>
                <CardTitle className="text-sidebar-foreground">Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="displayName" className="text-sidebar-foreground">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                      placeholder="Your display name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio" className="text-sidebar-foreground">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location" className="text-sidebar-foreground">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                      placeholder="Your location"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={profileLoading}
                    className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
                  >
                    <Save size={16} className="mr-2" />
                    {profileLoading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="bg-sidebar border-sidebar-border">
              <CardHeader>
                <CardTitle className="text-sidebar-foreground">Account Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAccountUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-sidebar-foreground">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                      placeholder="Your username"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sidebar-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                      placeholder="Your email"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={accountLoading}
                    className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
                  >
                    <Save size={16} className="mr-2" />
                    {accountLoading ? 'Saving...' : 'Save Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card className="bg-sidebar border-sidebar-border">
              <CardHeader>
                <CardTitle className="text-sidebar-foreground">Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-sidebar-foreground">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword" className="text-sidebar-foreground">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sidebar-foreground">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={passwordLoading}
                    className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
                  >
                    <Lock size={16} className="mr-2" />
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
