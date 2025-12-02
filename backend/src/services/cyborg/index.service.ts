import { getClient } from './client';

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

    const indexes = await client.listIndexes();
    
    if (indexes.includes(indexName)) {
      console.log(`[CyborgDB] Index ${indexName} already exists`);
      return;
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
  }

  static async deleteIndex(sessionId: string): Promise<void> {
    const client = getClient();
    const indexName = this.generateIndexName(sessionId);
    
    const index = await client.loadIndex({
        indexName,
        indexKey
    })

    await index.deleteIndex()
    console.log(`[CyborgDB] Index ${indexName} deleted`);
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