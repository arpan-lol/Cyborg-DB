import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/express';
import { UnauthorizedError } from '../../types/error.types';
import prisma from '../../prisma/client';

interface EventClient {
  res: Response;
  sessionId: string;
  userId: number;
  keepAliveTimer?: NodeJS.Timeout;
}

class EventsController {
  private clients: Map<string, EventClient[]> = new Map();
  private readonly KEEP_ALIVE_INTERVAL = 15000;

  private setupSSEHeaders(res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
  }

  private sendSSE(res: Response, data: any): boolean {
    try {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      res.write(message);
      return true;
    } catch (error) {
      console.error(`[EventsController] Error sending to client:`, error);
      return false;
    }
  }

  connectToSessionEvents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError();
    }

    const { id: sessionId } = req.params;

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId, userId },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    this.setupSSEHeaders(res);

    const clients = this.clients.get(sessionId) || [];
    const client: EventClient = { res, sessionId, userId };
    clients.push(client);
    this.clients.set(sessionId, clients);

    console.log(`[EventsController] Client connected to session: ${sessionId} (total: ${clients.length})`);

    this.sendSSE(res, {
      type: 'notification',
      scope: 'session',
      sessionId,
      message: 'Connected to logs',
      timestamp: new Date().toISOString(),
    });

    client.keepAliveTimer = setInterval(() => {
      try {
        res.write(':keep-alive\n\n');
      } catch (error) {
        console.error(`[EventsController] Keep-alive failed for session ${sessionId}`);
        this.removeClient(sessionId, res);
      }
    }, this.KEEP_ALIVE_INTERVAL);

    res.on('close', () => {
      this.removeClient(sessionId, res);
    });

    res.on('error', (error) => {
      console.error(`[EventsController] Connection error for session ${sessionId}:`, error);
      this.removeClient(sessionId, res);
    });
  };

  private removeClient(sessionId: string, res: Response) {
    const clients = this.clients.get(sessionId);
    if (!clients) return;

    const clientToRemove = clients.find(client => client.res === res);
    if (clientToRemove?.keepAliveTimer) {
      clearInterval(clientToRemove.keepAliveTimer);
    }

    const filtered = clients.filter(client => client.res !== res);
    
    if (filtered.length === 0) {
      this.clients.delete(sessionId);
      console.log(`[EventsController] No more clients for session: ${sessionId}`);
    } else {
      this.clients.set(sessionId, filtered);
      console.log(`[EventsController] Client disconnected from ${sessionId} (remaining: ${filtered.length})`);
    }
  }

  sendEvent(sessionId: string, event: any) {
    const clients = this.clients.get(sessionId);
    if (!clients || clients.length === 0) return;

    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    clients.forEach(client => {
      const success = this.sendSSE(client.res, eventWithTimestamp);
      if (!success) {
        this.removeClient(sessionId, client.res);
      }
    });

    console.log(`[EventsController] Sent event to ${clients.length} client(s) for session ${sessionId}:`, event.type);
  }

  broadcastToUser(userId: number, event: any) {
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    let sentCount = 0;
    this.clients.forEach((clients, sessionId) => {
      clients.forEach(client => {
        if (client.userId === userId) {
          const success = this.sendSSE(client.res, eventWithTimestamp);
          if (success) {
            sentCount++;
          } else {
            this.removeClient(sessionId, client.res);
          }
        }
      });
    });

    console.log(`[EventsController] Broadcast event to ${sentCount} client(s) for user ${userId}:`, event.type);
  }
}

export const eventsController = new EventsController();
