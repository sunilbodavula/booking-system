import {Router} from 'express';
import * as controller from '../controller/resource.controller';

const router = Router();

router.get("/", controller.getAllResources);
router.get('/:id', controller.getResourceById);
router.post('/', controller.createResource);
router.put('/:id', controller.updateResource);
router.delete('/:id', controller.deleteResource);

export default router;