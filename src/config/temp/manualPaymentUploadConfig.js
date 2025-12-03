import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { generateFileName } from '#utils/customSlugify.js';

/**
 * TEMPORARY: Manual payment proof upload configuration
 * TODO: Delete this file when payment gateway is implemented
 * 
 * Follows the same pattern as uploadMiddleware.js
 */

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

/**
 * Ensure directory exists, create if not
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Create storage configuration
 */
const createStorage = () => {
  // Use memory storage for Cloudinary (files will be uploaded from buffer)
  if (STORAGE_TYPE === 'cloudinary') {
    return multer.memoryStorage();
  }

  // Use disk storage for local uploads
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        const uploadPath = path.join(process.cwd(), 'uploads', 'manual_payments');
        await ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
      } catch (error) {
        cb(error, null);
      }
    },
    filename: (req, file, cb) => {
      try {
        const uniqueName = generateFileName(file.originalname);
        cb(null, uniqueName);
      } catch (error) {
        cb(error, null);
      }
    }
  });
};

/**
 * File filter for validation
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
  }
};

/**
 * Middleware to upload single payment proof
 */
export const uploadPaymentProof = multer({
  storage: createStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
}).single('paymentProof');

/**
 * File filter for QR code (images only)
 */
const qrFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG and PNG are allowed for QR codes.'), false);
  }
};

/**
 * Middleware to upload single QR code
 */
export const uploadQRCode = multer({
  storage: createStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: qrFileFilter
}).single('qrCode');
