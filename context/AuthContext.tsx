
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '../types';
import { Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: (User & {password: string})[] = [
    { id: 1, username: 'admin', password: 'password123', role: Role.Admin },
    { id: 2, username: 'personel', password: 'password123', role: Role.Staff },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const foundUser = mockUsers.find(u => u.username === username && u.password === password);
    if (foundUser) {
      const { password, ...userToSet } = foundUser;
      setUser(userToSet);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
