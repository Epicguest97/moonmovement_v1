import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, Plus, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ChatRoomList from '@/components/chat/ChatRoomList';
import ChatWindow from '@/components/chat/ChatWindow';
import StartChatDialog from '@/components/chat/StartChatDialog';
import CreateGroupDialog from '@/components/chat/CreateGroupDialog';
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
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        await fetchChatRooms();
        setSelectedRoom(newGroup);
        setShowCreateGroup(false);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const filteredRooms = chatRooms.filter(room => {
    if (!searchQuery) return true;
    
    if (room.isGroup) {
      return room.name?.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      const otherUser = room.users.find(u => u.user.id !== Number(user?.id));
      return otherUser?.user.username.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

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
      <div className="h-screen flex flex-col bg-black">
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="flex-1 flex flex-col">
            {!selectedRoom ? (
              /* Chat List View */
              <Card className="flex-1 bg-black border-gray-800 rounded-none border-x-0 border-b-0">
                <div className="p-4 border-b border-gray-800 bg-black">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Chats</h2>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setShowCreateGroup(true)}
                        className="bg-gray-800 hover:bg-gray-700 text-white"
                      >
                        <Users size={18} />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setShowStartChat(true)}
                        className="bg-gray-800 hover:bg-gray-700 text-white"
                      >
                        <Plus size={18} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search chats..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-0 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-black">
                  {loading ? (
                    <div className="p-4 text-center text-gray-400">Loading chats...</div>
                  ) : (
                    <ChatRoomList
                      rooms={filteredRooms}
                      selectedRoom={selectedRoom}
                      onRoomSelect={handleRoomSelect}
                      currentUserId={user?.id ? Number(user.id) : undefined}
                    />
                  )}
                </div>
              </Card>
            ) : (
              /* Chat Window View */
              <Card className="flex-1 bg-black border-gray-800 rounded-none border-x-0 border-b-0">
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
          /* WhatsApp Web-like Desktop Layout */
          <div className="h-full flex">
            {/* Chat Room List - WhatsApp Web Style */}
            <div className="w-96 bg-black border-r border-gray-800 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-800 bg-black">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Chats</h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setShowCreateGroup(true)}
                      className="bg-gray-800 hover:bg-gray-700 text-white"
                      title="Create Group"
                    >
                      <Users size={16} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowStartChat(true)}
                      className="bg-gray-800 hover:bg-gray-700 text-white"
                      title="New Chat"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search or start new chat"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              
              {/* Chat List */}
              <div className="flex-1 overflow-y-auto bg-black">
                {loading ? (
                  <div className="p-4 text-center text-gray-400">Loading chats...</div>
                ) : (
                  <ChatRoomList
                    rooms={filteredRooms}
                    selectedRoom={selectedRoom}
                    onRoomSelect={handleRoomSelect}
                    currentUserId={user?.id ? Number(user.id) : undefined}
                  />
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-black flex flex-col">
              {selectedRoom ? (
                <ChatWindow
                  room={selectedRoom}
                  currentUserId={user?.id ? Number(user.id) : undefined}
                  onMessageSent={fetchChatRooms}
                  isMobile={false}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-black">
                  <div className="text-center text-gray-400">
                    <MessageSquare size={64} className="mx-auto mb-4 opacity-30" />
                    <h3 className="text-xl font-medium mb-2 text-white">WhatsApp Web</h3>
                    <p className="text-sm">Send and receive messages without keeping your phone online.</p>
                    <p className="text-sm mt-2">Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
    </MainLayout>
  );
};

export default Chat;
