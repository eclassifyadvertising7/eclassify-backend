import express from 'express';
import PublicUserFavoriteController from '#controllers/public/userFavoriteController.js';

const router = express.Router();

// Get single listing favorite count
router.get('/listings/:listingId/favorite-count', PublicUserFavoriteController.getListingFavoriteCount);



export default router;