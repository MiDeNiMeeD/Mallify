// API Configuration
const API_BASE_URL = 'http://localhost:4000';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  
  // Users
  USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/users/profile`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,
  PRODUCTS_BY_BOUTIQUE: (boutiqueId) => `${API_BASE_URL}/api/products/boutique/${boutiqueId}`,
  PRODUCT_STOCK: (id) => `${API_BASE_URL}/api/products/${id}/stock`,
  
  // Boutiques
  BOUTIQUES: `${API_BASE_URL}/api/boutiques`,
  BOUTIQUE_BY_ID: (id) => `${API_BASE_URL}/api/boutiques/${id}`,
  BOUTIQUE_BY_SLUG: (slug) => `${API_BASE_URL}/api/boutiques/slug/${slug}`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDER_BY_ID: (id) => `${API_BASE_URL}/api/orders/${id}`,
  ORDER_STATUS: (id) => `${API_BASE_URL}/api/orders/${id}/status`,
  
  // Payments
  PAYMENTS: `${API_BASE_URL}/api/payments`,
  
  // Promotions
  PROMOTIONS: `${API_BASE_URL}/api/promotions`,
  PROMOTION_BY_ID: (id) => `${API_BASE_URL}/api/promotions/${id}`,
  PROMOTION_BY_CODE: (code) => `${API_BASE_URL}/api/promotions/code/${code}`,
  ACTIVE_PROMOTIONS: `${API_BASE_URL}/api/promotions/active`,
  VALIDATE_PROMOTION: `${API_BASE_URL}/api/promotions/validate`,
  
  // Reviews
  REVIEWS: `${API_BASE_URL}/api/reviews`,
  REVIEW_BY_ID: (id) => `${API_BASE_URL}/api/reviews/${id}`,
  
  // Messages
  MESSAGES: `${API_BASE_URL}/api/chat`,
  MESSAGE_BY_ID: (id) => `${API_BASE_URL}/api/chat/${id}`,
  MARK_MESSAGE_READ: (id) => `${API_BASE_URL}/api/chat/${id}/read`,
  
  // Analytics
  ANALYTICS_EVENTS: `${API_BASE_URL}/api/analytics/events`,
  ANALYTICS_STATISTICS: `${API_BASE_URL}/api/analytics/statistics`,
  ANALYTICS_TRACK: `${API_BASE_URL}/api/analytics/track`,
  
  // Deliveries
  DELIVERIES: `${API_BASE_URL}/api/deliveries`,
  DELIVERY_BY_ID: (id) => `${API_BASE_URL}/api/deliveries/${id}`,
};

// API client with authentication
class ApiClient {
  constructor() {
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getAuthHeaders() {
    return this.token
      ? { Authorization: `Bearer ${this.token}` }
      : {};
  }

  async request(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const data = await this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.success && data.data.accessToken) {
      this.setToken(data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  }

  async register(userData) {
    const data = await this.request(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.success && data.data.accessToken) {
      this.setToken(data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // User methods
  async getProfile() {
    return await this.request(API_ENDPOINTS.USER_PROFILE);
  }

  async updateProfile(profileData) {
    return await this.request(API_ENDPOINTS.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Product methods
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.PRODUCTS}?${queryString}` : API_ENDPOINTS.PRODUCTS;
    return await this.request(url);
  }

  async getProductById(id) {
    return await this.request(API_ENDPOINTS.PRODUCT_BY_ID(id));
  }

  // Boutique methods
  async getBoutiques(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.BOUTIQUES}?${queryString}` : API_ENDPOINTS.BOUTIQUES;
    return await this.request(url);
  }

  async getBoutiqueById(id) {
    return await this.request(API_ENDPOINTS.BOUTIQUE_BY_ID(id));
  }

  // Order methods
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.ORDERS}?${queryString}` : API_ENDPOINTS.ORDERS;
    return await this.request(url);
  }

  async createOrder(orderData) {
    return await this.request(API_ENDPOINTS.ORDERS, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrderById(id) {
    return await this.request(API_ENDPOINTS.ORDER_BY_ID(id));
  }

  async updateOrderStatus(id, status) {
    return await this.request(API_ENDPOINTS.ORDER_STATUS(id), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Product methods (extended)
  async getProductsByBoutique(boutiqueId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString 
      ? `${API_ENDPOINTS.PRODUCTS_BY_BOUTIQUE(boutiqueId)}?${queryString}` 
      : API_ENDPOINTS.PRODUCTS_BY_BOUTIQUE(boutiqueId);
    return await this.request(url);
  }

  async createProduct(productData) {
    return await this.request(API_ENDPOINTS.PRODUCTS, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return await this.request(API_ENDPOINTS.PRODUCT_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async updateProductStock(id, quantity) {
    return await this.request(API_ENDPOINTS.PRODUCT_STOCK(id), {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async deleteProduct(id) {
    return await this.request(API_ENDPOINTS.PRODUCT_BY_ID(id), {
      method: 'DELETE',
    });
  }

  // Boutique methods (extended)
  async updateBoutique(id, boutiqueData) {
    return await this.request(API_ENDPOINTS.BOUTIQUE_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(boutiqueData),
    });
  }

  async getBoutiqueBySlug(slug) {
    return await this.request(API_ENDPOINTS.BOUTIQUE_BY_SLUG(slug));
  }

  // Promotion methods
  async getPromotions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.PROMOTIONS}?${queryString}` : API_ENDPOINTS.PROMOTIONS;
    return await this.request(url);
  }

  async getActivePromotions() {
    return await this.request(API_ENDPOINTS.ACTIVE_PROMOTIONS);
  }

  async getPromotionById(id) {
    return await this.request(API_ENDPOINTS.PROMOTION_BY_ID(id));
  }

  async getPromotionByCode(code) {
    return await this.request(API_ENDPOINTS.PROMOTION_BY_CODE(code));
  }

  async createPromotion(promotionData) {
    return await this.request(API_ENDPOINTS.PROMOTIONS, {
      method: 'POST',
      body: JSON.stringify(promotionData),
    });
  }

  async updatePromotion(id, promotionData) {
    return await this.request(API_ENDPOINTS.PROMOTION_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(promotionData),
    });
  }

  async deletePromotion(id) {
    return await this.request(API_ENDPOINTS.PROMOTION_BY_ID(id), {
      method: 'DELETE',
    });
  }

  async validatePromotion(code, orderTotal) {
    return await this.request(API_ENDPOINTS.VALIDATE_PROMOTION, {
      method: 'POST',
      body: JSON.stringify({ code, orderTotal }),
    });
  }

  // Review methods
  async getReviews(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.REVIEWS}?${queryString}` : API_ENDPOINTS.REVIEWS;
    return await this.request(url);
  }

  async createReview(reviewData) {
    return await this.request(API_ENDPOINTS.REVIEWS, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(id) {
    return await this.request(API_ENDPOINTS.REVIEW_BY_ID(id), {
      method: 'DELETE',
    });
  }

  // Message methods
  async getMessages(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.MESSAGES}?${queryString}` : API_ENDPOINTS.MESSAGES;
    return await this.request(url);
  }

  async sendMessage(messageData) {
    return await this.request(API_ENDPOINTS.MESSAGES, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(id) {
    return await this.request(API_ENDPOINTS.MARK_MESSAGE_READ(id), {
      method: 'PATCH',
    });
  }

  async deleteMessage(id) {
    return await this.request(API_ENDPOINTS.MESSAGE_BY_ID(id), {
      method: 'DELETE',
    });
  }

  // Analytics methods
  async getAnalyticsEvents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.ANALYTICS_EVENTS}?${queryString}` : API_ENDPOINTS.ANALYTICS_EVENTS;
    return await this.request(url);
  }

  async getAnalyticsStatistics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.ANALYTICS_STATISTICS}?${queryString}` : API_ENDPOINTS.ANALYTICS_STATISTICS;
    return await this.request(url);
  }

  async trackAnalyticsEvent(eventData) {
    return await this.request(API_ENDPOINTS.ANALYTICS_TRACK, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // Dashboard methods (computed from various endpoints)
  async getDashboardStats(boutiqueId) {
    try {
      // Fetch orders for boutique
      const ordersResponse = await this.getOrders({ boutiqueId });
      const orders = ordersResponse.data || [];
      
      // Fetch products for boutique
      const productsResponse = await this.getProductsByBoutique(boutiqueId);
      const products = productsResponse.data || [];
      
      // Calculate stats
      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      const activeProducts = products.filter(p => p.status === 'active').length;
      const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= 10).length;
      
      // Get recent orders (last 5)
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      return {
        success: true,
        data: {
          totalRevenue,
          totalOrders,
          pendingOrders,
          completedOrders,
          activeProducts,
          lowStockProducts,
          recentOrders,
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Delivery methods
  async getDeliveries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.DELIVERIES}?${queryString}` : API_ENDPOINTS.DELIVERIES;
    return await this.request(url);
  }

  async getDeliveryById(id) {
    return await this.request(API_ENDPOINTS.DELIVERY_BY_ID(id));
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
