import React, { useState, useEffect, useRef } from 'react';
import { X, Image, Video, Link as LinkIcon, List, Smile, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import FileUploader from '@/components/ui/FileUploader';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PollOption {
  id: string;
  text: string;
}

type MediaType = 'image' | 'video' | 'link' | 'poll' | null;

const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeMediaType, setActiveMediaType] = useState<MediaType>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: '1', text: '' }, { id: '2', text: '' }
  ]);
  const [subreddit, setSubreddit] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [communities, setCommunities] = useState<{id: number, name: string, memberCount: number}[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useAuth();
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch communities
  useEffect(() => {
    if (isOpen && step === 2) {
      fetchCommunities();
    }
  }, [isOpen, step]);

  const fetchCommunities = async () => {
    try {
      const response = await fetch('https://moonmovement.onrender.com/api/community');
      if (response.ok) {
        const data = await response.json();
        setCommunities(data);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setContent('');
    setActiveMediaType(null);
    setImageUrl('');
    setVideoUrl('');
    setLinkUrl('');
    setPollQuestion('');
    setPollOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
    setSubreddit('general');
    setUploadedFiles([]);
    setSelectedCommunity(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (title.trim()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  // Auto-adjust textarea height
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    if (titleInputRef.current) {
      adjustTextareaHeight(titleInputRef.current);
    }
  }, [title]);

  useEffect(() => {
    if (contentInputRef.current) {
      adjustTextareaHeight(contentInputRef.current);
    }
  }, [content]);

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const toggleMediaType = (type: MediaType) => {
    setActiveMediaType(activeMediaType === type ? null : type);
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      const newId = (pollOptions.length + 1).toString();
      setPollOptions([...pollOptions, { id: newId, text: '' }]);
    }
  };

  const removePollOption = (id: string) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter(option => option.id !== id));
    }
  };

  const updatePollOption = (id: string, text: string) => {
    setPollOptions(pollOptions.map(option => 
      option.id === id ? { ...option, text } : option
    ));
  };

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

  const uploadToImgur = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID YOUR_IMGUR_CLIENT_ID', // You'll need to get this from Imgur
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      return data.data.link;
    } catch (error) {
      console.error('Error uploading to Imgur:', error);
      throw error;
    }
  };

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
      console.log('Processing file:', files[0].name, 'Size:', (files[0].size / 1024 / 1024).toFixed(2) + 'MB');
      
      // Upload to Cloudinary instead of converting to base64
      const cloudinaryUrl = await uploadImageToCloudinary(files[0]);
      setImageUrl(cloudinaryUrl);
      setUploadedFiles(files);
      
      console.log('Image uploaded successfully to Cloudinary');
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const postData: any = {
        title: title,
        content: content,
        subreddit,
        imageUrl: activeMediaType === 'image' ? imageUrl : null,
        videoUrl: activeMediaType === 'video' ? videoUrl : null,
        linkUrl: activeMediaType === 'link' ? linkUrl : null
      };

      if (activeMediaType === 'poll' && pollQuestion.trim() && pollOptions.some(opt => opt.text.trim())) {
        postData.poll = {
          question: pollQuestion,
          options: pollOptions.filter(opt => opt.text.trim()).map(opt => opt.text)
        };
      }

      const response = await fetch('https://moonmovement.onrender.com/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        handleClose();
        window.location.reload(); // Refresh to show new post
      } else {
        console.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectCommunity = (communityName: string) => {
    setSubreddit(communityName);
    setSelectedCommunity(communityName);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-sidebar border border-sidebar-border rounded-xl shadow-2xl w-[700px] max-w-[95vw] max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {step === 1 ? (
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Create a Post 
              <span className="bg-green-500/20 text-green-500 text-xs px-1.5 py-0.5 rounded-full">✓</span>
            </h2>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep(1)}
                className="h-8 w-8 rounded-full hover:bg-sidebar-accent"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">Select a community</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content */}
        {step === 1 ? (
          <div className="flex flex-col">
            {/* Unified input area */}
            <div className="p-6 space-y-0 flex-1 min-h-[300px]">
              <div className="flex flex-col mb-5">
                <textarea
                  ref={titleInputRef}
                  placeholder="What would you like to share?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={1}
                  className="w-full text-lg resize-none border-0 focus:ring-0 bg-transparent focus:outline-none placeholder-gray-500 mb-4"
                  maxLength={300}
                />
                
                <textarea
                  ref={contentInputRef}
                  placeholder="Add more details... (optional)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={1}
                  className="w-full text-base resize-none border-0 focus:ring-0 bg-transparent focus:outline-none placeholder-gray-500/70 pt-2"
                />
              </div>

              {/* Media inputs */}
              {activeMediaType === 'image' && (
                <div className="mt-4">
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
                      maxSizeMB={2}
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
                          className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 rounded-full p-1.5"
                          onClick={() => {
                            setImageUrl('');
                            setUploadedFiles([]);
                          }}
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Size: {(uploadedFiles[0].size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Other media types would go here */}
            </div>

            {/* Divider */}
            <div className="h-px bg-sidebar-border w-full"></div>

            {/* Footer */}
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleMediaType('image')} 
                  className={`text-gray-400 hover:text-gray-200 ${activeMediaType === 'image' ? 'text-primary' : ''}`}
                >
                  <Image className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => toggleMediaType('video')} 
                  className={`text-gray-400 hover:text-gray-200 ${activeMediaType === 'video' ? 'text-primary' : ''}`}
                >
                  <Video className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => toggleMediaType('link')} 
                  className={`text-gray-400 hover:text-gray-200 ${activeMediaType === 'link' ? 'text-primary' : ''}`}
                >
                  <LinkIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => toggleMediaType('poll')} 
                  className={`text-gray-400 hover:text-gray-200 ${activeMediaType === 'poll' ? 'text-primary' : ''}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
              
              <Button
                onClick={() => title.trim() ? setStep(2) : null}
                className={`px-6 py-2 rounded-full transition-all duration-200 ${
                  title.trim() ? 'bg-primary hover:bg-primary/90' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!title.trim()}
              >
                Next &rarr;
              </Button>
            </div>
          </div>
        ) : (
          /* Community selection UI */
          <div className="p-6 space-y-4">
            <div className="mb-2 text-sm text-gray-400">
              Choose a community for your post
            </div>
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {communities.map((community) => (
                <div 
                  key={community.id}
                  onClick={() => selectCommunity(community.name)}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    selectedCommunity === community.name
                      ? 'bg-primary/20 border-primary'
                      : 'bg-sidebar-accent/30 border-sidebar-border hover:border-primary'
                  } cursor-pointer`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center mr-3">
                      <span className="text-white font-bold">r/</span>
                    </div>
                    <div>
                      <div className="font-medium">r/{community.name}</div>
                      <div className="text-xs text-gray-400">{community.memberCount} members</div>
                    </div>
                  </div>
                  
                  {selectedCommunity === community.name && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              
              {communities.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Loading communities...
                </div>
              )}
            </div>
            
            {/* Post button (only enabled if community is selected) */}
            <div className="flex justify-end pt-4 border-t border-sidebar-border mt-4">
              <Button
                disabled={!selectedCommunity || isSubmitting}
                onClick={handleSubmit}
                className={`px-8 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCommunity && !isSubmitting
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </div>
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePostModal;
