import { jobQueue } from '../queue';
import prisma from '../prisma/client';
import { IngestionService } from '../services/ingestion.service';
import { ChunkingService } from '../services/chunking.service';
import { EmbeddingService } from '../services/embedding.service';
import { StorageService } from '../services/cyborg/storage.service';
import { IndexService } from '../services/cyborg/index.service';
import { sseService } from '../services/sse.service';

interface OrchestrationJob {
  attachmentId: string;
  userId: number;
  sessionId: string;
}


async function processFile(attachmentId: string, userId: number, sessionId: string): Promise<void> {
  console.log(`[Orchestrator] Starting pipeline for attachment: ${attachmentId}`);

  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new Error(`Attachment not found: ${attachmentId}`);
    }

    console.log(`[Orchestrator] Processing: ${attachment.filename}`);

    sseService.sendEngineEvent(sessionId, userId, {
      type: 'notification',
      scope: 'session',
      sessionId,
      message: 'Initializing database index...',
    });

    await IndexService.initializeIndex(sessionId);

    sseService.sendEngineEvent(sessionId, userId, {
      type: 'success',
      scope: 'session',
      sessionId,
      message: 'Database index ready',
    });

    sseService.sendProgress(attachmentId, {
      status: 'processing',
      step: 'started',
      message: `Processing ${attachment.filename}...`,
      progress: 0,
    });

    console.log('[Orchestrator] Step 1: Converting to markdown...');
    sseService.sendProgress(attachmentId, {
      status: 'processing',
      step: 'ingestion',
      message: 'Converting file to markdown...',
      progress: 25,
    });
    const markdown = await IngestionService.convertToMarkdown(attachment.url);

    sseService.sendEngineEvent(sessionId, userId, {
      type: 'success',
      scope: 'session',
      sessionId,
      message: `Converted ${attachment.filename} to markdown (${markdown.length} chars)`,
    });

    console.log('[Orchestrator] Step 2: Chunking content...');
    sseService.sendProgress(attachmentId, {
      status: 'processing',
      step: 'chunking',
      message: `Splitting into chunks (${markdown.length} characters)...`,
      progress: 50,
    });
    const chunks = await ChunkingService.chunkContent(markdown, {
      chunkSize: 1000,
      overlap: 200,
    });

    sseService.sendEngineEvent(sessionId, userId, {
      type: 'success',
      scope: 'session',
      sessionId,
      message: `Created ${chunks.length} chunks from document`,
    });

    console.log('[Orchestrator] Step 3: Generating embeddings...');
    sseService.sendProgress(attachmentId, {
      status: 'processing',
      step: 'embedding',
      message: `Generating embeddings for ${chunks.length} chunks...`,
      progress: 75,
    });
    const embeddings = await EmbeddingService.generateEmbeddings(chunks);

    sseService.sendEngineEvent(sessionId, userId, {
      type: 'success',
      scope: 'session',
      sessionId,
      message: `Generated ${embeddings.length} vector embeddings`,
    });

    console.log('[Orchestrator] Step 4: Storing vectors...');
    sseService.sendProgress(attachmentId, {
      status: 'processing',
      step: 'storage',
      message: 'Storing vectors in database...',
      progress: 90,
    });

    sseService.sendEngineEvent(sessionId, userId, {
      type: 'notification',
      scope: 'session',
      sessionId,
      message: `Storing ${embeddings.length} vectors in encrypted Cyborg DB...`,
    });

    await StorageService.storeVectors(sessionId, attachmentId, embeddings, attachment.filename);

    sseService.sendEngineEvent(sessionId, userId, {
      type: 'success',
      scope: 'session',
      sessionId,
      message: `Successfully stored ${embeddings.length} vectors in Cyborg DB`,
      attachmentId,
      actionType: 'view-chunks',
    });

    await prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        metadata: {
          ...(attachment.metadata as object),
          processed: true,
          processedAt: new Date().toISOString(),
          chunkCount: chunks.length,
          markdownLength: markdown.length,
        },
      },
    });

    console.log(`[Orchestrator]   Successfully processed: ${attachmentId}`);
    
    sseService.sendProgress(attachmentId, {
      status: 'completed',
      step: 'finished',
      message: `Successfully processed! (${chunks.length} chunks)`,
      progress: 100,
      chunkCount: chunks.length,
    });

    setTimeout(() => {
      sseService.closeProgress(attachmentId);
    }, 1000);

  } catch (error) {
    console.error(`[Orchestrator] ❌ Error processing ${attachmentId}:`, error);

    sseService.sendProgress(attachmentId, {
      status: 'failed',
      step: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      progress: 0,
    });

    try {
      await prisma.attachment.update({
        where: { id: attachmentId },
        data: {
          metadata: {
            processed: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            failedAt: new Date().toISOString(),
          },
        },
      });
    } catch (updateError) {
      console.error('[Orchestrator] Failed to update error status:', updateError);
    }

    setTimeout(() => {
      sseService.closeProgress(attachmentId);
    }, 1000);

    throw error; // Re-throw for job queue retry mechanism
  }
}

export function Orchestrator() {
  console.log('[Orchestrator] Registering file processor...');

  jobQueue.registerHandler('process-file', async (data: OrchestrationJob) => {
    const { attachmentId, userId, sessionId } = data;
    console.log(`[Orchestrator] Processing file job: attachmentId=${attachmentId}, userId=${userId}, sessionId=${sessionId}`);
    await processFile(attachmentId, userId, sessionId);
    console.log(`[Orchestrator] File job completed: ${attachmentId}`);
  });

  console.log('[Orchestrator] File processor ready');
}