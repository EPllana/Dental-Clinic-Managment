
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types';
import * as apiService from '../services/apiService';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation can be used if needed, but window.location.hash is direct for this
import { ROUTE_PATHS, JWT_TOKEN_KEY } from '../constants';

interface LoginCredentials {
  email: string;
  password?: string;
}

interface SignupData extends LoginCredentials {
  name: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(JWT_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const user = await apiService.getCurrentUser();
          setCurrentUser(user);
        } catch (err) {
          console.error("Failed to fetch current user", err);
          localStorage.removeItem(JWT_TOKEN_KEY);
          setToken(null);
          setCurrentUser(null);
          
          // Check current path using hash for HashRouter
          const currentHashPath = window.location.hash.substring(1); // Remove '#'
          if (currentHashPath !== ROUTE_PATHS.AUTH) {
            navigate(ROUTE_PATHS.AUTH);
          }
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [token, navigate]);

  const handleAuthSuccess = (user: User, receivedToken: string) => {
    localStorage.setItem(JWT_TOKEN_KEY, receivedToken);
    setToken(receivedToken);
    setCurrentUser(user);
    setError(null);
    if (user.role === UserRole.CLIENT) {
      navigate(ROUTE_PATHS.CLIENT_DASHBOARD);
    } else if (user.role === UserRole.DOCTOR) {
      navigate(ROUTE_PATHS.DOCTOR_DASHBOARD);
    } else {
      navigate(ROUTE_PATHS.HOME);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token: receivedToken } = await apiService.loginUser(credentials);
      handleAuthSuccess(user, receivedToken);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err; // Re-throw for form handling
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Backend will assign role as CLIENT for public signups
      const { user, token: receivedToken } = await apiService.signupUser(data);
      handleAuthSuccess(user, receivedToken);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
      throw err; // Re-throw for form handling
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(JWT_TOKEN_KEY);
    setToken(null);
    setCurrentUser(null);
    navigate(ROUTE_PATHS.AUTH);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, error, login, signup, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
