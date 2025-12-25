import { Chunk } from './chunking.service';
import { logger } from '../utils/logger.util.js';
import { ProcessingError } from '../types/error.types';

export interface Embedding {
  chunkIndex: number;
  vector: number[];
  content: string;
  metadata?: Record<string, any>;
}

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'; //fallbacks for dev
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'nomic-embed-text';

interface OllamaEmbeddingResponse {
  embedding: number[];
}

function normalizeVector(vector: number[]): number[] {
  let magnitude = 0;
  for (let i = 0; i < vector.length; i++) {
    magnitude += vector[i] * vector[i];
  }
  magnitude = Math.sqrt(magnitude);
  
  if (magnitude === 0) {
    return vector;
  }
  
  return vector.map(v => v / magnitude);
}

async function fetchSingleEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, prompt: text }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ProcessingError(`Ollama embedding error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as OllamaEmbeddingResponse;
  if (!data.embedding) {
    throw new ProcessingError('No embedding returned from Ollama');
  }

  return normalizeVector(data.embedding);
}

async function processBatch(texts: string[], startIndices: number[]): Promise<{ index: number; vector: number[] }[]> {
  const results = await Promise.allSettled(
    texts.map(text => fetchSingleEmbedding(text))
  );

  const embeddings: { index: number; vector: number[] }[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') {
      embeddings.push({
        index: startIndices[i],
        vector: result.value,
      });
    } else {
      throw result.reason || new ProcessingError(`Failed to generate embedding at index ${startIndices[i]}`);
    }
  }

  return embeddings;
}

export class EmbeddingService {
  static async *generateEmbeddingsStream(
    chunkStream: AsyncGenerator<Chunk>
  ): AsyncGenerator<Embedding> {
    const BATCH_SIZE = 5;
    let batch: Chunk[] = [];

    for await (const chunk of chunkStream) {
      batch.push(chunk);

      if (batch.length >= BATCH_SIZE) {
        const embeddings = await this.generateEmbeddings(batch);
        for (const embedding of embeddings) {
          yield embedding;
        }
        batch = [];
      }
    }

    if (batch.length > 0) {
      const embeddings = await this.generateEmbeddings(batch);
      for (const embedding of embeddings) {
        yield embedding;
      }
    }
  }

  static async generateEmbeddings(chunks: Chunk[]): Promise<Embedding[]> {
    if (chunks.length === 0) {
      return [];
    }

    const BATCH_SIZE = 5;
    const allEmbeddings: Embedding[] = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, i + BATCH_SIZE);
      const texts = batchChunks.map((chunk) => chunk.content);
      const chunkIndices = batchChunks.map((chunk) => chunk.index);

      try {
        const batchResults = await processBatch(texts, chunkIndices);

        const embeddings: Embedding[] = batchChunks.map((chunk, idx) => {
          const result = batchResults[idx];
          return {
            chunkIndex: chunk.index,
            vector: result.vector,
            content: chunk.content,
            metadata: chunk.metadata || {},
          };
        });

        allEmbeddings.push(...embeddings);
      } catch (error) {
        logger.error('Embedding', 'Error generating embeddings via Ollama', error instanceof Error ? error : undefined, { chunkCount: batchChunks.length, batchStart: i });
        
        if (error instanceof ProcessingError) {
          throw error;
        }
        
        throw new ProcessingError(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return allEmbeddings;
  }

  static async generateQueryEmbedding(queryText: string): Promise<number[]> {
    try {
      return await fetchSingleEmbedding(queryText);
    } catch (error) {
      logger.error('Embedding', 'Error generating query embedding via Ollama', error instanceof Error ? error : undefined, { queryLength: queryText.length });
      
      if (error instanceof ProcessingError) {
        throw error;
      }
      
      throw new ProcessingError(`Failed to generate query embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}