import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, contact: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data from backend
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('[DEBUG] AuthContext - Token from localStorage:', token);
      
      const response = await authAPI.getCurrentUser();
      console.log('[DEBUG] AuthContext - fetchUserData response:', JSON.stringify(response.data, null, 2));
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // If token is invalid, remove it
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, userData: User) => {
    try {
      setIsLoading(true);
      console.log('[DEBUG] AuthContext - Logging in user:', userData.email, 'ID:', userData.id);
      console.log('[DEBUG] AuthContext - Token before login:', localStorage.getItem('token'));
      localStorage.setItem('token', token);
      console.log('[DEBUG] AuthContext - Token after login:', localStorage.getItem('token'));
      setUser(userData);
      console.log('[DEBUG] AuthContext - User state set to:', userData.email);
    } catch (error: any) {
      const message = error.response?.data || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      console.log('[DEBUG] AuthContext - login response user data:', JSON.stringify(user, null, 2));
      
      await login(token, user);
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, contact: string) => {
    try {
      setIsLoading(true);
      await authAPI.register({ email, password, fullName, contact });
      toast.success('Registration successful! Please check your email for OTP verification.');
    } catch (error: any) {
      const message = error.response?.data || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.verifyOtp({ email, otp });
      const { token, user } = response.data;
      
      console.log('[DEBUG] AuthContext - verifyOtp response user data:', JSON.stringify(user, null, 2));
      
      await login(token, user);
      toast.success('OTP verified successfully! You are now logged in.');
    } catch (error: any) {
      const message = error.response?.data || 'OTP verification failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('[DEBUG] AuthContext - Logging out user:', user?.email);
    console.log('[DEBUG] AuthContext - Token before logout:', localStorage.getItem('token'));
    localStorage.removeItem('token');
    console.log('[DEBUG] AuthContext - Token after logout:', localStorage.getItem('token'));
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithCredentials,
    register,
    verifyOtp,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 