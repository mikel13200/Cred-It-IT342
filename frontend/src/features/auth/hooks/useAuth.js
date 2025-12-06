import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../../api';
import { useNotification } from '../../../hooks';
import { useAuthContext, USER_ROLES } from '../../../context';

export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useNotification();
  const { login: contextLogin, logout: contextLogout } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const login = async (accountID, accountPass) => {
    setLoading(true);
    try {
      const data = await authApi.login(accountID, accountPass);

      if (data.message || data.accessToken) {
        // Store auth data in context
        const loginSuccess = contextLogin({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        });

        if (loginSuccess) {
          showSuccess('Login successful!');

          // Check if there's a redirect location saved
          const from = location.state?.from;
          
          // Navigate based on role or saved location
          if (from && from !== '/') {
            navigate(from, { replace: true });
          } else if (data.user.role === USER_ROLES.STUDENT) {
            navigate('/HomePage', { replace: true });
          } else if (data.user.role === USER_ROLES.FACULTY) {
            navigate('/DepartmentHome', { replace: true });
          } else {
            showError('Unauthorized role');
          }
        }
      }
    } catch (error) {
      showError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (accountID, accountPass) => {
    setLoading(true);
    try {
      const data = await authApi.register(accountID, accountPass);
      showSuccess(data.message || 'Registration successful!');
      return true;
    } catch (error) {
      showError(error.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Call logout API to invalidate token on server
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      // Always clear local state
      contextLogout();
      setLoading(false);
      navigate('/', { replace: true });
    }
  };

  return { login, register, logout, loading };
}