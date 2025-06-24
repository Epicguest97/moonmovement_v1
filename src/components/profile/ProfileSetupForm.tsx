import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const ProfileSetupForm = () => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    // If username is stored from signup, use it
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      // Remove displayName since it's not in your schema
      // formData.append('displayName', name);
      
      // Instead, if you want to update a name field, use the field that exists in your schema
      // For example, if you have a "name" field:
      formData.append('name', name);
      
      formData.append('bio', bio);
      if (profilePhoto) formData.append('profileImage', profilePhoto);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      // Important: Don't set Content-Type header when using FormData
      const res = await fetch('https://moonmovement.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Let the browser set the Content-Type with proper boundary
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create profile');

      // Update user state
      updateUser({
        bio,
        profileImage: data.user?.profileImage || data.profileImage,
      });
      
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Full-screen background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ 
        backgroundImage: "url('/setupprofile.jpeg')",
        backgroundSize: 'cover'
      }} />
      
      {/* Content overlay */}
      <div className="relative z-10 flex h-full w-full">
        {/* Left side - Text area */}
        <div className="hidden md:flex md:w-3/5 items-center justify-center p-8">
          {/* You could add some welcome text or graphics here */}
        </div>
        
        {/* Right side - Profile setup form */}
        <div className="w-full md:w-2/5 flex items-center justify-center py-12 px-4 md:px-8">
          <Card className="w-full max-w-md bg-sidebar/90 border-sidebar-border backdrop-blur-sm max-h-[85vh] overflow-y-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">Complete Your Profile</CardTitle>
              <CardDescription className="text-gray-400">
                Let's set up your profile before you start exploring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-sidebar-accent border-sidebar-border text-white"
                  />
                </div>
                
                {/* Bio field */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-sidebar-accent border-sidebar-border text-white min-h-[80px]"
                  />
                </div>

                {/* Profile photo upload */}
                <div className="space-y-2">
                  <Label htmlFor="profilePhoto" className="text-white">Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    {profilePhotoPreview && (
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img 
                          src={profilePhotoPreview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <Input
                      id="profilePhoto"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="bg-sidebar-accent border-sidebar-border text-white"
                    />
                  </div>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}
                
                <Button 
                  type="submit" 
                  className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating profile...' : 'Complete Profile Setup'}
                </Button>
                
                <div className="text-center">
                  <Button
                    variant="ghost" 
                    onClick={() => navigate('/')}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Skip for now
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupForm;