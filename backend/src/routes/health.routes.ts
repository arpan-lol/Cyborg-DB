import { Router } from 'express';
import { HealthController } from '../controllers/health.controllers.js'
import { asyncHandler } from '../utils/asyncHandler.util.js';

const router = Router();

router.get('/', asyncHandler(HealthController.getHealth));

export default router;