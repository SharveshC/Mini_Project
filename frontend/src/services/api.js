/**
 * Centralized API Client
 * - Configured with credentials: 'include' for session cookies
 * - Automatically attaches in-memory X-CSRF-Token for state-changing requests
 * - Never stores secrets, credentials, or tokens in localStorage/sessionStorage
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

let inMemoryCsrfToken = null;

export function setCsrfToken(token) {
  inMemoryCsrfToken = token;
}

export function clearCsrfToken() {
  inMemoryCsrfToken = null;
}

export function getCsrfToken() {
  return inMemoryCsrfToken;
}

// Fetch a fresh CSRF token from backend
export async function fetchCsrfToken() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });
    const json = await res.json();
    if (json.success && json.data && json.data.csrfToken) {
      inMemoryCsrfToken = json.data.csrfToken;
      return inMemoryCsrfToken;
    }
  } catch (err) {
    console.warn('Unable to fetch CSRF token:', err.message);
  }
  return null;
}

// Primary request wrapper
export async function apiRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...options.headers };

  // For state-changing operations, guarantee an active CSRF token
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (stateChangingMethods.includes(method)) {
    let token = inMemoryCsrfToken;
    if (!token) {
      token = await fetchCsrfToken();
    }
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  // Handle JSON bodies
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'include', // Crucial for session cookies
  });

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data && typeof data === 'object' && data.message
      ? data.message
      : `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
