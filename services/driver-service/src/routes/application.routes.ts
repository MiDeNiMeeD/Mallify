import express from 'express';
import { submitApplication, getAllApplications, getApplicationById, updateApplicationStatus, upload } from '../controllers/application.controller';

const router = express.Router();

// Public route - submit application
router.post(
  '/applications',
  upload.fields([
    { name: 'cinDocument', maxCount: 1 },
    { name: 'licenseDocument', maxCount: 1 }
  ]),
  submitApplication
);

// Admin routes - manage applications
router.get('/applications', getAllApplications);
router.get('/applications/:id', getApplicationById);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;
