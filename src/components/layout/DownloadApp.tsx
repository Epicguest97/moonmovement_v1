
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ComingSoonModal from './ComingSoonModal';
import { Smartphone } from 'lucide-react';

const DownloadApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="bg-sidebar border-sidebar-border text-foreground cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Smartphone size={20} />
            Download our App
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Get the full MoonMovement experience on your phone.
          </p>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Learn More
          </Button>
        </CardContent>
      </Card>
      <ComingSoonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default DownloadApp;
