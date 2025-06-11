
import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Send, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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

interface FloatingChatWindowProps {
  room: ChatRoom;
  currentUserId?: number;
  onClose: () => void;
  onMessageSent: () => void;
}

const FloatingChatWindow = ({ room, currentUserId, onClose, onMessageSent }: FloatingChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
      return 'Active now';
    }
    
    return `Active ${formatDistanceToNow(new Date(otherUser.user.lastSeen), { addSuffix: true })}`;
  };

  return (
    <Card className="w-80 bg-sidebar border-sidebar-border shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {getRoomName().charAt(0).toUpperCase()}
              </div>
              {!room.isGroup && (() => {
                const otherUser = room.users.find(u => u.user.id !== currentUserId);
                return otherUser?.user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-sidebar"></div>
                );
              })()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sidebar-foreground text-sm truncate">
                {getRoomName()}
              </h3>
              {!room.isGroup && (
                <p className="text-xs text-muted-foreground">
                  {getOtherUserStatus()}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 p-0"
            >
              <Minus size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="w-6 h-6 p-0"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="text-center text-muted-foreground text-sm py-8">Loading...</div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[70%]">
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${
                          message.sender.id === currentUserId
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        {message.sender.id !== currentUserId && room.isGroup && (
                          <p className="text-xs opacity-70 mb-1 font-medium">{message.sender.username}</p>
                        )}
                        <p className="leading-relaxed">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-1">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-sidebar-border">
            <form onSubmit={sendMessage} className="flex gap-2 items-end">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 text-sm h-8"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending}
                size="sm"
                className="w-8 h-8 p-0"
              >
                <Send size={14} />
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  );
};

export default FloatingChatWindow;
