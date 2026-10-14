import {Router} from 'express';
import * as controller from '../controller/resource.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { validate, validateQuery } from '../middleware/validate';
import { resourceListQuerySchema, resourceSchema } from '../validation/schema';
import { requireRole } from '../middleware/requireRole';

const router = Router();
const adminOnly = requireRole('ADMIN');

router.get("/", validateQuery(resourceListQuerySchema), asyncHandler(controller.getAllResources));
router.get('/:id', asyncHandler(controller.getResourceById));
router.post('/', adminOnly, validate(resourceSchema), asyncHandler(controller.createResource));
router.put('/:id', adminOnly, validate(resourceSchema), asyncHandler(controller.updateResource));
router.delete('/:id', adminOnly, asyncHandler(controller.deleteResource));

export default router;