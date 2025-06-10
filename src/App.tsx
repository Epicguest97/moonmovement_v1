
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import UserProfile from '@/pages/UserProfile';
import Community from '@/pages/Community';
import Submit from '@/pages/Submit';
import PostDetail from '@/pages/PostDetail';
import Search from '@/pages/Search';
import Settings from '@/pages/Settings';
import Chat from '@/pages/Chat';
import News from '@/pages/News';
import NewsDetail from '@/pages/NewsDetail';
import StartupNews from '@/pages/StartupNews';
import StartupDetail from '@/pages/StartupDetail';
import UnicornsIndia from '@/pages/UnicornsIndia';
import IndianDistricts from '@/pages/IndianDistricts';
import ManageCommunities from '@/pages/ManageCommunities';
import Events from '@/pages/Events';
import NotFound from '@/pages/NotFound';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/u/:username" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/r/:communityName" element={<Community />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/news" element={<News />} />
          <Route path="/events" element={<Events />} />
          <Route path="/communities" element={<ManageCommunities />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/startup-news" element={<StartupNews />} />
          <Route path="/startup/:id" element={<StartupDetail />} />
          <Route path="/unicorns-india" element={<UnicornsIndia />} />
          <Route path="/districts" element={<IndianDistricts />} />
          <Route path="/r/create" element={<ManageCommunities />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
