import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('githubUser');
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Validate token with backend
          await apiService.validateToken();
          setIsAuthenticated(true);
          setError(null);
        } catch (error) {
          console.error('Invalid session:', error);
          clearAuth();
          setError('Session expired. Please login again.');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (code) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.handleGitHubCallback(code);
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('githubUser', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Authentication failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      // Notify backend about logout
      try {
        await apiService.logout();
      } catch (error) {
        console.error('Logout notification failed:', error);
        // Continue with logout even if notification fails
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      setLoading(false);
    }
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('githubUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  const initiateGitHubAuth = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.initiateGitHubAuth();
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('Failed to get GitHub auth URL');
      }
    } catch (error) {
      console.error('Failed to initiate GitHub auth:', error);
      setError('Failed to initiate GitHub authentication');
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    error,
    login,
    logout,
    clearAuth,
    initiateGitHubAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
