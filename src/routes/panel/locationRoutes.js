import express from 'express';
import LocationManagementController from '#controllers/panel/locationManagementController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { allowRoles } from '#middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(allowRoles(['super_admin']));

/**
 * State Management Routes
 */

/**
 * @route GET /api/panel/locations/states/view
 * @desc Get all states (including inactive)
 * @access Super Admin only
 */
router.get('/states/view', LocationManagementController.getAllStates);

/**
 * @route POST /api/panel/locations/states/create
 * @desc Create new state
 * @access Super Admin only
 */
router.post('/states/create', LocationManagementController.createState);

/**
 * @route PUT /api/panel/locations/states/edit/:stateId
 * @desc Update state
 * @access Super Admin only
 */
router.put('/states/edit/:stateId', LocationManagementController.updateState);

/**
 * @route DELETE /api/panel/locations/states/delete/:stateId
 * @desc Delete state (soft delete)
 * @access Super Admin only
 */
router.delete('/states/delete/:stateId', LocationManagementController.deleteState);

/**
 * City Management Routes
 */

/**
 * @route GET /api/panel/locations/cities/view
 * @desc Get all cities (including inactive)
 * @access Super Admin only
 */
router.get('/cities/view', LocationManagementController.getAllCities);

/**
 * @route GET /api/panel/locations/cities/view-by-state/:stateId
 * @desc Get cities by state ID (including inactive)
 * @access Super Admin only
 */
router.get('/cities/view-by-state/:stateId', LocationManagementController.getCitiesByState);

/**
 * @route POST /api/panel/locations/cities/create
 * @desc Create new city
 * @access Super Admin only
 */
router.post('/cities/create', LocationManagementController.createCity);

/**
 * @route PUT /api/panel/locations/cities/edit/:cityId
 * @desc Update city
 * @access Super Admin only
 */
router.put('/cities/edit/:cityId', LocationManagementController.updateCity);

/**
 * @route DELETE /api/panel/locations/cities/delete/:cityId
 * @desc Delete city (soft delete)
 * @access Super Admin only
 */
router.delete('/cities/delete/:cityId', LocationManagementController.deleteCity);

/**
 * @route PATCH /api/panel/locations/cities/popularity/:cityId
 * @desc Toggle city popularity status
 * @access Super Admin only
 */
router.patch('/cities/popularity/:cityId', LocationManagementController.toggleCityPopularity);

export default router;
