import { Response } from 'express';
import prisma from '../prisma/client';
import { eventsController } from '../controllers/chat/events.controllers';

interface ProgressClient {
  res: Response;
  attachmentId: string;
}
class SSEService {
  private progressClients: Map<string, ProgressClient[]> = new Map();

  private setupSSEHeaders(res: Response) {
    const origin = process.env.FRONTEND_ORIGIN || 'https://cyborg.arpantaneja.dev';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
  }

  private sendSSE(res: Response, data: any): boolean {
    try {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      res.write(message);
      return true;
    } catch (error) {
      console.error(`[SSE] Error sending to client:`, error);
      return false;
    }
  }

  addProgressClient(attachmentId: string, res: Response) {
    this.setupSSEHeaders(res);

    const clients = this.progressClients.get(attachmentId) || [];
    clients.push({ res, attachmentId });
    this.progressClients.set(attachmentId, clients);

    console.log(`[SSE] Client connected for attachment: ${attachmentId} (total: ${clients.length})`);

    this.sendProgress(attachmentId, {
      status: 'connected',
      message: 'indexing...',
    });

    res.on('close', () => {
      this.removeProgressClient(attachmentId, res);
    });
  }

  private removeProgressClient(attachmentId: string, res: Response) {
    const clients = this.progressClients.get(attachmentId);
    if (!clients) return;

    const filtered = clients.filter(client => client.res !== res);
    
    if (filtered.length === 0) {
      this.progressClients.delete(attachmentId);
      console.log(`[SSE] No more clients for attachment: ${attachmentId}`);
    } else {
      this.progressClients.set(attachmentId, filtered);
      console.log(`[SSE] Client disconnected for ${attachmentId} (remaining: ${filtered.length})`);
    }
  }

  sendProgress(attachmentId: string, data: any) {
    const clients = this.progressClients.get(attachmentId);
    if (!clients || clients.length === 0) return;

    clients.forEach(client => {
      const success = this.sendSSE(client.res, data);
      if (!success) {
        this.removeProgressClient(attachmentId, client.res);
      }
    });

    console.log(`[SSE] Sent to ${clients.length} client(s) for ${attachmentId}:`, data.status);
  }

  closeProgress(attachmentId: string) {
    const clients = this.progressClients.get(attachmentId);
    if (!clients) return;

    clients.forEach(client => {
      client.res.end();
    });

    this.progressClients.delete(attachmentId);
    console.log(`[SSE] Closed all connections for ${attachmentId}`);
  }

  sendEngineEvent(sessionId: string, userId: number, event: any) {
    eventsController.sendEvent(sessionId, {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    });
  }
}

export const sseService = new SSEService();
