
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const CreatePostCard = () => {
  return (
    <Card className="p-4 bg-card border-border">
      <Link to="/submit" className="block">
        <Input 
          placeholder="Create a post..." 
          className="bg-sidebar/50 hover:bg-sidebar/70 border-sidebar-border cursor-pointer text-foreground placeholder:text-muted-foreground rounded-full px-4 py-3"
          readOnly
        />
      </Link>
    </Card>
  );
};

export default CreatePostCard;
