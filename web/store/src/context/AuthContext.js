import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [applicationInfo, setApplicationInfo] = useState(null);
  const [applicationLoading, setApplicationLoading] = useState(false);

  const loadApplicationInfo = useCallback(async (email) => {
    if (!email) {
      setApplicationInfo(null);
      return null;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setApplicationInfo(null);
      return null;
    }

    try {
      setApplicationLoading(true);
      const response = await apiClient.getBoutiqueApplicationStatus(normalizedEmail);
      const application = response?.data?.applications?.[0] || null;
      setApplicationInfo(application);
      return application;
    } catch (error) {
      console.error('Failed to fetch boutique application status', error);
      setApplicationInfo(null);
      return null;
    } finally {
      setApplicationLoading(false);
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    try {
      const response = await apiClient.getProfile();
      const latestUser = response?.data?.user || response?.data || null;

      if (latestUser) {
        setUser(latestUser);
        localStorage.setItem('user', JSON.stringify(latestUser));
        return latestUser;
      }
    } catch (error) {
      console.error('Failed to refresh user profile', error);
    }

    return null;
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);

        const latestUser = await refreshUserProfile();
        await loadApplicationInfo((latestUser || parsedUser)?.email);
      }

      setLoading(false);
    };

    initializeAuth();
  }, [loadApplicationInfo, refreshUserProfile]);

  const login = async (email, password) => {
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success) {
        const user = response.data.user;
        
        // Validate that user has boutique owner role
        if (user.role !== 'boutique_owner') {
          // Logout immediately if role doesn't match
          apiClient.setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          
          return { 
            success: false, 
            message: 'Access denied. Only boutique owners can access this portal.' 
          };
        }
        
        setUser(user);
        setIsAuthenticated(true);

        const latestUser = await refreshUserProfile();
        await loadApplicationInfo((latestUser || user)?.email);

        return { success: true, user: latestUser || user };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.register(userData);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        const latestUser = await refreshUserProfile();
        return { success: true, user: latestUser || response.data.user };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    setIsAuthenticated(false);
    setApplicationInfo(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    applicationInfo,
    applicationLoading,
    login,
    register,
    logout,
    updateUser,
    refreshApplicationStatus: () => loadApplicationInfo(user?.email),
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
