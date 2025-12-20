import { dynamicTopK } from '../../config/rag.config';
import { sseService } from '../sse.service';
import { eventsController } from '../../controllers/chat/events.controllers';
import { logger } from '../../utils/logger.util.js';
import { SearchService, SearchResult } from '../cyborg/search.service';
import prisma from '../../prisma/client';

export interface EnhancedContext {
  content: string;
  attachmentId: string;
  filename: string;
  chunkIndex: number;
  pageNumber?: number;
}

export class RetrievalService {
  static async getContext(
    sessionId: string,
    query: string,
    attachmentIds?: string[],
  ): Promise<EnhancedContext[]> {
    try {
      if (!attachmentIds || attachmentIds.length === 0) {
        console.log(`[Retrieval] No attachments specified, returning empty context`);
        return [];
      }

      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { userId: true }
      });

      if (session) {
        eventsController.sendEvent(sessionId, {
          type: 'notification',
          scope: 'session',
          sessionId,
          message: `Starting context retrieval from ${attachmentIds.length} document(s)...`,
        });
      }

      const ctx = await this.vectorSearch(sessionId, query, attachmentIds);

      if (session) {
        eventsController.sendEvent(sessionId, {
          type: 'success',
          scope: 'session',
          sessionId,
          message: `Retrieved ${ctx.length} relevant context chunks`,
        });
      }

      return ctx;
    } catch (error) {
      console.error('[Retrieval]', `Error getting context for session ${sessionId}:`, error);
      logger.error('[Retrieval]',  `Error getting context for session ${sessionId}:`, error ? error as Error : undefined);
      
      throw error;
    }
  }

  private static async vectorSearch(
    sessionId: string,
    query: string,
    attachmentIds: string[]
  ): Promise<EnhancedContext[]> {
    const totalTopK = dynamicTopK(attachmentIds.length);
    const topKPerDoc = Math.ceil(totalTopK / attachmentIds.length);

    console.log(
      `[Retrieval] Vector search on ${attachmentIds.length} attachment(s) with topK=${totalTopK} (${topKPerDoc} per doc)`
    );

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { userId: true }
    });

    if (session) {
      eventsController.sendEvent(sessionId, {
        type: 'notification',
        scope: 'session',
        sessionId,
        message: `Performing ${attachmentIds.length} parallel vector search(es) (${topKPerDoc} chunks each)...`,
      });
    }

    const promises = attachmentIds.map((attachmentId) =>
      SearchService.search(sessionId, query, topKPerDoc, attachmentId) 
    );
    const resultsArray = await Promise.all(promises);
    const allResults: SearchResult[] = resultsArray.flat();

    const topResults = allResults.sort((a, b) => b.score - a.score).slice(0, totalTopK);

    console.log(
      `[Retrieval] Retrieved ${topResults.length} context chunks from ${attachmentIds.length} attachments`
    );

    if (session) {
      const uniqueFiles = [...new Set(topResults.map(r => r.filename))];
      eventsController.sendEvent(sessionId, {
        type: 'success',
        scope: 'session',
        sessionId,
        message: `Ranked and selected top ${topResults.length} chunks for context`,
        data: {
          title: 'Context Sources',
          body: uniqueFiles.map(f => `${f} (${topResults.filter(r => r.filename === f).length} chunks)`)
        }
      });
    }

    return topResults.map((r) => ({
      content: r.content,
      attachmentId: r.attachmentId,
      filename: r.filename,
      chunkIndex: r.chunkIndex,
      pageNumber: r.pageNumber,
    }));
  }
}