import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { ChatController } from '../controllers/chat';
import { upload } from '../config/upload';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { verifyJwt } from '../utils/jwt';

const router = Router();

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.query.token as string;
  
  if (!token) {
    return authenticateJWT(req, res, next);
  }
  
  try {
    const decoded = verifyJwt(token) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Session management
router.post('/sessions', authenticateJWT, asyncHandler(ChatController.createSession));
router.get('/sessions', authenticateJWT, asyncHandler(ChatController.getSessions));
router.get('/sessions/:id', authenticateJWT, asyncHandler(ChatController.getSessionById));
router.get('/sessions/:id/attachments', authenticateJWT, asyncHandler(ChatController.getSessionAttachments));
router.get('/sessions/:id/events', authenticateToken, asyncHandler(ChatController.connectToSessionEvents));
router.delete('/sessions/:id', authenticateJWT, asyncHandler(ChatController.deleteSession));

// Messaging
router.post('/sessions/:id/messages', authenticateJWT, asyncHandler(ChatController.message));

// File uploads and processing
router.post('/upload', authenticateJWT, upload.single('file'), asyncHandler(ChatController.uploadFile));
router.get('/attachments/:attachmentId/status', authenticateJWT, asyncHandler(ChatController.getAttachmentStatus));
router.get('/attachments/:attachmentId/stream', authenticateToken, asyncHandler(ChatController.streamAttachmentStatus));
router.get('/sessions/:sessionId/attachments/:attachmentId/chunks', authenticateJWT, asyncHandler(ChatController.getAttachmentChunks));

// File serving
router.get('/uploads/:filename', authenticateJWT, asyncHandler(ChatController.serveFile));

// Semantic search
router.post('/sessions/:id/search', authenticateJWT, asyncHandler(ChatController.searchSession));

export default router;