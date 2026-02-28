import { Request, Response } from 'express';
import Delivery from '../models/Delivery';

/**
 * AI-powered Route Optimization Controller
 * Implements intelligent route planning for delivery optimization
 */

interface Location {
  lat: number;
  lng: number;
}

interface RouteStop {
  deliveryId: string;
  location: Location;
  address: string;
  priority: number;
  estimatedTime: number;
}

interface OptimizedRoute {
  driverId: string;
  stops: RouteStop[];
  totalDistance: number;
  totalTime: number;
  efficiency: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (loc1: Location, loc2: Location): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Nearest Neighbor algorithm for route optimization
 */
const optimizeRouteNearestNeighbor = (stops: RouteStop[], startLocation: Location): RouteStop[] => {
  const optimized: RouteStop[] = [];
  const remaining = [...stops];
  let currentLocation = startLocation;
  
  while (remaining.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;
    
    remaining.forEach((stop, index) => {
      const distance = calculateDistance(currentLocation, stop.location);
      // Factor in priority (higher priority = lower effective distance)
      const effectiveDistance = distance / (stop.priority || 1);
      
      if (effectiveDistance < minDistance) {
        minDistance = effectiveDistance;
        nearestIndex = index;
      }
    });
    
    const nearest = remaining.splice(nearestIndex, 1)[0];
    optimized.push(nearest);
    currentLocation = nearest.location;
  }
  
  return optimized;
};

/**
 * Calculate total route metrics
 */
const calculateRouteMetrics = (stops: RouteStop[], startLocation: Location) => {
  let totalDistance = 0;
  let totalTime = 0;
  let currentLocation = startLocation;
  
  stops.forEach(stop => {
    const distance = calculateDistance(currentLocation, stop.location);
    totalDistance += distance;
    // Estimate time: distance / average speed (30 km/h in city) + stop time
    totalTime += (distance / 30) * 60 + (stop.estimatedTime || 5);
    currentLocation = stop.location;
  });
  
  return { totalDistance: Math.round(totalDistance * 100) / 100, totalTime: Math.round(totalTime) };
};

/**
 * Optimize route for a single driver
 */
export const optimizeRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId, deliveryIds, startLocation } = req.body;
    
    if (!driverId || !deliveryIds || !startLocation) {
      res.status(400).json({ error: 'driverId, deliveryIds, and startLocation are required' });
      return;
    }
    
    // Fetch deliveries
    const deliveries = await Delivery.find({
      _id: { $in: deliveryIds },
      status: { $in: ['assigned', 'picked_up'] }
    });
    
    if (deliveries.length === 0) {
      res.status(404).json({ error: 'No eligible deliveries found' });
      return;
    }
    
    // Prepare route stops
    const stops: RouteStop[] = deliveries.map(delivery => ({
      deliveryId: delivery._id.toString(),
      location: delivery.deliveryAddress.coordinates || { lat: 0, lng: 0 },
      address: `${delivery.deliveryAddress.street}, ${delivery.deliveryAddress.city}`,
      priority: delivery.deliveryMethod === 'same_day' ? 3 : delivery.deliveryMethod === 'express' ? 2 : 1,
      estimatedTime: 5 // minutes per stop
    }));
    
    // Optimize route
    const optimizedStops = optimizeRouteNearestNeighbor(stops, startLocation);
    const metrics = calculateRouteMetrics(optimizedStops, startLocation);
    
    const optimizedRoute: OptimizedRoute = {
      driverId,
      stops: optimizedStops,
      totalDistance: metrics.totalDistance,
      totalTime: metrics.totalTime,
      efficiency: Math.round((deliveries.length / metrics.totalTime) * 100)
    };
    
    res.status(200).json(optimizedRoute);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to optimize route' });
    return;
  }
};

/**
 * Get optimal routes for multiple drivers
 */
export const optimizeMultipleRoutes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { drivers, zone } = req.body;
    
    // Get all pending deliveries in the zone
    const query: any = { status: 'pending' };
    if (zone) {
      query['deliveryAddress.city'] = zone;
    }
    
    const pendingDeliveries = await Delivery.find(query);
    
    if (pendingDeliveries.length === 0) {
      res.status(200).json({ message: 'No pending deliveries', routes: [] });
      return;
    }
    
    // Simple load balancing: distribute deliveries among available drivers
    const routes = drivers.map((driver: any, index: number) => {
      const driverDeliveries = pendingDeliveries.filter((_, i) => i % drivers.length === index);
      
      const stops: RouteStop[] = driverDeliveries.map(delivery => ({
        deliveryId: delivery._id.toString(),
        location: delivery.deliveryAddress.coordinates || { lat: 0, lng: 0 },
        address: `${delivery.deliveryAddress.street}, ${delivery.deliveryAddress.city}`,
        priority: delivery.deliveryMethod === 'same_day' ? 3 : delivery.deliveryMethod === 'express' ? 2 : 1,
        estimatedTime: 5
      }));
      
      const optimizedStops = optimizeRouteNearestNeighbor(stops, driver.currentLocation);
      const metrics = calculateRouteMetrics(optimizedStops, driver.currentLocation);
      
      return {
        driverId: driver.id,
        driverName: driver.name,
        stops: optimizedStops,
        totalDistance: metrics.totalDistance,
        totalTime: metrics.totalTime,
        efficiency: Math.round((stops.length / metrics.totalTime) * 100)
      };
    });
    
    res.status(200).json({ routes });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to optimize multiple routes' });
    return;
  }
};

/**
 * Get estimated time for delivery
 */
export const getEstimatedDeliveryTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pickupLocation, deliveryLocation, deliveryMethod } = req.body;
    
    if (!pickupLocation || !deliveryLocation) {
      res.status(400).json({ error: 'pickupLocation and deliveryLocation are required' });
      return;
    }
    
    const distance = calculateDistance(pickupLocation, deliveryLocation);
    
    // Base time calculation (in minutes)
    let baseTime = (distance / 30) * 60; // 30 km/h average speed
    
    // Adjust based on delivery method
    const methodMultiplier = {
      same_day: 1.2,  // Priority handling
      express: 1.5,
      standard: 2.0,
      pickup: 0 // No delivery time
    };
    
    const estimatedTime = Math.round(baseTime * (methodMultiplier[deliveryMethod as keyof typeof methodMultiplier] || 1.5));
    
    res.status(200).json({
      distance: Math.round(distance * 100) / 100,
      estimatedTime,
      deliveryMethod,
      unit: 'minutes'
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate estimated delivery time' });
    return;
  }
};

/**
 * Predict delivery incidents based on AI analysis
 */
export const predictIncidents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deliveryId } = req.params;
    
    const delivery = await Delivery.findById(deliveryId);
    
    if (!delivery) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }
    
    // AI prediction factors
    const predictions = [];
    
    // Check delivery attempts
    if (delivery.deliveryAttempts > 2) {
      predictions.push({
        type: 'multiple_attempts',
        severity: 'high',
        message: 'Multiple delivery attempts detected',
        confidence: 0.85
      });
    }
    
    // Check if delivery is overdue
    if (delivery.estimatedDeliveryDate && new Date() > delivery.estimatedDeliveryDate) {
      const hoursOverdue = (new Date().getTime() - delivery.estimatedDeliveryDate.getTime()) / (1000 * 60 * 60);
      predictions.push({
        type: 'overdue',
        severity: hoursOverdue > 24 ? 'critical' : 'medium',
        message: `Delivery is ${Math.round(hoursOverdue)} hours overdue`,
        confidence: 0.9
      });
    }
    
    // Check address completeness
    if (!delivery.deliveryAddress.coordinates) {
      predictions.push({
        type: 'incomplete_address',
        severity: 'medium',
        message: 'Delivery address missing coordinates',
        confidence: 0.75
      });
    }
    
    // Weather/traffic simulation (placeholder for real API integration)
    const hour = new Date().getHours();
    if (hour >= 17 && hour <= 19) {
      predictions.push({
        type: 'traffic',
        severity: 'medium',
        message: 'High traffic expected during rush hour',
        confidence: 0.7
      });
    }
    
    res.status(200).json({
      deliveryId,
      predictions,
      overallRisk: predictions.length > 2 ? 'high' : predictions.length > 0 ? 'medium' : 'low'
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to predict incidents' });
    return;
  }
};
