import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  profileImage?: string;
  profileComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean; // Add this line
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Check for stored token and user data on app load
    const checkAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback((userData: User, token: string) => {
    setIsLoading(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser({
      ...userData,
      profileComplete: !!(userData.bio || userData.profileImage)
    });
    setIsLoading(false);
  }, []);

  const logout = () => {
    setIsLoading(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoading(false);
  };

  const updateUser = useCallback((userData: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    const updatedUser = { ...user, ...userData };
    
    // Update local storage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update state
    setUser({
      ...updatedUser,
      profileComplete: !!(updatedUser.bio || updatedUser.profileImage)
    });
    setIsLoading(false);
  }, [user]);

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
