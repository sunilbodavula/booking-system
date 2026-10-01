import { Router } from 'express';
import { getHealth } from '../controller/health.controller';

const router: Router = Router();

router.get('/health', getHealth);

export default router;