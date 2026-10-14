import api from './api';

export const authService = {
  // Citizen Registration
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.token) {
      localStorage.setItem('civictrack_token', response.data.token);
      localStorage.setItem('civictrack_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // User Login (Citizen or Admin)
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('civictrack_token', response.data.token);
      localStorage.setItem('civictrack_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get current user profile & stats
  async getMe() {
    const response = await api.get('/auth/me');
    if (response.data.user) {
      localStorage.setItem('civictrack_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('civictrack_token');
    localStorage.removeItem('civictrack_user');
  },

  // Get stored auth credentials
  getStoredUser() {
    try {
      const userStr = localStorage.getItem('civictrack_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('civictrack_token');
  },
};
