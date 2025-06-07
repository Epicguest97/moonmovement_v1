
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MoreVertical, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
  };
  messageType: string;
  attachmentUrl?: string;
}

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
}

interface ChatWindowProps {
  room: ChatRoom;
  currentUserId?: number;
  onMessageSent: () => void;
  onBack?: () => void;
  isMobile?: boolean;
}

const ChatWindow = ({ room, currentUserId, onMessageSent, onBack, isMobile = false }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [room.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://moonmovement.onrender.com/api/chat/rooms/${room.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://moonmovement.onrender.com/api/chat/rooms/${room.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: 'text'
        })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRoomName = () => {
    if (room.isGroup) {
      return room.name || 'Group Chat';
    }
    
    const otherUser = room.users.find(u => u.user.id !== currentUserId);
    return otherUser?.user.username || 'Unknown User';
  };

  const getOtherUserStatus = () => {
    if (room.isGroup) return null;
    
    const otherUser = room.users.find(u => u.user.id !== currentUserId);
    if (!otherUser) return null;
    
    if (otherUser.user.isOnline) {
      return 'Online';
    }
    
    return `Last seen ${formatDistanceToNow(new Date(otherUser.user.lastSeen), { addSuffix: true })}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className={`p-4 border-b border-sidebar-border ${isMobile ? 'bg-sidebar-primary' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className={isMobile ? 'text-white hover:bg-white/10' : ''}
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  isMobile ? 'bg-white/20 text-white' : 'bg-sidebar-primary text-white'
                }`}>
                  {getRoomName().charAt(0).toUpperCase()}
                </div>
                {!room.isGroup && (() => {
                  const otherUser = room.users.find(u => u.user.id !== currentUserId);
                  return otherUser?.user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar"></div>
                  );
                })()}
              </div>
              <div>
                <h3 className={`font-semibold ${isMobile ? 'text-white text-lg' : 'text-sidebar-foreground'}`}>
                  {getRoomName()}
                </h3>
                {!room.isGroup && (
                  <p className={`text-sm ${isMobile ? 'text-white/80' : 'text-gray-400'}`}>
                    {getOtherUserStatus()}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className={isMobile ? 'text-white hover:bg-white/10' : ''}
          >
            <MoreVertical size={16} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading messages...</div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[80%]">
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.sender.id === currentUserId
                        ? 'bg-sidebar-primary text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {message.sender.id !== currentUserId && room.isGroup && (
                      <p className="text-xs text-gray-500 mb-1 font-medium">{message.sender.username}</p>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender.id === currentUserId ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-sidebar-border bg-white">
        <form onSubmit={sendMessage} className="flex gap-2 items-end">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 text-sidebar-foreground resize-none"
            disabled={sending}
            style={{ minHeight: '44px' }}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-sidebar-primary hover:bg-sidebar-primary/80 rounded-full w-12 h-12 p-0"
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
