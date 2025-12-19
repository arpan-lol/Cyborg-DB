import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { ChatController } from '../controllers/chat';
import { upload } from '../config/upload';
import { asyncHandler } from '../utils/asyncHandler.util';

const router = Router();

router.use(authenticateJWT);

// Session management
router.post('/sessions', asyncHandler(ChatController.createSession));
router.get('/sessions', asyncHandler(ChatController.getSessions));
router.get('/sessions/:id', asyncHandler(ChatController.getSessionById));
router.delete('/sessions/:id', asyncHandler(ChatController.deleteSession));

// Messaging
router.post('/sessions/:id/messages', asyncHandler(ChatController.message));

// File uploads and processing
router.post('/upload', upload.single('file'), asyncHandler(ChatController.uploadFile));
router.get('/attachments/:attachmentId/status', asyncHandler(ChatController.getAttachmentStatus));
router.get('/attachments/:attachmentId/stream', asyncHandler(ChatController.streamAttachmentStatus));

// Semantic search
router.post('/sessions/:id/search', asyncHandler(ChatController.searchSession));

export default router;