import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/express';
import prisma from '../../prisma/client';
import { UnauthorizedError, NotFoundError } from '../../types/error.types';
import { logger } from '../../utils/logger.util.js';
import path from 'path';
import fs from 'fs';
import { UPLOAD_DIR } from '../../config/upload';

export class FileController {
  static async serveFile(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError();

    const { filename } = req.params;

    if (!filename) {
      throw new NotFoundError('Filename is required');
    }

    try {
      const attachment = await prisma.attachment.findFirst({
        where: {
          url: path.join('uploads', filename),
        },
        include: {
          message: {
            include: {
              session: true,
            },
          },
        },
      });

      if (!attachment) {
        throw new NotFoundError('File not found');
      }

      const hasAccess = attachment.message?.session.userId === userId;
      
      if (!hasAccess) {
        const sessionId = (attachment.metadata as any)?.sessionId;
        if (sessionId) {
          const session = await prisma.chatSession.findUnique({
            where: { id: sessionId, userId },
          });
          
          if (!session) {
            throw new UnauthorizedError('Access denied to this file');
          }
        } else {
          throw new UnauthorizedError('Access denied to this file');
        }
      }

      const filePath = path.join(UPLOAD_DIR, filename);

      if (!fs.existsSync(filePath)) {
        throw new NotFoundError('File not found on disk');
      }

      res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${attachment.filename}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('error', (err) => {
        logger.error('FileController', 'Error streaming file', err, { filename, userId });
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error reading file' });
        }
      });

    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
        throw error;
      }
      logger.error('FileController', 'Error serving file', error instanceof Error ? error : undefined, { filename, userId });
      throw new NotFoundError('File not found');
    }
  }
}
