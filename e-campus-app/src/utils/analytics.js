/**
 * Google Analytics 4 Event Tracking Utility
 *
 * This utility provides helper functions to track custom events in Google Analytics.
 * Events help you understand user behavior and measure business goals.
 */

/**
 * Send a custom event to Google Analytics
 * @param {string} eventName - Name of the event
 * @param {object} eventParams - Additional parameters for the event
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
    console.log('GA Event:', eventName, eventParams);
  }
};

/**
 * Track when a user views a product
 * @param {object} product - Product data
 */
export const trackProductView = (product) => {
  trackEvent('view_item', {
    currency: 'KES',
    value: product.price,
    items: [{
      item_id: product._id,
      item_name: product.title,
      item_category: product.category?.name || 'Unknown',
      price: product.price,
      item_brand: 'Student Seller'
    }]
  });
};

/**
 * Track when a user searches
 * @param {string} searchTerm - The search query
 */
export const trackSearch = (searchTerm) => {
  trackEvent('search', {
    search_term: searchTerm
  });
};

/**
 * Track when a user reveals contact information
 * @param {string} productId - Product ID
 * @param {string} productTitle - Product title
 */
export const trackContactReveal = (productId, productTitle) => {
  trackEvent('contact_reveal', {
    product_id: productId,
    product_name: productTitle,
    engagement_type: 'contact'
  });
};

/**
 * Track when a user creates a listing
 * @param {object} product - Newly created product
 */
export const trackListingCreated = (product) => {
  trackEvent('listing_created', {
    product_id: product._id,
    product_name: product.title,
    category: product.category?.name || 'Unknown',
    price: product.price,
    has_images: product.images?.length > 0
  });
};

/**
 * Track when a user selects a category
 * @param {string} categoryName - Category name
 */
export const trackCategoryView = (categoryName) => {
  trackEvent('view_item_list', {
    item_list_name: categoryName
  });
};

/**
 * Track when a user filters products
 * @param {object} filters - Applied filters
 */
export const trackProductFilter = (filters) => {
  trackEvent('filter_products', {
    category: filters.category || 'all',
    min_price: filters.minPrice || 0,
    max_price: filters.maxPrice || 'unlimited',
    condition: filters.condition || 'all'
  });
};

/**
 * Track when a user views their listings
 */
export const trackMyListingsView = () => {
  trackEvent('view_my_listings');
};

/**
 * Track when a user deletes a listing
 * @param {string} productId - Product ID
 */
export const trackListingDeleted = (productId) => {
  trackEvent('listing_deleted', {
    product_id: productId
  });
};

/**
 * Track when a user logs in
 * @param {string} method - Login method (e.g., 'email', 'google')
 */
export const trackLogin = (method = 'email') => {
  trackEvent('login', {
    method: method
  });
};

/**
 * Track when a user signs up
 * @param {string} method - Sign up method (e.g., 'email', 'google')
 */
export const trackSignUp = (method = 'email') => {
  trackEvent('sign_up', {
    method: method
  });
};

/**
 * Track page views (for SPAs)
 * @param {string} pagePath - Page path
 * @param {string} pageTitle - Page title
 */
export const trackPageView = (pagePath, pageTitle) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-12PVMH4NY8', {
      page_path: pagePath,
      page_title: pageTitle
    });
  }
};

/**
 * Track when a user clicks on an advertisement
 * @param {string} adId - Advertisement ID
 * @param {string} adTitle - Advertisement title
 */
export const trackAdClick = (adId, adTitle) => {
  trackEvent('ad_click', {
    ad_id: adId,
    ad_name: adTitle
  });
};

export default {
  trackEvent,
  trackProductView,
  trackSearch,
  trackContactReveal,
  trackListingCreated,
  trackCategoryView,
  trackProductFilter,
  trackMyListingsView,
  trackListingDeleted,
  trackLogin,
  trackSignUp,
  trackPageView,
  trackAdClick
};
