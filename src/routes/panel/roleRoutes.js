import express from 'express';
import RoleController from '#controllers/panel/roleController.js';
import { authenticate } from '#middleware/authMiddleware.js';
import { allowRoles } from '#middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(allowRoles(['super_admin']));

router.get('/', RoleController.getAllRoles);
router.post('/', RoleController.createRole);
router.patch('/status/:roleId', RoleController.toggleRoleStatus);
router.get('/users/:roleId', RoleController.getUsersByRole);
router.get('/:roleId', RoleController.getRoleById);
router.put('/:roleId', RoleController.updateRole);

export default router;
