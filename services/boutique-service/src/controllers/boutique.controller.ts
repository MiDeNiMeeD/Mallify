import { Request, Response, NextFunction } from 'express';
import { Boutique } from '../models/Boutique';
import { createLogger } from '@mallify/shared';

const logger = createLogger('boutique-controller');

export const getBoutiques = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      verified,
      featured,
      city,
      country,
      search,
      sort = '-createdAt',
    } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (verified !== undefined) query.verified = verified === 'true';
    if (featured !== undefined) query.featured = featured === 'true';
    if (city) query['address.city'] = city;
    if (country) query['address.country'] = country;
    
    if (search) {
      query.$text = { $search: search as string };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [boutiques, total] = await Promise.all([
      Boutique.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Boutique.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: 'Boutiques retrieved successfully',
      data: {
        boutiques,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      },
    });
  } catch (error) {
    logger.error('Error retrieving boutiques:', error);
    next(error);
  }
};

export const getBoutiqueById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const boutique = await Boutique.findById(id);

    if (!boutique) {
      res.status(404).json({
        success: false,
        message: 'Boutique not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Boutique retrieved successfully',
      data: { boutique },
    });
  } catch (error) {
    logger.error('Error retrieving boutique:', error);
    next(error);
  }
};

export const getBoutiqueBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;

    const boutique = await Boutique.findOne({ slug });

    if (!boutique) {
      res.status(404).json({
        success: false,
        message: 'Boutique not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Boutique retrieved successfully',
      data: { boutique },
    });
  } catch (error) {
    logger.error('Error retrieving boutique:', error);
    next(error);
  }
};

export const createBoutique = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const boutiqueData = req.body;

    if (!boutiqueData.slug) {
      boutiqueData.slug = boutiqueData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const boutique = new Boutique(boutiqueData);
    await boutique.save();

    logger.info('Boutique created:', { boutiqueId: boutique._id });

    res.status(201).json({
      success: true,
      message: 'Boutique created successfully',
      data: { boutique },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Boutique with this slug already exists',
      });
      return;
    }
    logger.error('Error creating boutique:', error);
    next(error);
  }
};

export const updateBoutique = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates._id;
    delete updates.createdAt;
    delete updates.ownerId;

    const boutique = await Boutique.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!boutique) {
      res.status(404).json({
        success: false,
        message: 'Boutique not found',
      });
      return;
    }

    logger.info('Boutique updated:', { boutiqueId: boutique._id });

    res.json({
      success: true,
      message: 'Boutique updated successfully',
      data: { boutique },
    });
  } catch (error) {
    logger.error('Error updating boutique:', error);
    next(error);
  }
};

export const deleteBoutique = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const boutique = await Boutique.findByIdAndUpdate(
      id,
      { $set: { status: 'closed' } },
      { new: true }
    );

    if (!boutique) {
      res.status(404).json({
        success: false,
        message: 'Boutique not found',
      });
      return;
    }

    logger.info('Boutique closed:', { boutiqueId: boutique._id });

    res.json({
      success: true,
      message: 'Boutique closed successfully',
      data: { boutique },
    });
  } catch (error) {
    logger.error('Error deleting boutique:', error);
    next(error);
  }
};

export const getFeaturedBoutiques = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const boutiques = await Boutique.find({
      featured: true,
      status: 'active',
      verified: true,
    })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      message: 'Featured boutiques retrieved successfully',
      data: { boutiques },
    });
  } catch (error) {
    logger.error('Error retrieving featured boutiques:', error);
    next(error);
  }
};
