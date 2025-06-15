import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Link2Icon, X } from 'lucide-react';
import FileUploader from '@/components/ui/FileUploader';

interface Community {
  id: number;
  name: string;
  description: string;
  memberCount: number;
}

const Submit = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) {
      navigate('/auth');
    }
  }, [username, navigate]);

  // Fetch communities on component mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setCommunitiesLoading(true);
        const response = await fetch('https://moonmovement.onrender.com/api/community');
        
        if (response.ok) {
          const data = await response.json();
          setCommunities(data);
        } else {
          console.error('Failed to fetch communities');
        }
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setCommunitiesLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  // Simple fallback - convert to base64 (not recommended for production)
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    try {
      // For now, let's use base64 as a fallback
      // In production, you should use a proper image hosting service
      const base64Url = await convertToBase64(files[0]);
      setImageUrl(base64Url);
      setUploadedFiles(files);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token || !username) {
      alert('You must be signed in to create a post.');
      navigate('/auth');
      return;
    }

    if (!selectedCommunity) {
      alert('Please select a community.');
      return;
    }

    setLoading(true);
    
    const postData = {
      title,
      content,
      subreddit: selectedCommunity,
      imageUrl: imageUrl || undefined,
      linkUrl: linkUrl || undefined,
      tags: tags.length > 0 ? tags.join(',') : null,
    };

    try {
      const response = await fetch('https://moonmovement.onrender.com/api/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        navigate('/');
      } else {
        const errorData = await response.json();
        alert('Failed to submit post: ' + (errorData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error submitting post:', err);
      alert('Failed to submit post');
    } finally {
      setLoading(false);
    }
  };

  if (!username) return null;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-lg font-medium mb-4 text-sidebar-foreground">Create a post</h1>
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-4 bg-sidebar border-sidebar-border">
            <div className="p-4 border-b border-sidebar-border">
              <Select 
                value={selectedCommunity} 
                onValueChange={setSelectedCommunity}
                disabled={communitiesLoading}
              >
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                  <SelectValue placeholder={communitiesLoading ? "Loading communities..." : "Choose a community"} />
                </SelectTrigger>
                <SelectContent className="bg-sidebar border-sidebar-border">
                  {communities.map((community) => (
                    <SelectItem 
                      key={community.id} 
                      value={community.name}
                      className="text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>r/{community.name}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          {community.memberCount} members
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Title */}
              <div>
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-gray-400"
                  maxLength={300}
                  required
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {title.length}/300
                </div>
              </div>

              {/* Tags */}
              <div>
                <Input
                  placeholder="Add tags (press Enter to add)"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-gray-400"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-sidebar-accent text-sidebar-foreground">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-400"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <Textarea
                  placeholder="Text (optional)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] resize-y bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-gray-400"
                />
              </div>

              {/* Image Upload */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={16} className="text-gray-400" />
                  <label className="text-sm text-gray-400">Upload Image</label>
                </div>
                
                {isUploading && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <p className="text-sm text-gray-400 mt-2">Processing image...</p>
                  </div>
                )}
                
                {!imageUrl && !isUploading && (
                  <FileUploader 
                    onFilesSelected={handleFilesSelected}
                    maxFiles={1}
                    maxSizeMB={10}
                  />
                )}
                
                {/* Show uploaded image preview */}
                {imageUrl && (
                  <div className="mt-4 relative">
                    <div className="relative aspect-video bg-sidebar-accent rounded-md overflow-hidden max-w-md">
                      <img 
                        src={imageUrl} 
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button"
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 rounded-full p-1.5"
                        onClick={() => {
                          setImageUrl('');
                          setUploadedFiles([]);
                        }}
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Link URL */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link2Icon size={16} className="text-gray-400" />
                  <label className="text-sm text-gray-400">Link URL (optional)</label>
                </div>
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-gray-400"
                  type="url"
                />
              </div>
            </div>
          </Card>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
              disabled={!title.trim() || !selectedCommunity || loading || isUploading}
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default Submit;
