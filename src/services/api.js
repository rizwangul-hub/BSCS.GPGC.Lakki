import axios from 'axios';

// Create configured Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true,   // sends httpOnly refresh-token cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ───────────────────────────────────────────────────────
// Attach the stored JWT access token to every outgoing request.
// This covers requests fired before AuthContext's useEffect has run.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor (with silent token refresh) ─────────────────────────
// When the server returns 401 (access token expired), automatically call
// POST /auth/refresh-token to get a new access token, then retry the
// original request — the user never sees an interruption.
let isRefreshing = false;
let failedRequestsQueue = [];

const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and only once per request (_retry flag)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints (login, refresh-token, logout)
      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh-token') ||
        originalRequest.url?.includes('/auth/logout');

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If another request is already refreshing, queue this one
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Call refresh-token endpoint — the httpOnly cookie is sent automatically
        const refreshResponse = await api.post('/auth/refresh-token');
        const newAccessToken = refreshResponse.data?.data?.accessToken;

        if (!newAccessToken) throw new Error('No access token in refresh response');

        // Persist the new token
        localStorage.setItem('token', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // Resolve all queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original failed request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh also failed — force logout
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];

        // Only redirect if not already on a public page
        const publicPaths = ['/login', '/forgot-password', '/reset-password', '/register', '/'];
        const isPublicPath = publicPaths.some((p) => window.location.pathname === p || window.location.pathname.startsWith(p + '/'));
        if (!isPublicPath) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
