import express from 'express';
import LocationController from '#controllers/common/locationController.js';

const router = express.Router();

/**
 * @route GET /api/common/states
 * @desc Get all states
 * @access Public
 */
router.get('/states', LocationController.getStates);

/**
 * @route GET /api/common/cities/:stateId
 * @desc Get cities by state ID
 * @access Public
 */
router.get('/cities/:stateId', LocationController.getCitiesByState);

export default router;
