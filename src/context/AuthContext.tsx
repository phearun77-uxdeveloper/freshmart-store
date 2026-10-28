import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; address?: string }) => Promise<void>;
  logout: () => Promise<void>;
  quickDemoLogin: (role: 'admin' | 'customer') => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('freshmart_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Validate session on mount
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const data = await api.getMe();
        if (isMounted && data.user) {
          setUser(data.user);
        }
      } catch {
        // Not logged in or expired token
        if (isMounted) {
          setUser(null);
          localStorage.removeItem('freshmart_token');
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    if (res.token) {
      localStorage.setItem('freshmart_token', res.token);
      setToken(res.token);
    }
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; address?: string }) => {
    const res = await api.register(data);
    if (res.token) {
      localStorage.setItem('freshmart_token', res.token);
      setToken(res.token);
    }
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Proceed with local logout regardless of network error
    } finally {
      localStorage.removeItem('freshmart_token');
      setToken(null);
      setUser(null);
    }
  };

  const quickDemoLogin = async (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      await login('admin@freshmart.local', 'AdminFresh2026!');
    } else {
      await login('customer@freshmart.local', 'CustomerPass123!');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    quickDemoLogin,
    isAuthModalOpen,
    openAuthModal: () => setIsAuthModalOpen(true),
    closeAuthModal: () => setIsAuthModalOpen(false),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
