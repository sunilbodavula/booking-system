import {Router} from 'express';
import * as controller from '../controller/resource.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { validate, validateQuery } from '../middleware/validate';
import { resourceListQuerySchema, resourceSchema } from '../validation/schema';

const router = Router();

router.get("/", validateQuery(resourceListQuerySchema), asyncHandler(controller.getAllResources));
router.get('/:id', asyncHandler(controller.getResourceById));
router.post('/', validate(resourceSchema), asyncHandler(controller.createResource));
router.put('/:id', validate(resourceSchema), asyncHandler(controller.updateResource));
router.delete('/:id', asyncHandler(controller.deleteResource));

export default router;