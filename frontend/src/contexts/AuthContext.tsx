import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthTokens } from '@/types';
import toast from 'react-hot-toast';
import { api } from '@/services/api';

const API_URL = 'http://localhost:5000/api';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored tokens on mount
    const storedTokens = localStorage.getItem('aviation_tokens');
    if (storedTokens) {
      try {
        const parsed = JSON.parse(storedTokens);
        setTokens(parsed);
        api.setTokens(parsed);
        // Set tokens in axios default headers if you're using axios
        // api.setTokens(parsed);
        fetchUser(parsed);
      } catch (error) {
        console.error('Failed to parse stored tokens:', error);
        localStorage.removeItem('aviation_tokens');
        setIsLoading(false);
      }
    } else {
      // Also check for individual token storage (from our test)
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const userData = localStorage.getItem('user');
          const tokensData = {
            accessToken: accessToken,
            refreshToken: localStorage.getItem('refreshToken') || '',
          };
          setTokens(tokensData);
          api.setTokens(tokensData);
          if (userData) {
            setUser(JSON.parse(userData));
          }
          localStorage.setItem('aviation_tokens', JSON.stringify(tokensData));
        } catch (error) {
          console.error('Failed to parse stored user:', error);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (tokensData?: AuthTokens) => {
    try {
      const token = tokensData?.accessToken || tokens?.accessToken;
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
          // Also store user in localStorage
          localStorage.setItem('user', JSON.stringify(data.data));
        } else {
          throw new Error('Failed to fetch user');
        }
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // If token is invalid, logout
      if (tokens) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
     console.log("LOGIN REQUEST", {
    email,
    password,
  });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data) {
        const userData = data.data.user;
        const tokensData = data.data.tokens;

        // Store in state
        setUser(userData);
        setTokens(tokensData);
        api.setTokens(tokensData);

        // Store in localStorage
        localStorage.setItem('aviation_tokens', JSON.stringify(tokensData));
        localStorage.setItem('accessToken', tokensData.accessToken);
        localStorage.setItem('refreshToken', tokensData.refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        toast.success(`Welcome back, ${userData.name}!`);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      toast.success('Registration successful! Please login.');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    api.clearTokens();
    localStorage.removeItem('aviation_tokens');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  console.log('AUTH STATE', {
  user,
  tokens,
  isLoading,
  isAuthenticated: !!user && !!tokens,
});

  const value = {
    user,
    tokens,
    isLoading,
    login,
    logout,
    register,
    isAuthenticated: !!user && !!tokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};