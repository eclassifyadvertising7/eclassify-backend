import express from 'express';
import UserController from '#controllers/public/userController.js';

const router = express.Router();

// Debug middleware to log all requests to this router
router.use((req, res, next) => {
  console.log('Public User Routes - Method:', req.method, 'Path:', req.path, 'Params:', req.params);
  next();
});

// Get user profile with category stats
router.get('/profile/:userId', UserController.getUserProfile);

// Get user's listings for specific category
router.get('/:userId/listings/category/:categoryId', UserController.getUserCategoryListings);

export default router;