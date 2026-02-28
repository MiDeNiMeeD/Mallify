import { Request, Response } from 'express';
import Delivery from '../models/Delivery';

export const getDeliveries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, userId, driverId, method, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (driverId) query.driverId = driverId;
    if (method) query.deliveryMethod = method;

    const skip = (Number(page) - 1) * Number(limit);
    
    const deliveries = await Delivery.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email phone')
      .populate('driverId', 'name phone vehicleInfo')
      .populate('orderId', 'orderNumber total');
    
    const total = await Delivery.countDocuments(query);
    
    res.status(200).json({
      deliveries,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deliveries' });
    return;
  }
};

export const getDeliveryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('driverId', 'name phone vehicleInfo')
      .populate('orderId', 'orderNumber total items');
    
    if (!delivery) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }
    
    res.status(200).json(delivery);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch delivery' });
    return;
  }
};

export const getDeliveryByTracking = async (req: Request, res: Response): Promise<void> => {
  try {
    const delivery = await Delivery.findOne({ trackingNumber: req.params.trackingNumber })
      .populate('orderId', 'orderNumber total');
    
    if (!delivery) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }
    
    res.status(200).json(delivery);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch delivery' });
    return;
  }
};

export const createDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const delivery = new Delivery({
      ...req.body,
      trackingNumber,
      trackingHistory: [{
        status: 'pending',
        description: 'Delivery created',
        timestamp: new Date()
      }]
    });
    
    await delivery.save();
    
    res.status(201).json(delivery);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create delivery' });
    return;
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, location, description, driverId } = req.body;
    
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }
    
    delivery.status = status;
    
    if (driverId) {
      delivery.driverId = driverId;
    }
    
    if (status === 'delivered') {
      delivery.actualDeliveryDate = new Date();
    }
    
    delivery.trackingHistory.push({
      status,
      location,
      description: description || `Status updated to ${status}`,
      timestamp: new Date()
    });
    
    await delivery.save();
    
    res.status(200).json(delivery);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update delivery status' });
    return;
  }
};

export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, description } = req.body;
    
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation: {
          coordinates: { lat, lng },
          timestamp: new Date(),
          description
        }
      },
      { new: true }
    );
    
    if (!delivery) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }
    
    res.status(200).json(delivery);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
    return;
  }
};

export const assignDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.body;
    
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }
    
    delivery.driverId = driverId;
    delivery.status = 'assigned';
    delivery.trackingHistory.push({
      status: 'assigned',
      description: 'Driver assigned to delivery',
      timestamp: new Date()
    });
    
    await delivery.save();
    
    res.status(200).json(delivery);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign driver' });
    return;
  }
};
