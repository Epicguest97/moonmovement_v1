
import React, { useState } from 'react';
import { X, Minus, Search, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import StartChatDialog from './StartChatDialog';
import CreateGroupDialog from './CreateGroupDialog';

interface ChatRoom {
  id: number;
  name?: string;
  isGroup: boolean;
  users: Array<{
    user: {
      id: number;
      username: string;
      isOnline: boolean;
      lastSeen: string;
    };
  }>;
  messages: Array<{
    id: number;
    content: string;
    createdAt: string;
    sender: {
      id: number;
      username: string;
    };
  }>;
  _count: {
    messages: number;
  };
}

interface FloatingChatListProps {
  rooms: ChatRoom[];
  loading: boolean;
  onChatSelect: (room: ChatRoom) => void;
  onMinimize: () => void;
  currentUserId?: number;
}

const FloatingChatList = ({ rooms, loading, onChatSelect, onMinimize, currentUserId }: FloatingChatListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showStartChat, setShowStartChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const getRoomName = (room: ChatRoom) => {
    if (room.isGroup) {
      return room.name || 'Group Chat';
    }
    
    const otherUser = room.users.find(u => u.user.id !== currentUserId);
    return otherUser?.user.username || 'Unknown User';
  };

  const getLastMessage = (room: ChatRoom) => {
    if (room.messages.length === 0) return 'No messages yet';
    
    const lastMessage = room.messages[0];
    const isOwnMessage = lastMessage.sender.id === currentUserId;
    const prefix = isOwnMessage ? 'You: ' : '';
    
    return `${prefix}${lastMessage.content}`;
  };

  const filteredRooms = rooms.filter(room => {
    if (!searchQuery) return true;
    
    if (room.isGroup) {
      return room.name?.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      const otherUser = room.users.find(u => u.user.id !== currentUserId);
      return otherUser?.user.username.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  const handleNewChat = async (username: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://moonmovement.onrender.com/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        const newRoom = await response.json();
        onChatSelect(newRoom);
        setShowStartChat(false);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleCreateGroup = async (name: string, userIds: number[]) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://moonmovement.onrender.com/api/chat/groups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, userIds })
      });

      if (response.ok) {
        const newGroup = await response.json();
        onChatSelect(newGroup);
        setShowCreateGroup(false);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sidebar-foreground">Messaging</h3>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCreateGroup(true)}
              className="w-6 h-6 p-0"
            >
              <Users size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowStartChat(true)}
              className="w-6 h-6 p-0"
            >
              <Plus size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onMinimize}
              className="w-6 h-6 p-0"
            >
              <Minus size={14} />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm bg-background border-sidebar-border"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <div className="space-y-0">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="p-3 cursor-pointer hover:bg-sidebar-accent transition-colors border-b border-sidebar-border last:border-b-0"
                onClick={() => onChatSelect(room)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getRoomName(room).charAt(0).toUpperCase()}
                    </div>
                    {!room.isGroup && (() => {
                      const otherUser = room.users.find(u => u.user.id !== currentUserId);
                      return otherUser?.user.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-sidebar"></div>
                      );
                    })()}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sidebar-foreground truncate text-sm">
                        {getRoomName(room)}
                      </p>
                      {room.messages.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(room.messages[0].createdAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {getLastMessage(room)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredRooms.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                <p className="mb-2">No chats yet</p>
                <p className="text-xs">Start a conversation!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <StartChatDialog
        open={showStartChat}
        onClose={() => setShowStartChat(false)}
        onStartChat={handleNewChat}
      />

      <CreateGroupDialog
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
};

export default FloatingChatList;
