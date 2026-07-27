import { API_BASE_URL } from '@/config';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare } from 'lucide-react';

interface User {
  id: number;
  username: string;
  isOnline: boolean;
  lastSeen: string;
}

interface StartChatDialogProps {
  open: boolean;
  onClose: () => void;
  onStartChat: (username: string) => void;
}

const StartChatDialog = ({ open, onClose, onStartChat }: StartChatDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const users = await response.json();
        setSearchResults(users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (username: string) => {
    onStartChat(username);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-sidebar border-sidebar-border">
        <DialogHeader>
          <DialogTitle className="text-sidebar-foreground">Start New Chat</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading && (
              <div className="text-center py-4 text-gray-400">Searching...</div>
            )}
            
            {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-4 text-gray-400">No users found</div>
            )}
            
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 hover:bg-sidebar-accent rounded-lg cursor-pointer"
                onClick={() => handleStartChat(user.username)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sidebar-foreground">u/{user.username}</p>
                    <p className="text-sm text-gray-400">
                      {user.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-sidebar-border">
                  <MessageSquare size={14} className="mr-1" />
                  Chat
                </Button>
              </div>
            ))}
          </div>
          
          {searchQuery.length < 2 && (
            <div className="text-center py-8 text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>Enter at least 2 characters to search for users</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartChatDialog;
