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
  BOUTIQUE_APPLICATIONS: `${API_BASE_URL}/api/boutiques/applications`,
  
  // Notifications
  SEND_APPROVAL_EMAIL: `${API_BASE_URL}/api/notifications/send-approval`,
  SEND_REJECTION_EMAIL: `${API_BASE_URL}/api/notifications/send-rejection`,
  
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

  async getBoutiqueApplications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.BOUTIQUE_APPLICATIONS}?${queryString}` : API_ENDPOINTS.BOUTIQUE_APPLICATIONS;
    return await this.request(url);
  }

  async getBoutiqueApplicationById(id) {
    return await this.request(`${API_ENDPOINTS.BOUTIQUE_APPLICATIONS}/${id}`);
  }

  async updateBoutiqueApplicationStatus(id, status) {
    return await this.request(`${API_ENDPOINTS.BOUTIQUE_APPLICATIONS}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateBoutique(id, updates) {
    return await this.request(API_ENDPOINTS.BOUTIQUE_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteBoutiqueApplication(id) {
    return await this.request(`${API_ENDPOINTS.BOUTIQUE_APPLICATIONS}/${id}`, {
      method: 'DELETE',
    });
  }

  async sendApprovalEmail(email, boutiqueName) {
    return await this.request(API_ENDPOINTS.SEND_APPROVAL_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ email, boutiqueName }),
    });
  }

  async sendRejectionEmail(email, boutiqueName, reason) {
    return await this.request(API_ENDPOINTS.SEND_REJECTION_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ email, boutiqueName, reason }),
    });
  }

  // Order methods
  async getOrders() {
    return await this.request(API_ENDPOINTS.ORDERS);
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
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
