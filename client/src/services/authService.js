import api from './api';

export const authService = {
  // Register seller
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('parcelproof_token', response.data.token);
      localStorage.setItem('parcelproof_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login seller
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('parcelproof_token', response.data.token);
      localStorage.setItem('parcelproof_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout seller
  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('parcelproof_token');
      localStorage.removeItem('parcelproof_user');
    }
  },

  // Get current user profile
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update seller profile (name, shopName, phone, address)
  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.user) {
      localStorage.setItem('parcelproof_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Change password
  async changePassword(passwordData) {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },
};

export default authService;
