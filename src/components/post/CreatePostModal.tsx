
import React, { useState, useEffect } from 'react';
import { X, Image, Video, Link, List, Smile, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PollOption {
  id: string;
  text: string;
}

const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const [mainContent, setMainContent] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showPollInput, setShowPollInput] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);
  const [subreddit, setSubreddit] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();

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

  // Handle clicking outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const resetForm = () => {
    setMainContent('');
    setAdditionalDetails('');
    setImageUrl('');
    setVideoUrl('');
    setLinkUrl('');
    setShowImageInput(false);
    setShowVideoInput(false);
    setShowLinkInput(false);
    setShowPollInput(false);
    setPollQuestion('');
    setPollOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
    setSubreddit('general');
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

  const handleSubmit = async () => {
    if (!mainContent.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const postData: any = {
        title: mainContent.split('\n')[0] || mainContent.substring(0, 100),
        content: mainContent + (additionalDetails ? '\n\n' + additionalDetails : ''),
        subreddit,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        linkUrl: linkUrl || null
      };

      if (showPollInput && pollQuestion.trim() && pollOptions.some(opt => opt.text.trim())) {
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-sidebar border border-sidebar-border rounded-xl shadow-2xl transform transition-all duration-300 ease-out animate-scale-in"
        style={{
          width: '50vw',
          minWidth: '400px',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Create a Post</h2>
            <span className="text-green-500">✅</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-full hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-4">
          {/* Community Selection */}
          <div>
            <Input
              placeholder="Community (e.g., general, tech, funny)"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              className="bg-sidebar-accent/30 border-sidebar-border"
            />
          </div>

          {/* Main Input */}
          <div>
            <Textarea
              placeholder="What would you like to share?"
              value={mainContent}
              onChange={(e) => setMainContent(e.target.value)}
              className="min-h-[120px] resize-none border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Additional Details */}
          <div>
            <Textarea
              placeholder="Add more details... (optional)"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="min-h-[80px] resize-none border-0 bg-sidebar-accent/30 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
            />
          </div>

          {/* Image Input */}
          {showImageInput && (
            <div>
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-sidebar-accent/30 border-sidebar-border"
              />
            </div>
          )}

          {/* Video Input */}
          {showVideoInput && (
            <div>
              <Input
                placeholder="Video URL (YouTube, Vimeo, etc.)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="bg-sidebar-accent/30 border-sidebar-border"
              />
            </div>
          )}

          {/* Link Input */}
          {showLinkInput && (
            <div>
              <Input
                placeholder="Link URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="bg-sidebar-accent/30 border-sidebar-border"
              />
            </div>
          )}

          {/* Poll Input */}
          {showPollInput && (
            <div className="space-y-3 p-4 bg-sidebar-accent/20 rounded-lg">
              <Input
                placeholder="Poll question"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="bg-sidebar-accent/30 border-sidebar-border"
              />
              {pollOptions.map((option, index) => (
                <div key={option.id} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => updatePollOption(option.id, e.target.value)}
                    className="bg-sidebar-accent/30 border-sidebar-border flex-1"
                  />
                  {pollOptions.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePollOption(option.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {pollOptions.length < 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addPollOption}
                  className="text-primary hover:text-primary/80"
                >
                  + Add Option
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`h-10 w-10 rounded-full hover:bg-sidebar-accent ${showImageInput ? 'bg-sidebar-accent text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Image className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVideoInput(!showVideoInput)}
                className={`h-10 w-10 rounded-full hover:bg-sidebar-accent ${showVideoInput ? 'bg-sidebar-accent text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Video className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className={`h-10 w-10 rounded-full hover:bg-sidebar-accent ${showLinkInput ? 'bg-sidebar-accent text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Link className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPollInput(!showPollInput)}
                className={`h-10 w-10 rounded-full hover:bg-sidebar-accent ${showPollInput ? 'bg-sidebar-accent text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>

            {/* Submit Button */}
            <Button
              disabled={!mainContent.trim() || isSubmitting}
              onClick={handleSubmit}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                mainContent.trim() && !isSubmitting
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Posting...' : 'Post →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
