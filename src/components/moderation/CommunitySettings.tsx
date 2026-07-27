import { API_BASE_URL } from '@/config';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Community {
  id: number;
  name: string;
  description: string;
  bannerImage?: string;
  icon?: string;
}

interface CommunitySettingsProps {
  community: Community;
  onCommunityUpdate: (updatedCommunity: Community) => void;
}

const CommunitySettings = ({ community, onCommunityUpdate }: CommunitySettingsProps) => {
  const [formData, setFormData] = useState({
    name: community.name,
    description: community.description,
    bannerImage: community.bannerImage || '',
    icon: community.icon || ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add the Cloudinary upload function
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'moonmovement');
    
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/deb30prxc/image/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // Update the handleImageUpload function
  const handleImageUpload = async (field: 'bannerImage' | 'icon', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        // Upload to Cloudinary
        const imageUrl = await uploadImageToCloudinary(file);
        handleInputChange(field, imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/community/${community.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedCommunity = await response.json();
        onCommunityUpdate(updatedCommunity);
        toast({
          title: "Success",
          description: "Community settings updated successfully"
        });
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
        description: "Failed to update community settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-sidebar border-sidebar-border">
      <CardHeader>
        <CardTitle className="text-sidebar-foreground">Community Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sidebar-foreground">Community Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-sidebar-foreground">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
              rows={3}
            />
          </div>
        </div>

        {/* Banner Image */}
        <div className="space-y-4">
          <Label className="text-sidebar-foreground">Banner Image</Label>
          {formData.bannerImage && (
            <div className="relative">
              <img 
                src={formData.bannerImage} 
                alt="Banner preview" 
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('bannerImage', e)}
              className="hidden"
              id="banner-upload"
            />
            <Label 
              htmlFor="banner-upload"
              className="cursor-pointer flex items-center gap-2 bg-sidebar-primary hover:bg-sidebar-primary/90 text-white px-4 py-2 rounded-md"
            >
              <Upload size={16} />
              Upload Banner
            </Label>
            <Input
              placeholder="Or paste image URL"
              value={formData.bannerImage}
              onChange={(e) => handleInputChange('bannerImage', e.target.value)}
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
            />
          </div>
        </div>

        {/* Community Icon */}
        <div className="space-y-4">
          <Label className="text-sidebar-foreground">Community Icon</Label>
          {formData.icon && (
            <div className="relative">
              <img 
                src={formData.icon} 
                alt="Icon preview" 
                className="w-16 h-16 object-cover rounded-full"
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('icon', e)}
              className="hidden"
              id="icon-upload"
            />
            <Label 
              htmlFor="icon-upload"
              className="cursor-pointer flex items-center gap-2 bg-sidebar-primary hover:bg-sidebar-primary/90 text-white px-4 py-2 rounded-md"
            >
              <Upload size={16} />
              Upload Icon
            </Label>
            <Input
              placeholder="Or paste image URL"
              value={formData.icon}
              onChange={(e) => handleInputChange('icon', e.target.value)}
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
            />
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90"
        >
          <Save size={16} className="mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CommunitySettings;
