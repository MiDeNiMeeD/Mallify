import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import BoutiqueApplication from '../models/BoutiqueApplication';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/applications');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error: any) {
      cb(error, uploadDir);
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Submit boutique application
export const submitApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boutiqueName, ownerName, email, phone, address, city, description, category } = req.body;

    // Validate required fields
    if (!boutiqueName || !ownerName || !email || !phone || !address || !city || !description || !category) {
      res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
      return;
    }

    // Validate files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files || !files.businessLicense || !files.taxCertificate) {
      res.status(400).json({
        success: false,
        message: 'Both business license and tax certificate are required',
      });
      return;
    }

    // Check if application with same email already exists
    const existingApplication = await BoutiqueApplication.findOne({ 
      email: email.toLowerCase(),
      status: { $in: ['pending', 'under_review'] }
    });

    if (existingApplication) {
      res.status(400).json({
        success: false,
        message: 'An application with this email is already under review',
      });
      return;
    }

    // Create application
    const application = new BoutiqueApplication({
      boutiqueName,
      ownerName,
      email: email.toLowerCase(),
      phone,
      address,
      city,
      description,
      category,
      businessLicense: files.businessLicense[0].filename,
      taxCertificate: files.taxCertificate[0].filename,
      status: 'pending',
      submittedAt: new Date(),
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application._id,
        status: application.status,
        submittedAt: application.submittedAt,
      },
    });
  } catch (error: any) {
    console.error('Error submitting boutique application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message,
    });
  }
};

// Get all applications (admin only)
export const getAllApplications = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const applications = await BoutiqueApplication.find(query)
      .sort({ submittedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await BoutiqueApplication.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message,
    });
  }
};

// Get single application
export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await BoutiqueApplication.findById(id);

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error: any) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message,
    });
  }
};

// Update application status (admin only)
export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, notes } = req.body;
    const reviewedBy = (req as any).userId; // From auth middleware

    const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
      return;
    }

    const application = await BoutiqueApplication.findById(id);

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = reviewedBy;
    
    if (rejectionReason) {
      application.rejectionReason = rejectionReason;
    }
    
    if (notes) {
      application.notes = notes;
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
    });
  } catch (error: any) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message,
    });
  }
};
