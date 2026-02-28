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
  
  // Boutiques
  BOUTIQUES: `${API_BASE_URL}/api/boutiques`,
  BOUTIQUE_BY_ID: (id) => `${API_BASE_URL}/api/boutiques/${id}`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDER_BY_ID: (id) => `${API_BASE_URL}/api/orders/${id}`,
  
  // Payments
  PAYMENTS: `${API_BASE_URL}/api/payments`,
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

  async updateBoutique(id, updates) {
    return await this.request(API_ENDPOINTS.BOUTIQUE_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
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

  // Delivery methods
  async getDeliveries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/api/deliveries?${queryString}` : `${API_BASE_URL}/api/deliveries`;
    return await this.request(url);
  }

  async getDeliveryById(id) {
    return await this.request(`${API_BASE_URL}/api/deliveries/${id}`);
  }

  async updateDeliveryStatus(id, status) {
    return await this.request(`${API_BASE_URL}/api/deliveries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async assignDriver(deliveryId, driverId) {
    return await this.request(`${API_BASE_URL}/api/deliveries/${deliveryId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ driverId }),
    });
  }

  // Driver methods
  async getDrivers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/api/drivers?${queryString}` : `${API_BASE_URL}/api/drivers`;
    return await this.request(url);
  }

  async getDriverById(id) {
    return await this.request(`${API_BASE_URL}/api/drivers/${id}`);
  }

  async updateDriverStatus(id, status) {
    return await this.request(`${API_BASE_URL}/api/drivers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateDriverLocation(id, location) {
    return await this.request(`${API_BASE_URL}/api/drivers/${id}/location`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  }

  async getDriverPerformance(id) {
    return await this.request(`${API_BASE_URL}/api/drivers/${id}/performance`);
  }

  // Zone methods
  async getZones(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/api/delivery-zones?${queryString}` : `${API_BASE_URL}/api/delivery-zones`;
    return await this.request(url);
  }

  async assignDriverToZone(driverId, zoneId) {
    return await this.request(`${API_BASE_URL}/api/delivery-zones/${zoneId}/assign-driver`, {
      method: 'PUT',
      body: JSON.stringify({ driverId }),
    });
  }

  // Dashboard stats
  async getDashboardStats() {
    try {
      const [deliveriesRes, driversRes] = await Promise.all([
        this.getDeliveries({ limit: 1000 }),
        this.getDrivers({ limit: 1000 })
      ]);

      const deliveries = deliveriesRes.data?.deliveries || [];
      const drivers = driversRes.data?.drivers || [];

      return {
        success: true,
        data: {
          totalDeliveries: deliveries.length,
          pendingDeliveries: deliveries.filter(d => d.status === 'pending').length,
          inTransitDeliveries: deliveries.filter(d => d.status === 'in_transit').length,
          completedDeliveries: deliveries.filter(d => d.status === 'delivered').length,
          totalDrivers: drivers.length,
          activeDrivers: drivers.filter(d => d.status === 'active' || d.status === 'available').length,
          recentDeliveries: deliveries.slice(0, 10),
          recentActivity: [] // Can be enhanced with activity logs
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, data: null };
    }
  }

  // Dispute methods (for delivery issues)
  async getDisputes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/api/disputes?${queryString}` : `${API_BASE_URL}/api/disputes`;
    return await this.request(url);
  }

  async getDisputeById(id) {
    return await this.request(`${API_BASE_URL}/api/disputes/${id}`);
  }

  async createDispute(disputeData) {
    return await this.request(`${API_BASE_URL}/api/disputes`, {
      method: 'POST',
      body: JSON.stringify(disputeData),
    });
  }

  async updateDisputeStatus(id, status) {
    return await this.request(`${API_BASE_URL}/api/disputes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async resolveDispute(id, resolution) {
    return await this.request(`${API_BASE_URL}/api/disputes/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(resolution),
    });
  }

  // Driver application methods
  async getDriverApplications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/api/drivers/applications?${queryString}` : `${API_BASE_URL}/api/drivers/applications`;
    return await this.request(url);
  }

  async getDriverApplicationById(id) {
    return await this.request(`${API_BASE_URL}/api/drivers/applications/${id}`);
  }

  async updateApplicationStatus(id, status) {
    return await this.request(`${API_BASE_URL}/api/drivers/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Message methods (for chat)
  async getMessages(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/api/chat?${queryString}` : `${API_BASE_URL}/api/chat`;
    return await this.request(url);
  }

  async sendMessage(messageData) {
    return await this.request(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(id) {
    return await this.request(`${API_BASE_URL}/api/chat/${id}/read`, {
      method: 'PATCH',
    });
  }

  // Notification methods
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/api/notifications?${queryString}` : `${API_BASE_URL}/api/notifications`;
    return await this.request(url);
  }

  async getNotificationById(id) {
    return await this.request(`${API_BASE_URL}/api/notifications/${id}`);
  }

  async createNotification(notificationData) {
    return await this.request(`${API_BASE_URL}/api/notifications`, {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async markNotificationAsRead(id) {
    return await this.request(`${API_BASE_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
