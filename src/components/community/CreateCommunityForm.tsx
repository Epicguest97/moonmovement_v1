import { API_BASE_URL } from '@/config';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface CreateCommunityFormProps {
  onCommunityCreated?: (community: any) => void;
}

const CreateCommunityForm = ({ onCommunityCreated }: CreateCommunityFormProps) => {
  const { isLoggedIn } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bannerImage: '',
    icon: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setError('You must be logged in to create a community');
      return;
    }
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Name and description are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create community');
      }

      const newCommunity = await response.json();
      console.log('Community created:', newCommunity);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        bannerImage: '',
        icon: ''
      });

      if (onCommunityCreated) {
        onCommunityCreated(newCommunity);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create community');
      console.error('Error creating community:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Card className="bg-sidebar border-sidebar-border">
        <CardContent className="p-6 text-center">
          <p className="text-sidebar-foreground mb-4">You must be logged in to create a community</p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-sidebar-primary hover:bg-sidebar-primary/90"
          >
            Login to Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-sidebar border-sidebar-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sidebar-foreground">
          <Plus size={20} />
          Create New Community
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sidebar-foreground">Community Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., programming, gaming, cooking"
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sidebar-foreground">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what your community is about..."
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="bannerImage" className="text-sidebar-foreground">Banner Image URL</Label>
            <Input
              id="bannerImage"
              name="bannerImage"
              value={formData.bannerImage}
              onChange={handleInputChange}
              placeholder="https://example.com/banner.jpg"
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
            />
          </div>

          <div>
            <Label htmlFor="icon" className="text-sidebar-foreground">Icon URL</Label>
            <Input
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              placeholder="https://example.com/icon.jpg"
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
          >
            {isSubmitting ? 'Creating...' : 'Create Community'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateCommunityForm;
