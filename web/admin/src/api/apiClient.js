const API_BASE_URL = 'http://localhost:4000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(url, options = {}) {
    const token = localStorage.getItem('accessToken');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    try {
      const response = await this.request(`${this.baseURL}/api/users/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async register(userData) {
    try {
      const response = await this.request(`${this.baseURL}/api/users/register`, {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // User Management
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/api/users?${queryString}` : `${API_BASE_URL}/api/users`;
    return await this.request(url);
  }

  async getUserById(id) {
    return await this.request(`${API_BASE_URL}/api/users/${id}`);
  }

  async updateUser(id, userData) {
    return await this.request(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return await this.request(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Boutique Management
  async getBoutiques(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/api/boutiques?${queryString}` : `${API_BASE_URL}/api/boutiques`;
    return await this.request(url);
  }

  async getBoutiqueById(id) {
    return await this.request(`${API_BASE_URL}/api/boutiques/${id}`);
  }

  async updateBoutiqueStatus(id, status) {
    return await this.request(`${API_BASE_URL}/api/boutiques/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Order Management
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/api/orders?${queryString}` : `${API_BASE_URL}/api/orders`;
    return await this.request(url);
  }

  async getOrderById(id) {
    return await this.request(`${API_BASE_URL}/api/orders/${id}`);
  }

  // Analytics
  async getSystemAnalytics() {
    return await this.request(`${API_BASE_URL}/api/analytics/system`);
  }

  async getDashboardStats() {
    return await this.request(`${API_BASE_URL}/api/analytics/dashboard`);
  }

  // Audit Logs
  async getAuditLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/api/audit?${queryString}` : `${API_BASE_URL}/api/audit`;
    return await this.request(url);
  }

  // Notifications
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/api/notifications?${queryString}` : `${API_BASE_URL}/api/notifications`;
    return await this.request(url);
  }

  // System Settings
  async getSystemSettings() {
    return await this.request(`${API_BASE_URL}/api/settings`);
  }

  async updateSystemSettings(settings) {
    return await this.request(`${API_BASE_URL}/api/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

const apiClient = new ApiClient();
export default apiClient;
