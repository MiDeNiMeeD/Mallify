const axios = require("axios");

/**
 * HTTP client with retry logic and timeout
 */
class HttpClient {
  constructor(baseURL, options = {}) {
    this.client = axios.create({
      baseURL,
      timeout: options.timeout || 10000,
      headers: options.headers || {},
    });

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(
          `Making ${config.method.toUpperCase()} request to ${config.url}`
        );
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;

        // Retry logic
        if (!config || !config.retry) {
          config.retry = { count: 0, max: 3, delay: 1000 };
        }

        if (config.retry.count < config.retry.max) {
          config.retry.count++;
          console.log(
            `Retrying request (${config.retry.count}/${config.retry.max})`
          );

          await this.delay(config.retry.delay);
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data, config = {}) {
    return this.client.put(url, data, config);
  }

  async patch(url, data, config = {}) {
    return this.client.patch(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }
}

module.exports = HttpClient;
