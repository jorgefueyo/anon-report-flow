
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface SecurityContextType {
  isAuthenticated: boolean;
  admin: any;
  logout: () => void;
  loading: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { admin, loading, logout, isAuthenticated } = useSecureAuth();
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Session timeout management
  useEffect(() => {
    if (isAuthenticated) {
      // Clear existing timeout
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }

      // Set new timeout (30 minutes)
      const timeout = setTimeout(() => {
        logout();
      }, 30 * 60 * 1000);

      setSessionTimeout(timeout);

      // Reset timeout on user activity
      const resetTimeout = () => {
        if (sessionTimeout) {
          clearTimeout(sessionTimeout);
        }
        const newTimeout = setTimeout(() => {
          logout();
        }, 30 * 60 * 1000);
        setSessionTimeout(newTimeout);
      };

      // Listen for user activity
      window.addEventListener('mousedown', resetTimeout);
      window.addEventListener('keydown', resetTimeout);
      window.addEventListener('scroll', resetTimeout);

      return () => {
        if (sessionTimeout) {
          clearTimeout(sessionTimeout);
        }
        window.removeEventListener('mousedown', resetTimeout);
        window.removeEventListener('keydown', resetTimeout);
        window.removeEventListener('scroll', resetTimeout);
      };
    }
  }, [isAuthenticated, logout]);

  const value = {
    isAuthenticated,
    admin,
    logout,
    loading,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
