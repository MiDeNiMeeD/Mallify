import { Request, Response, NextFunction } from 'express';
import { Boutique } from '../models/Boutique';
import { BoutiqueSubscription } from '../models/BoutiqueSubscription';
import { createLogger } from '@mallify/shared';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const logger = createLogger('boutique-controller');

const MANAGEMENT_ROLES = new Set(['admin', 'boutiques_manager', 'boutique_owner']);

const canViewHiddenBoutiques = (req: Request) => {
  const role = (req.header('x-user-role') || '').toLowerCase();
  return MANAGEMENT_ROLES.has(role);
};

const getSubscribedBoutiqueIds = async () => {
  const now = new Date();
  const activeSubscriptions = await BoutiqueSubscription.find(
    {
      status: 'active',
      currentPeriodEnd: { $gt: now },
    },
    { boutiqueId: 1 }
  ).lean();

  return activeSubscriptions.map((entry) => entry.boutiqueId);
};

const BOUTIQUE_UPLOAD_DIR = path.join(__dirname, '../../uploads/boutiques');

const imageStorage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(BOUTIQUE_UPLOAD_DIR, { recursive: true });
      cb(null, BOUTIQUE_UPLOAD_DIR);
    } catch (error: any) {
      cb(error, BOUTIQUE_UPLOAD_DIR);
    }
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }
  cb(new Error('Only image files are allowed.'));
};

export const uploadBoutiqueImagesMiddleware = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
}).array('images', 5);

const buildPublicImageUrl = (req: Request, filename: string) => {
  const forwardedProto = (req.header('x-forwarded-proto') || req.protocol).split(',')[0].trim();
  const host = req.header('x-forwarded-host') || req.get('host') || 'localhost';
  return `${forwardedProto}://${host}/api/boutiques/uploads/${filename}`;
};

export const uploadBoutiqueImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];

    if (!files.length) {
      res.status(400).json({
        success: false,
        message: 'No images uploaded',
      });
      return;
    }

    const uploadedImages = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: buildPublicImageUrl(req, file.filename),
    }));

    res.status(201).json({
      success: true,
      message: 'Boutique images uploaded successfully',
      data: {
        images: uploadedImages,
      },
    });
  } catch (error: any) {
    logger.error('Error uploading boutique images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload boutique images',
      error: error.message,
    });
  }
};

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
    const isManagementView = canViewHiddenBoutiques(req);

    if (status) query.status = status;
    if (verified !== undefined) query.verified = verified === 'true';
    if (featured !== undefined) query.featured = featured === 'true';
    if (city) query['address.city'] = city;
    if (country) query['address.country'] = country;
    
    if (search) {
      query.$text = { $search: search as string };
    }

    if (!isManagementView) {
      query.status = 'active';
      query.verified = true;

      const subscribedBoutiqueIds = await getSubscribedBoutiqueIds();
      query._id = { $in: subscribedBoutiqueIds };
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
    const isManagementView = canViewHiddenBoutiques(req);

    const boutique = await Boutique.findById(id);

    if (!boutique) {
      res.status(404).json({
        success: false,
        message: 'Boutique not found',
      });
      return;
    }

    if (!isManagementView) {
      if (boutique.status !== 'active' || !boutique.verified) {
        res.status(404).json({
          success: false,
          message: 'Boutique not found',
        });
        return;
      }

      const subscription = await BoutiqueSubscription.findOne({
        boutiqueId: boutique._id,
        status: 'active',
        currentPeriodEnd: { $gt: new Date() },
      }).lean();

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'Boutique not found',
        });
        return;
      }
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
    const isManagementView = canViewHiddenBoutiques(req);

    const boutique = await Boutique.findOne({ slug });

    if (!boutique) {
      res.status(404).json({
        success: false,
        message: 'Boutique not found',
      });
      return;
    }

    if (!isManagementView) {
      if (boutique.status !== 'active' || !boutique.verified) {
        res.status(404).json({
          success: false,
          message: 'Boutique not found',
        });
        return;
      }

      const subscription = await BoutiqueSubscription.findOne({
        boutiqueId: boutique._id,
        status: 'active',
        currentPeriodEnd: { $gt: new Date() },
      }).lean();

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'Boutique not found',
        });
        return;
      }
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
    const subscribedBoutiqueIds = await getSubscribedBoutiqueIds();

    const boutiques = await Boutique.find({
      featured: true,
      status: 'active',
      verified: true,
      _id: { $in: subscribedBoutiqueIds },
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
