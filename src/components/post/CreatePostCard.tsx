
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import CreatePostModal from './CreatePostModal';

const CreatePostCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="p-4 bg-card border-border">
        <div onClick={() => setIsModalOpen(true)} className="block">
          <Input 
            placeholder="Create a post..." 
            className="bg-sidebar/50 hover:bg-sidebar/70 border-sidebar-border cursor-pointer text-foreground placeholder:text-muted-foreground rounded-full px-4 py-3"
            readOnly
          />
        </div>
      </Card>

      <CreatePostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default CreatePostCard;
