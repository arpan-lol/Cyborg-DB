import { Router } from 'express';
import { HealthController } from '../controllers/health.controllers.js'
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { GOOGLE_CLIENT_ID } from '../utils/googleClient';

const router = Router();

router.get('/', asyncHandler(HealthController.getHealth));

router.get('/config', asyncHandler(async (req: any, res: any) => {
  res.json({
    googleOAuthEnabled: !!GOOGLE_CLIENT_ID
  });
}));

export default router;