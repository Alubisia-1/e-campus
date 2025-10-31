// API Base URL - uses environment variable or defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Debug logging - shows what API URL is being used
console.log('🔍 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL,
  MODE: import.meta.env.MODE,
  ALL_ENV_VARS: import.meta.env
});

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// API Services
export const api = {
  // Categories
  getCategories: () => apiRequest('/categories'),

  // Products
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/products?${searchParams}`);
  },

  getProductById: (id) => apiRequest(`/products/${id}`),

  searchProducts: (query, params = {}) => {
    const searchParams = new URLSearchParams({ q: query, ...params });
    return apiRequest(`/products/search?${searchParams}`);
  },

  createProduct: (productData, token) => apiRequest('/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  }),

  deleteProduct: (productId, token, data) => apiRequest(`/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data || {}),
  }),

  getMyListings: (token, params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/products/user/my-listings?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  revealContact: (productId) => apiRequest(`/products/${productId}/reveal-contact`, {
    method: 'POST',
  }),

  // Upload endpoints
  uploadProductImages: (formData, token) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - browser sets it automatically with boundary
    return fetch(`${API_BASE_URL}/upload/product-images`, {
      method: 'POST',
      headers: headers,
      body: formData, // FormData object
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }
      return data;
    });
  },

  // Advertisements
  getAds: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/ads?${searchParams}`);
  },

  getAdById: (id) => apiRequest(`/ads/${id}`),

  trackAdImpression: (id) => apiRequest(`/ads/${id}/impression`, {
    method: 'POST',
  }),

  // Auth
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  getMe: (token) => apiRequest('/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  // Health check
  healthCheck: () => fetch(`${API_BASE_URL.replace('/api', '')}/health`).then(res => res.json()),
};

export default api;