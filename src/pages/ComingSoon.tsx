// ComingSoon.tsx

import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ComingSoon: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-full">
        <div className="bg-sidebar border border-sidebar-border rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">
            Coming Soon!
          </h1>
          <p className="text-lg mb-6 text-muted-foreground">
            We're working hard to bring you this feature. Please check back later.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ComingSoon;
