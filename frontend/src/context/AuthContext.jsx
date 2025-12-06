import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tokenStorage } from '../utils/tokenStorage';

// User roles constants
export const USER_ROLES = {
  STUDENT: 'Student',
  FACULTY: 'Faculty',
};

// Create the context
const AuthContext = createContext(null);

/**
 * AuthProvider - Provides authentication state and methods to the app
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (tokenStorage.isAuthenticated()) {
          const userData = tokenStorage.getUserData();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token exists but no user data, clear everything
            tokenStorage.clearAll();
          }
        } else {
          // Token expired or doesn't exist
          tokenStorage.clearAll();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        tokenStorage.clearAll();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAndRefreshToken = () => {
      if (tokenStorage.needsRefresh()) {
        // Token needs refresh - for now just logout
        // In production, call refresh token endpoint
        console.warn('Token needs refresh');
      }
    };

    // Check every minute
    const interval = setInterval(checkAndRefreshToken, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  /**
   * Login - Set user authentication state
   */
  const login = useCallback(({ accessToken, refreshToken, user: userData }) => {
    try {
      tokenStorage.setAuthData({
        accessToken,
        refreshToken,
        user: userData,
      });

      setUser(userData);
      setIsAuthenticated(true);
      setAuthError(null);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Failed to save authentication data');
      return false;
    }
  }, []);

  /**
   * Logout - Clear all authentication state
   */
  const logout = useCallback(() => {
    tokenStorage.clearAll();
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  }, []);

  /**
   * Update user data
   */
  const updateUser = useCallback((newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    tokenStorage.setUserData(updatedUser);
    setUser(updatedUser);
  }, [user]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  /**
   * Check if user is a student
   */
  const isStudent = useCallback(() => {
    return hasRole(USER_ROLES.STUDENT);
  }, [hasRole]);

  /**
   * Check if user is faculty
   */
  const isFaculty = useCallback(() => {
    return hasRole(USER_ROLES.FACULTY);
  }, [hasRole]);

  /**
   * Get current access token
   */
  const getToken = useCallback(() => {
    return tokenStorage.getAccessToken();
  }, []);

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    authError,
    
    // Methods
    login,
    logout,
    updateUser,
    hasRole,
    isStudent,
    isFaculty,
    getToken,
    
    // Constants
    roles: USER_ROLES,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuthContext - Hook to access auth context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;
