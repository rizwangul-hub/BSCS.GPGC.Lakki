import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api.js';
import { clearApiCache } from '../hooks/useCachedGet.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Set Authorization header whenever token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load current user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data.user || response.data.data);
          }
        } catch (error) {
          // Only clear session on 401 Unauthorized (invalid/expired token).
          // Network errors or backend downtime should NOT log the user out.
          if (error.response?.status === 401) {
            console.warn('Session expired. Clearing local token.');
            setToken('');
            setUser(null);
          } else {
            console.warn('Could not verify session (backend may be offline):', error.message);
          }
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []); // run once on mount — token is read from the closure via the initial state value

  // Login handler
  const loginUser = async (mobileNumber, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { mobileNumber, password });
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        setToken(accessToken);
        setUser(user);
        return { success: true, message: response.data.message, role: user.role, user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Student registration handler
  const registerStudent = async (studentData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register-student', studentData);
      if (response.data.success) {
        setToken(response.data.data.accessToken);
        setUser(response.data.data.user);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password request
  const forgotPassword = async (emailOrMobile) => {
    setLoading(true);
    try {
      const payload = emailOrMobile.includes('@')
        ? { email: emailOrMobile }
        : { mobileNumber: emailOrMobile };
      const response = await api.post('/auth/forgot-password', payload);
      return { success: true, message: response.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Request failed. Please try again.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Reset Password request
  const resetPassword = async (tokenParam, password) => {
    setLoading(true);
    try {
      const response = await api.post(`/auth/reset-password/${tokenParam}`, { password });
      return { success: true, message: response.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Reset failed. Please try again.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logoutUser = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearApiCache();
      setToken('');
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || '',
        token,
        loading,
        loginUser,
        registerStudent,
        forgotPassword,
        resetPassword,
        logoutUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
