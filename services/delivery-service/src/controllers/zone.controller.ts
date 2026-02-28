import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Delivery Zone Management Controller
 * Manages delivery zones, coverage areas, and zone-based operations
 */

// Zone model will be created separately
const Zone = mongoose.model('Zone', new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // GeoJSON polygon
      required: true
    }
  },
  coverage: {
    radius: Number, // in km
    center: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'congested'],
    default: 'active'
  },
  capacity: {
    maxDeliveries: Number,
    currentDeliveries: { type: Number, default: 0 },
    maxDrivers: Number,
    currentDrivers: { type: Number, default: 0 }
  },
  pricing: {
    baseFee: Number,
    perKmRate: Number,
    surchargePercentage: { type: Number, default: 0 }
  },
  assignedDrivers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  }],
  operatingHours: {
    start: String, // e.g., "08:00"
    end: String    // e.g., "22:00"
  },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

/**
 * Get all delivery zones
 */
export const getZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, city, country, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (city) query.city = city;
    if (country) query.country = country;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const zones = await Zone.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('assignedDrivers', 'firstName lastName phone availability');
    
    const total = await Zone.countDocuments(query);
    
    res.status(200).json({
      zones,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch zones' });
    return;
  }
};

/**
 * Get zone by ID
 */
export const getZoneById = async (req: Request, res: Response): Promise<void> => {
  try {
    const zone = await Zone.findById(req.params.id)
      .populate('assignedDrivers', 'firstName lastName phone availability currentLocation');
    
    if (!zone) {
      res.status(404).json({ error: 'Zone not found' });
      return;
    }
    
    res.status(200).json(zone);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch zone' });
    return;
  }
};

/**
 * Create new delivery zone
 */
export const createZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const zone = new Zone(req.body);
    await zone.save();
    
    res.status(201).json(zone);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create zone' });
    return;
  }
};

/**
 * Update delivery zone
 */
export const updateZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const zone = await Zone.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!zone) {
      res.status(404).json({ error: 'Zone not found' });
      return;
    }
    
    res.status(200).json(zone);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update zone' });
    return;
  }
};

/**
 * Delete delivery zone
 */
export const deleteZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    
    if (!zone) {
      res.status(404).json({ error: 'Zone not found' });
      return;
    }
    
    res.status(200).json({ message: 'Zone deleted successfully' });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete zone' });
    return;
  }
};

/**
 * Assign driver to zone
 */
export const assignDriverToZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.body;
    const zoneId = req.params.id;
    
    const zone = await Zone.findById(zoneId);
    
    if (!zone) {
      res.status(404).json({ error: 'Zone not found' });
      return;
    }
    
    // Check if driver already assigned
    if (zone.assignedDrivers.includes(driverId)) {
      res.status(400).json({ error: 'Driver already assigned to this zone' });
      return;
    }
    
    // Check zone capacity
    if (zone.capacity.maxDrivers && zone.capacity.currentDrivers >= zone.capacity.maxDrivers) {
      res.status(400).json({ error: 'Zone has reached maximum driver capacity' });
      return;
    }
    
    zone.assignedDrivers.push(driverId);
    zone.capacity.currentDrivers += 1;
    await zone.save();
    
    res.status(200).json(zone);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign driver to zone' });
    return;
  }
};

/**
 * Remove driver from zone
 */
export const removeDriverFromZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.body;
    const zoneId = req.params.id;
    
    const zone = await Zone.findById(zoneId);
    
    if (!zone) {
      res.status(404).json({ error: 'Zone not found' });
      return;
    }
    
    const driverIndex = zone.assignedDrivers.indexOf(driverId);
    if (driverIndex === -1) {
      res.status(404).json({ error: 'Driver not found in this zone' });
      return;
    }
    
    zone.assignedDrivers.splice(driverIndex, 1);
    zone.capacity.currentDrivers = Math.max(0, zone.capacity.currentDrivers - 1);
    await zone.save();
    
    res.status(200).json(zone);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove driver from zone' });
    return;
  }
};

/**
 * Find zone for a given location
 */
export const findZoneByLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      res.status(400).json({ error: 'Latitude and longitude are required' });
      return;
    }
    
    // Find zones that contain this point
    const zones = await Zone.find({
      'boundaries': {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          }
        }
      }
    });
    
    // If no polygon match, find nearest zone by radius
    if (zones.length === 0) {
      const nearbyZones = await Zone.find({
        'coverage.center': { $exists: true }
      });
      
      // Calculate distances and find nearest
      const zonesWithDistance = nearbyZones.map(zone => {
        const distance = calculateDistance(
          { lat: Number(lat), lng: Number(lng) },
          { lat: zone.coverage.center.lat, lng: zone.coverage.center.lng }
        );
        return { zone, distance };
      }).filter(z => z.distance <= (z.zone.coverage.radius || 0));
      
      if (zonesWithDistance.length > 0) {
        zonesWithDistance.sort((a, b) => a.distance - b.distance);
        res.status(200).json({
          zone: zonesWithDistance[0].zone,
          distance: zonesWithDistance[0].distance
        });
        return;
      }
    }
    
    if (zones.length === 0) {
      res.status(404).json({ error: 'No zones found for this location' });
      return;
    }
    
    res.status(200).json({ zones: zones.filter(z => z.status === 'active') });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to find zone' });
    return;
  }
};

/**
 * Get zone statistics
 */
export const getZoneStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const zoneId = req.params.id;
    
    const zone = await Zone.findById(zoneId);
    
    if (!zone) {
      res.status(404).json({ error: 'Zone not found' });
      return;
    }
    
    // Calculate statistics (would typically query delivery and driver collections)
    const stats = {
      zoneId: zone._id,
      zoneName: zone.name,
      capacity: {
        utilization: zone.capacity.maxDeliveries 
          ? ((zone.capacity.currentDeliveries / zone.capacity.maxDeliveries) * 100).toFixed(2)
          : 0,
        availableSlots: zone.capacity.maxDeliveries - zone.capacity.currentDeliveries,
        driverUtilization: zone.capacity.maxDrivers 
          ? ((zone.capacity.currentDrivers / zone.capacity.maxDrivers) * 100).toFixed(2)
          : 0
      },
      status: zone.status,
      pricing: zone.pricing,
      operatingHours: zone.operatingHours
    };
    
    res.status(200).json(stats);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch zone statistics' });
    return;
  }
};

/**
 * Update zone status
 */
export const updateZoneStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const zoneId = req.params.id;
    
    if (!['active', 'inactive', 'congested'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    
    const zone = await Zone.findByIdAndUpdate(
      zoneId,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!zone) {
      res.status(404).json({ error: 'Zone not found' });
      return;
    }
    
    res.status(200).json(zone);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update zone status' });
    return;
  }
};

// Helper function for distance calculation
const calculateDistance = (loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }): number => {
  const R = 6371;
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
