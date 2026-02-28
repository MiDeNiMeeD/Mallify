// API Configuration for Home App
const API_BASE_URL = 'http://localhost:4000';

// API endpoints
export const API_ENDPOINTS = {
  // Driver Applications
  DRIVER_APPLICATION: `${API_BASE_URL}/api/drivers/applications`,
  
  // Boutique Applications  
  BOUTIQUE_APPLICATION: `${API_BASE_URL}/api/boutiques/applications`,
  
  // Public endpoints
  PRODUCTS: `${API_BASE_URL}/api/products`,
  BOUTIQUES: `${API_BASE_URL}/api/boutiques`,
  PROMOTIONS: `${API_BASE_URL}/api/promotions/active`,
};

// API client for home page (no auth required for applications)
class HomeApiClient {
  async request(url, options = {}) {
    const headers = {
      ...options.headers,
    };

    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

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

  // Driver Application
  async submitDriverApplication(formData) {
    // Create FormData for file uploads
    const data = new FormData();
    data.append('name', formData.fullName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('city', formData.city);
    
    if (formData.cinFile) {
      data.append('cinDocument', formData.cinFile);
    }
    if (formData.permisFile) {
      data.append('licenseDocument', formData.permisFile);
    }

    return await this.request(API_ENDPOINTS.DRIVER_APPLICATION, {
      method: 'POST',
      body: data,
    });
  }

  // Boutique Application
  async submitBoutiqueApplication(formData) {
    const data = new FormData();
    data.append('name', formData.boutiqueName);
    data.append('ownerName', formData.ownerName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('city', formData.city);
    data.append('description', formData.description);
    data.append('category', formData.category);
    
    if (formData.businessLicense) {
      data.append('businessLicense', formData.businessLicense);
    }
    if (formData.taxCertificate) {
      data.append('taxCertificate', formData.taxCertificate);
    }

    return await this.request(API_ENDPOINTS.BOUTIQUE_APPLICATION, {
      method: 'POST',
      body: data,
    });
  }

  // Get public products
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.PRODUCTS}?${queryString}` : API_ENDPOINTS.PRODUCTS;
    return await this.request(url);
  }

  // Get public boutiques
  async getBoutiques(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.BOUTIQUES}?${queryString}` : API_ENDPOINTS.BOUTIQUES;
    return await this.request(url);
  }

  // Get active promotions
  async getPromotions() {
    return await this.request(API_ENDPOINTS.PROMOTIONS);
  }
}

// Export singleton instance
const homeApiClient = new HomeApiClient();
export default homeApiClient;
