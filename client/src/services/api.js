import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token into outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civictrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401s and optionally handle expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and we had a token, remove it
      if (localStorage.getItem('civictrack_token')) {
        console.warn('Session expired or unauthorized. Clearing stored auth token.');
        localStorage.removeItem('civictrack_token');
        localStorage.removeItem('civictrack_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
