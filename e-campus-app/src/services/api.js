// API Base URL - uses environment variable or defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Timeout helper function
function fetchWithTimeout(url, options = {}, timeout = 30000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout - please check your connection')), timeout)
    )
  ]);
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetchWithTimeout(url, config, options.timeout || 30000);
    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors from express-validator
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(err => err.msg).join(', ');
        throw new Error(errorMessages);
      }

      // Handle other API errors
      if (data.message) {
        throw new Error(data.message);
      }

      // Fallback error message
      throw new Error(`Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// API Services
export const api = {
  // Categories
  getCategories: (options = {}) => apiRequest('/categories', { timeout: options.timeout }),

  // Campuses
  getCampuses: (options = {}) => apiRequest('/campuses', { timeout: options.timeout }),

  createCampus: (campusData, token) => apiRequest('/campuses', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(campusData),
  }),

  updateCampus: (id, campusData, token) => apiRequest(`/campuses/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(campusData),
  }),

  deleteCampus: (id, token) => apiRequest(`/campuses/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  }),

  // Products
  getProducts: (params = {}) => {
    const { timeout, ...queryParams } = params;
    const searchParams = new URLSearchParams(queryParams);
    return apiRequest(`/products?${searchParams}`, { timeout });
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
    return fetchWithTimeout(`${API_BASE_URL}/upload/product-images`, {
      method: 'POST',
      headers: headers,
      body: formData, // FormData object
    }, 60000).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }
      return data;
    });
  },

  // Advertisements (Public)
  getAds: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/ads?${searchParams}`);
  },

  getAdById: (id) => apiRequest(`/ads/${id}`),

  trackAdImpression: (id) => apiRequest(`/ads/${id}/impression`, {
    method: 'POST',
  }),

  // Advertisements (Admin)
  getAllAdsAdmin: (token, params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/ads/admin/all?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  createAd: (adData, token) => apiRequest('/ads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(adData),
  }),

  updateAd: (id, adData, token) => apiRequest(`/ads/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(adData),
  }),

  deleteAd: (id, token) => apiRequest(`/ads/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  toggleAdStatus: (id, token) => apiRequest(`/ads/${id}/toggle`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  markAdPaid: (id, paymentData, token) => apiRequest(`/ads/${id}/mark-paid`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData),
  }),

  getRevenue: (token, params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/ads/admin/revenue?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Sponsored Products (Admin)
  sponsorProduct: (id, sponsorData, token) => apiRequest(`/products/${id}/sponsor`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(sponsorData),
  }),

  unsponsorProduct: (id, token) => apiRequest(`/products/${id}/unsponsor`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  // Public Ad Viewing (for users)
  getActiveAds: (position = '') => {
    const searchParams = new URLSearchParams({
      ...(position && { position })
    });
    return apiRequest(`/ads?${searchParams}`);
  },

  // Track ad impression
  trackAdImpression: (adId) => apiRequest(`/ads/${adId}/impression`, {
    method: 'POST',
  }),

  // Track ad click
  trackAdClick: (adId) => apiRequest(`/ads/${adId}/click`, {
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

  // Password Reset
  forgotPassword: (email) => apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  resetPassword: (token, password) => apiRequest(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  }),

  // Admin authentication
  adminLogin: (password) => apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  }),

  verifyAdmin: (token) => apiRequest('/admin/verify', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  // Health check
  healthCheck: () => fetchWithTimeout(`${API_BASE_URL.replace('/api', '')}/health`, {}, 10000).then(res => res.json()),
};

export default api;