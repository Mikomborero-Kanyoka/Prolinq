import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const updatedUser = response.data;
      console.log('🔄 Refreshed user data:', updatedUser);
      console.log('🔄 is_admin in refreshed data:', updatedUser.is_admin);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      throw error;
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('📦 Loading from localStorage:', { token: !!token, storedUser });
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('📦 Parsed stored user:', parsedUser);
        console.log('📦 is_admin in stored user:', parsedUser.is_admin);
        
        // Set the user initially from localStorage
        setUser(parsedUser);
        
        // Then refresh from server to get latest admin status
        refreshUser().catch(error => {
          console.warn('⚠️ Could not refresh user data on mount:', error);
          // If refresh fails, keep using localStorage data
        });
      } catch (error) {
        console.error('❌ Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { access_token, user: returnedUser } = response.data;
      
      // Ensure we have the required data
      if (!access_token || !returnedUser) {
        throw new Error('Invalid registration response: missing token or user data');
      }
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(returnedUser));
      setUser(returnedUser);
      setIsLoading(false);
      
      toast.success('Account created successfully!');
      return returnedUser;
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access_token, user: returnedUser } = response.data;
      
      // Ensure we have the required data
      if (!access_token || !returnedUser) {
        throw new Error('Invalid login response: missing token or user data');
      }
      
      console.log('🔑 Login Response User Data:', returnedUser);
      console.log('  is_admin field:', returnedUser.is_admin);
      console.log('  is_verified field:', returnedUser.is_verified);
      console.log('  is_active field:', returnedUser.is_active);
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(returnedUser));
      setUser(returnedUser);
      setIsLoading(false);
      
      toast.success('Logged in successfully!');
      return returnedUser;
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    // Clear state immediately
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    
    // Try to notify backend (fire and forget)
    try {
      await Promise.race([
        authAPI.logout(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ]);
    } catch (error) {
      console.error('Logout notification error:', error);
    }
    
    // Use React Router navigation instead of hard redirect
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 500);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.is_admin === true || user?.primary_role === 'admin' || false;

  useEffect(() => {
    console.log('🔐 AuthContext isAdmin calculated:', isAdmin);
    console.log('  user?.is_admin:', user?.is_admin);
    console.log('  user?.primary_role:', user?.primary_role);
    console.log('  Boolean(user?.is_admin):', Boolean(user?.is_admin));
    console.log('  Final isAdmin:', isAdmin);
  }, [user, isAdmin]);

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    setUser,
    updateUser,
    refreshUser,
    isLoading,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
