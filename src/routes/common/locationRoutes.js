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
 * @route GET /api/common/all-cities
 * @desc Get all cities irrespective of state
 * @access Public
 */
router.get('/all-cities', LocationController.getAllCities);

/**
 * @route GET /api/common/cities/:stateId
 * @desc Get cities by state ID
 * @access Public
 */
router.get('/cities/:stateId', LocationController.getCitiesByState);

/**
 * @route GET /api/common/popular-cities
 * @desc Get popular cities
 * @access Public
 */
router.get('/popular-cities', LocationController.getPopularCities);

/**
 * @route GET /api/common/search-cities
 * @desc Search cities by name
 * @access Public
 */
router.get('/search-cities', LocationController.searchCities);

export default router;
