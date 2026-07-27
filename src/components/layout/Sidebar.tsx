import { API_BASE_URL } from '@/config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Community {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  onlineCount: number;
  bannerImage?: string;
  icon?: string;
}

const Sidebar = () => {
  const { isLoggedIn } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/community`);
        if (response.ok) {
          const data = await response.json();
          setCommunities(data.slice(0, 5)); // Show top 5 communities
        }
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const formatMemberCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-4 sticky top-20">
      {/* Top Communities */}
      <Card className="bg-sidebar border-sidebar-border">
        <CardHeader className="bg-sidebar-primary text-white py-3 px-4 rounded-t-md font-medium">
          Top Communities
        </CardHeader>
        <CardContent className="px-0 pt-2 pb-0 bg-sidebar">
          {loading ? (
            <div className="px-4 py-6 text-center text-gray-400">
              Loading communities...
            </div>
          ) : communities.length > 0 ? (
            <ul>
              {communities.map((community, index) => (
                <li key={community.id}>
                  <Link 
                    to={`/r/${community.name}`}
                    className="flex items-center px-4 py-2 hover:bg-sidebar-accent text-gray-300 hover:text-sidebar-accent-foreground"
                  >
                    <span className="mr-4 text-sm font-medium text-gray-500">{index + 1}</span>
                    <div className="mr-3 bg-sidebar-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                      r/
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">r/{community.name}</p>
                      <p className="text-xs text-gray-500">{formatMemberCount(community.memberCount)} members</p>
                    </div>
                  </Link>
                  {index < communities.length - 1 && <Separator className="bg-sidebar-border" />}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-gray-400">
              No communities found
            </div>
          )}
        </CardContent>
        <CardFooter className="px-4 py-3 bg-sidebar">
          <Link to="/communities" className="w-full">
            <Button className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-white">
              View All Communities
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* About */}
      <Card className="bg-sidebar border-sidebar-border">
        <CardHeader className="py-3 px-4 font-medium text-white">
          About MoonMovement
        </CardHeader>
        <CardContent className="px-4 py-2 text-sm text-gray-300">
          <p className="mb-2">Your front page for what's new and trending online!</p>
          <div className="flex items-center text-xs text-gray-400 mb-2">
            <div className="flex items-center mr-4">
              <span className="font-semibold mr-1 text-gray-300">16.5M</span>
              users
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-1 text-gray-300">100K</span>
              online
            </div>
          </div>
          <p className="text-xs text-gray-500">Created Jun 23, 2023</p>
        </CardContent>
        <Separator className="bg-sidebar-border" />
        <CardFooter className="flex flex-col items-stretch gap-2 px-4 py-3 bg-sidebar">
          {isLoggedIn ? (
            <>
              <Link to="/submit">
                <Button className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-white">
                  Create Post
                </Button>
              </Link>
              <Link to="/communities">
                <Button variant="outline" className="w-full border-sidebar-primary text-sidebar-primary hover:bg-sidebar-primary/10">
                  Create Community
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
              >
                Login to Post
              </Button>
              <Button 
                onClick={() => window.location.href = '/auth'}
                variant="outline" 
                className="w-full border-sidebar-primary text-sidebar-primary hover:bg-sidebar-primary/10"
              >
                Login to Create Community
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Footer Links */}
      <div className="text-xs text-gray-500 px-2">
        <div className="flex flex-wrap gap-x-2 gap-y-1 mb-2">
          <Link to="/help" className="hover:underline">Help</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/careers" className="hover:underline">Careers</Link>
          <Link to="/press" className="hover:underline">Press</Link>
          <Link to="/advertise" className="hover:underline">Advertise</Link>
          <Link to="/blog" className="hover:underline">Blog</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/content-policy" className="hover:underline">Content Policy</Link>
        </div>
        <p>© 2023 Reeddit, Inc. All rights reserved</p>
      </div>
    </div>
  );
};

export default Sidebar;
