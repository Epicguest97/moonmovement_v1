
import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import FloatingChatList from './FloatingChatList';
import FloatingChatWindow from './FloatingChatWindow';

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

const FloatingChatWidget = () => {
  const { user, isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [openChats, setOpenChats] = useState<ChatRoom[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && isOpen) {
      fetchChatRooms();
    }
  }, [isLoggedIn, isOpen]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://moonmovement.onrender.com/api/chat/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const rooms = await response.json();
        setChatRooms(rooms);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (room: ChatRoom) => {
    if (!openChats.find(chat => chat.id === room.id)) {
      setOpenChats(prev => [...prev, room]);
    }
  };

  const handleCloseChat = (roomId: number) => {
    setOpenChats(prev => prev.filter(chat => chat.id !== roomId));
  };

  const handleMinimizeWidget = () => {
    setIsOpen(false);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-4 z-50 flex flex-col items-end space-y-2">
      {/* Open Chat Windows */}
      <div className="flex space-x-2">
        {openChats.map((chat) => (
          <FloatingChatWindow
            key={chat.id}
            room={chat}
            currentUserId={user?.id ? Number(user.id) : undefined}
            onClose={() => handleCloseChat(chat.id)}
            onMessageSent={fetchChatRooms}
          />
        ))}
      </div>

      {/* Chat List Widget */}
      {isOpen && (
        <Card className="w-80 h-96 bg-sidebar border-sidebar-border shadow-lg">
          <FloatingChatList
            rooms={chatRooms}
            loading={loading}
            onChatSelect={handleChatSelect}
            onMinimize={handleMinimizeWidget}
            currentUserId={user?.id ? Number(user.id) : undefined}
          />
        </Card>
      )}

      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          size="icon"
        >
          <MessageSquare size={20} />
        </Button>
      )}
    </div>
  );
};

export default FloatingChatWidget;
