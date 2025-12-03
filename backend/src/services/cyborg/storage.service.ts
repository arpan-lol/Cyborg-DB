import { getClient } from './client';
import { Embedding } from '../embedding.service';
import { IndexService } from './index.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StorageService {
  private static generateVectorId(attachmentId: string, chunkIndex: number): string {
    return `${attachmentId}:${chunkIndex}`;
  }

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
    
    const rawKey = process.env.ENCRYPTION_KEY;
    if (!rawKey) throw new Error("Cyborg encryption key not set!");
    const indexKey = Uint8Array.from(Buffer.from(rawKey, 'base64'));

    const index = await client.loadIndex({indexName, indexKey});

    const items = embeddings.map((embedding) => ({
      id: this.generateVectorId(attachmentId, embedding.chunkIndex),
      values: embedding.vector,
    }));

    await index.upsert({ items });

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

    await prisma.chunkData.createMany({
      data: chunkDataRecords,
      skipDuplicates: true, 
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

  static async deleteAttachmentVectors(
    sessionId: string,
    attachmentId: string
  ): Promise<void> {
    const client = getClient();
    const indexName = IndexService.generateIndexName(sessionId);
    
    const rawKey = process.env.ENCRYPTION_KEY;
    if (!rawKey) throw new Error("Cyborg encryption key not set!");
    const indexKey = Uint8Array.from(Buffer.from(rawKey, 'base64'));

    const chunks = await prisma.chunkData.findMany({
      where: { attachmentId },
      select: { vectorId: true },
    });

    if (chunks.length === 0) {
      console.log(`[CyborgDB] No chunks found for attachment ${attachmentId}`);
      return;
    }

    const vectorIds = chunks.map((c) => c.vectorId);

    const index = await client.loadIndex({indexName, indexKey});
    await index.delete({ ids: vectorIds });

    await prisma.chunkData.deleteMany({
      where: { attachmentId },
    });

    console.log(
      `[CyborgDB] Deleted ${vectorIds.length} vectors for attachment ${attachmentId}`
    );
  }
}