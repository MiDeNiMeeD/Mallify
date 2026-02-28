import { Request, Response } from 'express';
import Driver from '../models/Driver';

export const getDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, availability, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (availability) query.availability = availability;

    const skip = (Number(page) - 1) * Number(limit);
    
    const drivers = await Driver.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email phone');
    
    const total = await Driver.countDocuments(query);
    
    res.status(200).json({
      drivers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drivers' });
    return;
  }
};

export const getDriverById = async (req: Request, res: Response): Promise<void> => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('userId', 'name email phone');
    
    if (!driver) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }
    
    res.status(200).json(driver);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver' });
    return;
  }
};

export const createDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const driverNumber = `DRV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const driver = new Driver({
      ...req.body,
      driverNumber
    });
    
    await driver.save();
    
    res.status(201).json(driver);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create driver' });
    return;
  }
};

export const updateDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!driver) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }
    
    res.status(200).json(driver);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update driver' });
    return;
  }
};

export const updateAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { availability } = req.body;
    
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    );
    
    if (!driver) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }
    
    res.status(200).json(driver);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability' });
    return;
  }
};

export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng } = req.body;
    
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation: {
          coordinates: { lat, lng },
          timestamp: new Date()
        }
      },
      { new: true }
    );
    
    if (!driver) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }
    
    res.status(200).json(driver);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
    return;
  }
};

export const getAvailableDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const drivers = await Driver.find({
      status: 'active',
      availability: 'available'
    }).sort({ rating: -1 });
    
    res.status(200).json(drivers);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available drivers' });
    return;
  }
};
