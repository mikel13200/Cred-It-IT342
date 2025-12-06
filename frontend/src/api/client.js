import { API_BASE_URL } from './config';
import { tokenStorage } from '../utils/tokenStorage';

// Event for handling auth errors globally
const AUTH_ERROR_EVENT = 'auth:error';

// Dispatch auth error event (can be listened to by AuthContext)
export const dispatchAuthError = () => {
  window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT));
};

// Subscribe to auth error events
export const onAuthError = (callback) => {
  window.addEventListener(AUTH_ERROR_EVENT, callback);
  return () => window.removeEventListener(AUTH_ERROR_EVENT, callback);
};

class ApiClient {
 
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * Get authorization headers with JWT token
   */
  getAuthHeaders() {
    const token = tokenStorage.getAccessToken();
    if (token) {
      return { 'Authorization': `Bearer ${token}` };
    }
    return {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Clear tokens and dispatch auth error
        tokenStorage.clearAll();
        dispatchAuthError();
        throw new Error('Session expired. Please login again.');
      }

      // Handle 403 Forbidden - insufficient permissions
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      }

      if (!response.ok) {
        throw new Error(data.error || data.detail || `HTTP ${response.status}`);
      }

      return { data, status: response.status };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'DELETE' });
  }

  postFormData(endpoint, formData) {
    const token = tokenStorage.getAccessToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        tokenStorage.clearAll();
        dispatchAuthError();
        throw new Error('Session expired. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(data.error || data.detail || `HTTP ${response.status}`);
      }
      return { data, status: response.status };
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
