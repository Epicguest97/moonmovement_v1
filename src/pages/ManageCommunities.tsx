import { API_BASE_URL } from '@/config';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CreateCommunityForm from '@/components/community/CreateCommunityForm';
import CommunityCard from '@/components/community/CommunityCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

interface Community {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  onlineCount: number;
  bannerImage?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

const ManageCommunities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/community`);
      if (!response.ok) {
        throw new Error('Failed to fetch communities');
      }
      const data = await response.json();
      setCommunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch communities');
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleCommunityCreated = (newCommunity: Community) => {
    setCommunities(prev => [newCommunity, ...prev]);
    setShowCreateForm(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-sidebar-primary" />
            <span className="ml-2 text-sidebar-foreground">Loading communities...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-red-400">Error: {error}</p>
            <Button onClick={fetchCommunities} className="mt-4 bg-sidebar-primary hover:bg-sidebar-primary/90">
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="lg:flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-sidebar-foreground">Communities</h1>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
              >
                <Plus size={16} className="mr-1" />
                {showCreateForm ? 'Cancel' : 'Create Community'}
              </Button>
            </div>

            {/* Communities grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-300">No communities found. Create the first one!</p>
                </div>
              ) : (
                communities.map(community => (
                  <CommunityCard
                    key={community.id}
                    name={community.name}
                    description={community.description}
                    memberCount={community.memberCount}
                    imageUrl={community.bannerImage}
                  />
                ))
              )}
            </div>
          </div>

          {/* Create form sidebar */}
          {showCreateForm && (
            <div className="lg:w-96">
              <CreateCommunityForm onCommunityCreated={handleCommunityCreated} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ManageCommunities;
