import { apiRequest, setCsrfToken, clearCsrfToken } from './api';

export const authService = {
  // Register a new user account
  async register({ name, email, password }) {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });

    if (res.data?.csrfToken) {
      setCsrfToken(res.data.csrfToken);
    }
    return res.data?.user;
  },

  // Authenticate user with email and password
  async login({ email, password }) {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (res.data?.csrfToken) {
      setCsrfToken(res.data.csrfToken);
    }
    return res.data?.user;
  },

  // Terminate active session
  async logout() {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      clearCsrfToken();
    }
  },

  // Check current session
  async getMe() {
    const res = await apiRequest('/api/auth/me', {
      method: 'GET',
    });

    if (res.data?.csrfToken) {
      setCsrfToken(res.data.csrfToken);
    }
    return res.data?.user;
  },
};
