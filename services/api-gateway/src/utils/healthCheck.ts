import axios from 'axios';
import { services } from '../config/services';

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
}

export const checkServiceHealth = async (serviceName: string): Promise<ServiceHealth> => {
  const service = services[serviceName];
  if (!service) {
    return {
      name: serviceName,
      status: 'unknown',
      error: 'Service not configured',
    };
  }

  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${service.url}${service.healthPath}`, {
      timeout: 5000,
    });

    const responseTime = Date.now() - startTime;

    if (response.status === 200) {
      return {
        name: service.name,
        status: 'healthy',
        responseTime,
      };
    }

    return {
      name: service.name,
      status: 'unhealthy',
      responseTime,
      error: `Unexpected status code: ${response.status}`,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      name: service.name,
      status: 'unhealthy',
      responseTime,
      error: error.message || 'Connection failed',
    };
  }
};

export const checkAllServices = async (): Promise<Record<string, ServiceHealth>> => {
  const serviceNames = Object.keys(services);
  const healthChecks = await Promise.all(
    serviceNames.map((name) => checkServiceHealth(name))
  );

  const results: Record<string, ServiceHealth> = {};
  healthChecks.forEach((health) => {
    results[health.name] = health;
  });

  return results;
};
