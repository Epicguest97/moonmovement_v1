
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

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

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  onRoomSelect: (room: ChatRoom) => void;
  currentUserId?: number;
}

const ChatRoomList = ({ rooms, selectedRoom, onRoomSelect, currentUserId }: ChatRoomListProps) => {
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

  const getLastMessageTime = (room: ChatRoom) => {
    if (room.messages.length === 0) return '';
    
    return formatDistanceToNow(new Date(room.messages[0].createdAt), { addSuffix: true });
  };

  const isUserOnline = (room: ChatRoom) => {
    if (room.isGroup) return false;
    
    const otherUser = room.users.find(u => u.user.id !== currentUserId);
    return otherUser?.user.isOnline || false;
  };

  return (
    <div className="space-y-0">
      {rooms.map((room) => (
        <div
          key={room.id}
          className={`p-4 cursor-pointer hover:bg-sidebar-accent transition-colors border-b border-gray-100 last:border-b-0 ${
            selectedRoom?.id === room.id ? 'bg-sidebar-accent' : ''
          }`}
          onClick={() => onRoomSelect(room)}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-sidebar-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {getRoomName(room).charAt(0).toUpperCase()}
              </div>
              {isUserOnline(room) && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sidebar-foreground truncate text-base">
                  {getRoomName(room)}
                </p>
                {room.messages.length > 0 && (
                  <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {getLastMessageTime(room)}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 truncate flex-1">
                  {getLastMessage(room)}
                </p>
                {room._count.messages > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-sidebar-primary text-white text-xs h-5 min-w-5 rounded-full flex items-center justify-center">
                    {room._count.messages > 99 ? '99+' : room._count.messages}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {rooms.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          <p className="text-base mb-2">No chats yet</p>
          <p className="text-sm">Start a conversation with someone!</p>
        </div>
      )}
    </div>
  );
};

export default ChatRoomList;
