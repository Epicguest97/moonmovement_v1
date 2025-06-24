import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Submit from '@/pages/Submit';
import PostDetail from '@/pages/PostDetail';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import StartupNews from '@/pages/StartupNews';
import StartupDetail from '@/pages/StartupDetail';
import UnicornsIndia from '@/pages/UnicornsIndia';
import News from '@/pages/News';
import NewsDetail from '@/pages/NewsDetail';
import Community from '@/pages/Community';
import Communities from '@/pages/Communities';
import ManageCommunities from '@/pages/ManageCommunities';
import Chat from '@/pages/Chat';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import IndianDistricts from '@/pages/IndianDistricts';
import UserProfile from '@/pages/UserProfile';
import Search from '@/pages/Search';
import NotFound from '@/pages/NotFound';
import ComingSoon from './pages/ComingSoon';
import ProfileSetup from '@/pages/ProfileSetup';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/startup-news" element={<StartupNews />} />
              <Route path="/startup/:id" element={<StartupDetail />} />
              <Route path="/unicorns-india" element={<UnicornsIndia />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/r/:communityName" element={<Community />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/manage-communities" element={<ManageCommunities />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/events" element={<ComingSoon />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/districts" element={<ComingSoon />} />
              <Route path="/u/:username" element={<UserProfile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/misc" element={<ComingSoon />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
