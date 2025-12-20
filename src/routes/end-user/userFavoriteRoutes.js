import express from 'express';
import UserFavoriteController from '#controllers/end-user/userFavoriteController.js';
import { authenticate } from '#middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user's favorites with pagination and filters
router.get('/get/favorites', UserFavoriteController.getUserFavorites);

// Add listing to favorites
router.post('/create/favorites', UserFavoriteController.addFavorite);

// Remove listing from favorites
router.delete('/delete/favorites/:listingId', UserFavoriteController.removeFavorite);

// Check if listing is favorited
router.get('/check/:listingId', UserFavoriteController.checkFavoriteStatus);

// Get user's favorite statistics
router.get('/stats', UserFavoriteController.getFavoriteStats);

export default router;