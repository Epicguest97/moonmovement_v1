import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, X } from 'lucide-react';

interface Friend {
  id: number;
  username: string;
  isOnline: boolean;
  lastSeen: string;
}

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, userIds: number[]) => void;
}

const CreateGroupDialog = ({ open, onClose, onCreateGroup }: CreateGroupDialogProps) => {
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFriends();
    }
  }, [open]);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://moonmovement.onrender.com/api/chat/friends', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const friendsData = await response.json();
        setFriends(friendsData);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const handleFriendToggle = (friendId: number) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedFriends.length === 0) return;

    setLoading(true);
    try {
      await onCreateGroup(groupName, selectedFriends);
      setGroupName('');
      setSelectedFriends([]);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Users size={20} />
            Create Group
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="groupName" className="text-white">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>

          <div>
            <Label className="text-white">Select Friends</Label>
            <div className="max-h-48 overflow-y-auto space-y-2 mt-2 bg-black">
              {friends.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">
                  No friends found. Add some friends first!
                </p>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded">
                    <Checkbox
                      id={`friend-${friend.id}`}
                      checked={selectedFriends.includes(friend.id)}
                      onCheckedChange={() => handleFriendToggle(friend.id)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm">{friend.username}</p>
                        <p className="text-xs text-gray-400">
                          {friend.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
              disabled={loading || selectedFriends.length === 0 || !groupName.trim()}
            >
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
