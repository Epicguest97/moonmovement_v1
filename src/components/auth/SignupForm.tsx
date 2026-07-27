import { API_BASE_URL } from '@/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        }
      }
    }
  }
}

const SignupForm = ({ onSwitchToLogin }: SignupFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google) {
      const currentDomain = window.location.origin;
      
      window.google.accounts.id.initialize({
        client_id: '971351411666-mq31r82qcak4iarqdq5gfr4k4741f4cq.apps.googleusercontent.com',
        callback: handleGoogleResponse,
        ux_mode: 'popup', // Use popup to avoid redirect issues
        cancel_on_tap_outside: true
      });
      
      // Render the button
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignUpButton")!,
        { theme: "outline", size: "large", width: 250, text: "signup_with" }
      );
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setIsLoading(true);
    setError('');
    
    console.log('Google response:', response); // Debug response object
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tokenId: response.credential,
          credential: response.credential // Send both for backward compatibility
        })
      });
      
      // Check for network errors
      if (!res.ok) {
        const data = await res.json();
        console.error('Server response:', data);
        throw new Error(data.error || data.details || 'Google signup failed');
      }
      
      const data = await res.json();
      login(data.user, data.token);
      navigate('/'); // Changed from '/home' to '/'
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      // On success, store username and token, then log the user in
      localStorage.setItem('username', data.username);
      if (data.token) {
        // If the API returns a token directly, use it to log in
        login(data.user, data.token);
        navigate('/profile-setup'); // Redirect to profile setup
      } else {
        // Otherwise show a message and switch to login
        alert('Account created successfully! Please log in.');
        onSwitchToLogin();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Full-screen background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ 
        backgroundImage: "url('/auth-background.jpeg')",
        backgroundSize: 'cover'
      }} />
      
      {/* Content overlay */}
      <div className="relative z-10 flex h-full w-full">
        {/* Left side - Text area */}
        <div className="hidden md:flex md:w-3/5 items-center justify-center p-8">
          
        </div>
        
        {/* Right side - Signup form */}
        <div className="w-full md:w-2/5 flex items-center justify-center p-4 md:p-8">
          <Card className="w-full max-w-md bg-sidebar/90 border-sidebar-border backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">Create account</CardTitle>
              <CardDescription className="text-gray-400">
                Join Moon to start sharing and discussing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-sidebar-accent border-sidebar-border text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-sidebar-accent border-sidebar-border text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-sidebar-accent border-sidebar-border text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-sidebar-accent border-sidebar-border text-white"
                  />
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}
                
                <Button 
                  type="submit" 
                  className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-sidebar-border"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-sidebar px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div id="googleSignUpButton"></div>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={onSwitchToLogin}
                    className="text-sidebar-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
