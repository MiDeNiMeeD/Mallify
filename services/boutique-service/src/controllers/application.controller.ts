import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import BoutiqueApplication from '../models/BoutiqueApplication';
import { Boutique } from '../models/Boutique';

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
    const { boutiqueName, ownerName, email, phone, password, address, city, description, category } = req.body;

    // Validate required fields
    if (!boutiqueName || !ownerName || !email || !phone || !password || !address || !city || !description || !category) {
      res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
      return;
    }

    // Validate files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files || !files.cinDocument) {
      res.status(400).json({
        success: false,
        message: 'CIN document is required',
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create application
    const application = new BoutiqueApplication({
      boutiqueName,
      ownerName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      address,
      city,
      description,
      category,
      cinDocument: files.cinDocument[0].filename,
      emailVerified: true, // Email was verified during form submission
      status: 'pending',
      submittedAt: new Date(),
    });

    await application.save();

    // Create user account in user-service
    try {
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
      await axios.post(`${userServiceUrl}/api/auth/register`, {
        name: ownerName,
        email: email.toLowerCase(),
        password: password, // Send unhashed password to user-service (it will hash it)
        phone,
        role: 'boutique_owner',
        skipEmailVerification: true // Skip email since they already verified during application
      });
      console.log('✅ Boutique owner user account created successfully');
    } catch (userError: any) {
      console.error('⚠️  Warning: Failed to create user account:', userError.response?.data || userError.message);
      // Don't fail the application if user creation fails - admin can handle it manually
    }

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
    const { status, email, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (email) {
      query.email = email.toString().toLowerCase();
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

    // If approved, create the boutique in the boutiques collection
    if (status === 'approved') {
      try {
        // Get user ID from user-service
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
        const userResponse = await axios.get(`${userServiceUrl}/api/users/by-email/${application.email}`);
        
        if (userResponse.data.success) {
          const userId = userResponse.data.data._id;
          
          // Generate slug from boutique name
          const slug = application.boutiqueName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          
          // Check if boutique already exists
          const existingBoutique = await Boutique.findOne({ 
            $or: [
              { ownerId: userId },
              { email: application.email.toLowerCase() }
            ]
          });

          if (!existingBoutique) {
            // Create the boutique
            const newBoutique = new Boutique({
              name: application.boutiqueName,
              description: application.description,
              ownerId: userId,
              email: application.email.toLowerCase(),
              phone: application.phone,
              address: {
                street: application.address,
                city: application.city,
                state: '',
                country: 'Tunisia',
                postalCode: '',
              },
              businessType: 'retail',
              categories: application.category ? [application.category] : [],
              tags: [],
              slug: slug,
              status: 'active',
              verified: true,
              currency: 'TND',
              timezone: 'Africa/Tunis',
              language: 'en',
            });

            await newBoutique.save();
            console.log(`✅ Boutique created for application ${id}: ${newBoutique.name}`);

            // Update user's boutiqueList in user-service
            try {
              await axios.put(`${userServiceUrl}/api/users/${userId}/boutiques`, {
                boutiqueId: newBoutique._id
              });
              console.log(`✅ User's boutiqueList updated`);
            } catch (userError: any) {
              console.error('⚠️  Warning: Failed to update user boutiqueList:', userError.message);
            }
          } else {
            console.log(`⚠️  Boutique already exists for user ${userId}`);
          }
        }
      } catch (boutiqueError: any) {
        console.error('⚠️  Warning: Failed to create boutique:', boutiqueError.message);
        // Don't fail the approval if boutique creation fails
      }
    }

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

// Delete application and related data
export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
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

    // Delete uploaded documents
    if (application.cinDocument) {
      try {
        const filePath = path.join(__dirname, '../../uploads/applications', application.cinDocument);
        await fs.unlink(filePath);
        console.log('✅ Deleted CIN document:', application.cinDocument);
      } catch (fileError) {
        console.error('⚠️  Warning: Failed to delete document file:', fileError);
        // Continue with deletion even if file deletion fails
      }
    }

    // Delete the user account from user-service
    try {
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
      await axios.delete(`${userServiceUrl}/api/users/email/${application.email}`);
      console.log('✅ Deleted user account:', application.email);
    } catch (userError: any) {
      console.error('⚠️  Warning: Failed to delete user account:', userError.response?.data || userError.message);
      // Continue with application deletion even if user deletion fails
    }

    // Delete the application
    await BoutiqueApplication.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Application and related data deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message,
    });
  }
};
