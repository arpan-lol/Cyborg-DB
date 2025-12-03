import { getClient } from './client';
import { Embedding } from '../embedding.service';
import { IndexService } from './index.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StorageService {
  /**
   * Generate vector ID from attachmentId and chunkIndex
   * Format: "attachmentId:chunkIndex"
   */
  private static generateVectorId(attachmentId: string, chunkIndex: number): string {
    return `${attachmentId}:${chunkIndex}`;
  }

  /**
   * Store vectors with streaming progress updates
   */
  static async *storeVectorsStream(
    sessionId: string,
    attachmentId: string,
    embeddingStream: AsyncGenerator<Embedding>,
    filename?: string
  ): AsyncGenerator<number> {
    const indexName = IndexService.generateIndexName(sessionId);
    const BATCH_SIZE = 50;
    let batch: Embedding[] = [];
    let totalStored = 0;

    for await (const embedding of embeddingStream) {
      batch.push(embedding);

      if (batch.length >= BATCH_SIZE) {
        await this.storeEmbeddings(sessionId, attachmentId, batch, filename);
        totalStored += batch.length;
        yield totalStored;
        batch = [];
      }
    }

    if (batch.length > 0) {
      await this.storeEmbeddings(sessionId, attachmentId, batch, filename);
      totalStored += batch.length;
      yield totalStored;
    }

    console.log(
      `[CyborgDB] Stored ${totalStored} embeddings for attachment ${attachmentId} in session ${sessionId}`
    );
  }

  /**
   * Store vectors in batch
   */
  static async storeVectors(
    sessionId: string,
    attachmentId: string,
    embeddings: Embedding[],
    filename?: string
  ): Promise<void> {
    if (embeddings.length === 0) {
      console.log(`[CyborgDB] No embeddings to store for attachment: ${attachmentId}`);
      return;
    }

    await this.storeEmbeddings(sessionId, attachmentId, embeddings, filename);
    console.log(
      `[CyborgDB] Stored ${embeddings.length} embeddings for attachment ${attachmentId} in session ${sessionId}`
    );
  }

  /**
   * Core storage method - stores in both CyborgDB (vectors) and PostgreSQL (metadata)
   */
  private static async storeEmbeddings(
    sessionId: string,
    attachmentId: string,
    embeddings: Embedding[],
    filename?: string
  ): Promise<void> {
    if (embeddings.length === 0) {
      return;
    }

    const client = getClient();
    const indexName = IndexService.generateIndexName(sessionId);
    const indexKey = IndexService.getSessionKey(sessionId);

    if (!indexKey) {
      throw new Error(`Encryption key not found for session ${sessionId}`);
    }

    // Load the index
    const index = await client.loadIndex(indexName, indexKey);

    // Prepare vectors for CyborgDB (only IDs and vectors)
    const vectors = embeddings.map((embedding) => ({
      id: this.generateVectorId(attachmentId, embedding.chunkIndex),
      values: embedding.vector,
    }));

    // Store vectors in CyborgDB (encrypted)
    await index.upsert({ vectors });

    // Store metadata in PostgreSQL (searchable, unencrypted)
    const chunkDataRecords = embeddings.map((embedding) => ({
      id: this.generateVectorId(attachmentId, embedding.chunkIndex),
      attachmentId: attachmentId,
      chunkIndex: embedding.chunkIndex,
      content: embedding.content,
      vectorId: this.generateVectorId(attachmentId, embedding.chunkIndex),
      pageNumber: embedding.metadata?.pageNumber ?? null,
      startChar: embedding.metadata?.startChar ?? null,
      endChar: embedding.metadata?.endChar ?? null,
    }));

    // Bulk insert into PostgreSQL
    await prisma.chunkData.createMany({
      data: chunkDataRecords,
      skipDuplicates: true, // In case of retry
    });

    if (embeddings.length > 0 && embeddings[0].metadata?.pageNumber) {
      console.log(
        `[CyborgDB] Sample metadata - pageNumber: ${embeddings[0].metadata.pageNumber}, chunk: ${embeddings[0].chunkIndex}`
      );
    }

    console.log(
      `[CyborgDB] Inserted ${embeddings.length} embeddings into ${indexName} and PostgreSQL`
    );
  }

  /**
   * Delete all chunks for an attachment
   */
  static async deleteAttachmentVectors(
    sessionId: string,
    attachmentId: string
  ): Promise<void> {
    const client = getClient();
    const indexName = IndexService.generateIndexName(sessionId);
    const indexKey = IndexService.getSessionKey(sessionId);

    if (!indexKey) {
      throw new Error(`Encryption key not found for session ${sessionId}`);
    }

    // Get all chunk vector IDs for this attachment
    const chunks = await prisma.chunkData.findMany({
      where: { attachmentId },
      select: { vectorId: true },
    });

    if (chunks.length === 0) {
      console.log(`[CyborgDB] No chunks found for attachment ${attachmentId}`);
      return;
    }

    const vectorIds = chunks.map((c) => c.vectorId);

    // Delete from CyborgDB
    const index = await client.loadIndex(indexName, indexKey);
    await index.delete({ ids: vectorIds });

    // Delete from PostgreSQL
    await prisma.chunkData.deleteMany({
      where: { attachmentId },
    });

    console.log(
      `[CyborgDB] Deleted ${vectorIds.length} vectors for attachment ${attachmentId}`
    );
  }
}