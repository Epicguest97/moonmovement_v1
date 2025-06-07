import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ChatRoomList from '@/components/chat/ChatRoomList';
import ChatWindow from '@/components/chat/ChatWindow';
import StartChatDialog from '@/components/chat/StartChatDialog';
import { useIsMobile } from '@/hooks/use-mobile';

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

const Chat = () => {
  const { user, isLoggedIn } = useAuth();
  const isMobile = useIsMobile();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStartChat, setShowStartChat] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchChatRooms();
      updateOnlineStatus(true);

      // Update online status when user leaves
      const handleBeforeUnload = () => updateOnlineStatus(false);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        updateOnlineStatus(false);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isLoggedIn]);

  const fetchChatRooms = async () => {
    try {
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

  const updateOnlineStatus = async (isOnline: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('https://moonmovement.onrender.com/api/chat/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isOnline })
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
  };

  const handleBackToList = () => {
    setSelectedRoom(null);
  };

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
        await fetchChatRooms();
        setSelectedRoom(newRoom);
        setShowStartChat(false);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8 text-center bg-sidebar border-sidebar-border">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2 text-sidebar-foreground">Sign in to Chat</h2>
            <p className="text-gray-300">You need to be signed in to access the chat feature.</p>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-screen flex flex-col">
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="flex-1 flex flex-col">
            {!selectedRoom ? (
              /* Chat List View */
              <Card className="flex-1 bg-sidebar border-sidebar-border rounded-none border-x-0 border-b-0">
                <div className="p-4 border-b border-sidebar-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-sidebar-foreground">Chats</h2>
                    <Button
                      size="sm"
                      onClick={() => setShowStartChat(true)}
                      className="bg-sidebar-primary hover:bg-sidebar-primary/80"
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-400">Loading chats...</div>
                  ) : (
                    <ChatRoomList
                      rooms={chatRooms}
                      selectedRoom={selectedRoom}
                      onRoomSelect={handleRoomSelect}
                      currentUserId={user?.id ? Number(user.id) : undefined}
                    />
                  )}
                </div>
              </Card>
            ) : (
              /* Chat Window View */
              <Card className="flex-1 bg-sidebar border-sidebar-border rounded-none border-x-0 border-b-0">
                <ChatWindow
                  room={selectedRoom}
                  currentUserId={user?.id ? Number(user.id) : undefined}
                  onMessageSent={fetchChatRooms}
                  onBack={handleBackToList}
                  isMobile={true}
                />
              </Card>
            )}
          </div>
        ) : (
          /* Desktop Layout */
          <div className="max-w-7xl mx-auto px-4 py-6 h-full">
            <div className="flex gap-6 h-[calc(100vh-200px)]">
              {/* Chat Room List */}
              <Card className="w-80 bg-sidebar border-sidebar-border">
                <div className="p-4 border-b border-sidebar-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-sidebar-foreground">Messages</h2>
                    <Button
                      size="sm"
                      onClick={() => setShowStartChat(true)}
                      className="bg-sidebar-primary hover:bg-sidebar-primary/80"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-400">Loading chats...</div>
                  ) : (
                    <ChatRoomList
                      rooms={chatRooms}
                      selectedRoom={selectedRoom}
                      onRoomSelect={handleRoomSelect}
                      currentUserId={user?.id ? Number(user.id) : undefined}
                    />
                  )}
                </div>
              </Card>

              {/* Chat Window */}
              <Card className="flex-1 bg-sidebar border-sidebar-border">
                {selectedRoom ? (
                  <ChatWindow
                    room={selectedRoom}
                    currentUserId={user?.id ? Number(user.id) : undefined}
                    onMessageSent={fetchChatRooms}
                    isMobile={false}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Select a chat to start messaging</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Start Chat Dialog */}
        <StartChatDialog
          open={showStartChat}
          onClose={() => setShowStartChat(false)}
          onStartChat={handleNewChat}
        />
      </div>
    </MainLayout>
  );
};

export default Chat;
