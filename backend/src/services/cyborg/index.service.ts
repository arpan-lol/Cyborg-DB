import { getClient } from './client';
import { sseService } from '../sse.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EMBEDDING_DIMENSION = 768;

const rawKey = process.env.ENCRYPTION_KEY
if(!rawKey) throw new Error("Cyborg encryption key not set!")
const indexKey = Uint8Array.from(Buffer.from(rawKey, 'base64'));

export class IndexService {
  static generateIndexName(sessionId: string): string {
    return `session_${sessionId.replace(/-/g, '_')}`;
  }

  static async initializeIndex(sessionId: string): Promise<void> {
    const client = getClient();
    const indexName = this.generateIndexName(sessionId);

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { userId: true }
    });

    const indexes = await client.listIndexes();
    
    if (indexes.includes(indexName)) {
      console.log(`[CyborgDB] Index ${indexName} already exists`);
      if (session) {
        sseService.sendEngineEvent(sessionId, session.userId, {
          type: 'notification',
          scope: 'session',
          sessionId,
          message: `Index "${indexName}" already exists`,
        });
      }
      return;
    }

    if (session) {
      sseService.sendEngineEvent(sessionId, session.userId, {
        type: 'notification',
        scope: 'session',
        sessionId,
        message: `Creating encrypted index "${indexName}"...`,
      });
    }

    await client.createIndex({
      indexName,
      indexKey,
      indexConfig: {
        type: "ivfflat",
        dimension: 768
      }
    });

    console.log(`[CyborgDB] Index ${indexName} created successfully`);

    if (session) {
      sseService.sendEngineEvent(sessionId, session.userId, {
        type: 'success',
        scope: 'session',
        sessionId,
        message: `Encrypted index "${indexName}" created successfully`,
      });
    }
  }

  static async deleteIndex(sessionId: string): Promise<void> {
    const client = getClient();
    const indexName = this.generateIndexName(sessionId);

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { userId: true }
    });

    if (session) {
      sseService.sendEngineEvent(sessionId, session.userId, {
        type: 'notification',
        scope: 'session',
        sessionId,
        message: `Deleting index "${indexName}"...`,
      });
    }
    
    const index = await client.loadIndex({
        indexName,
        indexKey
    })

    await index.deleteIndex()
    console.log(`[CyborgDB] Index ${indexName} deleted`);

    if (session) {
      sseService.sendEngineEvent(sessionId, session.userId, {
        type: 'success',
        scope: 'session',
        sessionId,
        message: `Index "${indexName}" deleted successfully`,
      });
    }
  }

  static async hasIndex(sessionId: string): Promise<boolean> {
    const client = getClient();
    const indexName = this.generateIndexName(sessionId);
    
    try {
      const indexes = await client.listIndexes();
      return indexes.includes(indexName);
    } catch (error) {
      console.error(`[CyborgDB] Error checking index existence:`, error);
      return false;
    }
  }

  static async buildIndexAndLoad(sessionId: string): Promise<void> {
    console.log(`[CyborgDB] Index ${this.generateIndexName(sessionId)} is automatically indexed`);
  }
}