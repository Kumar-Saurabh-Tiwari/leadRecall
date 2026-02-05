import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  loginEmailOnly: (userData: any, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('leadrecall_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Mock authentication
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser: User = {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email,
      role,
      company: role === 'exhibitor' ? 'Acme Corp' : undefined,
    };
    
    setUser(mockUser);
    localStorage.setItem('leadrecall_user', JSON.stringify(mockUser));
    return true;
  }, []);

  const loginEmailOnly = useCallback(async (userData: any, role: UserRole): Promise<boolean> => {
    const userSession: User = {
      id: userData.id || userData._id,
      name: userData.name || userData.sUserName,
      email: userData.email || userData.sEmail,
      role: role,
      company: userData.company || userData.sCompanyName,
    };
    
    setUser(userSession);
    localStorage.setItem('leadrecall_user', JSON.stringify(userSession));
    return true;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      company: role === 'exhibitor' ? 'New Company' : undefined,
    };
    
    setUser(mockUser);
    localStorage.setItem('leadrecall_user', JSON.stringify(mockUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('leadrecall_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginEmailOnly, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
