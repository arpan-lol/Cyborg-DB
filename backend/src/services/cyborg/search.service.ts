import { getClient } from './client';
import { EmbeddingService } from '../embedding.service';
import { IndexService } from './index.service';
import { PrismaClient } from '@prisma/client';
import { sseService } from '../sse.service';

const prisma = new PrismaClient();

export interface SearchResult {
    content: string;
    attachmentId: string;
    filename: string;
    chunkIndex: number;
    pageNumber?: number;
    score: number;
    metadata?: any;
}

export class SearchService {
    static async search(
        sessionId: string,
        queryText: string,
        topK: number = 10,
        attachmentId?: string
    ): Promise<SearchResult[]> {
        try {
            const session = await prisma.chatSession.findUnique({
                where: { id: sessionId },
                select: { userId: true }
            });

            if (session) {
                sseService.sendEngineEvent(sessionId, session.userId, {
                    type: 'notification',
                    scope: 'session',
                    sessionId,
                    message: `Starting vector search (topK=${topK})...`,
                });
            }

            const indexName = IndexService.generateIndexName(sessionId);
            const hasIndex = await IndexService.hasIndex(sessionId);

            const client = getClient()

            if (!hasIndex) {
                console.log(`[CyborgDB] No index found for session: ${sessionId}`);
                if (session) {
                    sseService.sendEngineEvent(sessionId, session.userId, {
                        type: 'error',
                        scope: 'session',
                        sessionId,
                        message: 'No index found for this session',
                    });
                }
                return [];
            }

            const rawKey = process.env.ENCRYPTION_KEY
            if (!rawKey) throw new Error("Cyborg encryption key not set!")
            const indexKey = Uint8Array.from(Buffer.from(rawKey, 'base64'));

            if (!indexKey) {
                throw new Error(`Encryption key not found for session ${sessionId}`);
            }

            const index = await client.loadIndex({indexName, indexKey});

            if (session) {
                sseService.sendEngineEvent(sessionId, session.userId, {
                    type: 'notification',
                    scope: 'session',
                    sessionId,
                    message: 'Generating query embedding...',
                });
            }

            const queryVector = await EmbeddingService.generateQueryEmbedding(queryText);

            const searchK = attachmentId ? topK * 3 : topK;
            const searchResults = await index.query({
                queryVectors: queryVector,
                topK: searchK,
            });

            if (session) {
                sseService.sendEngineEvent(sessionId, session.userId, {
                    type: 'success',
                    scope: 'session',
                    sessionId,
                    message: `Vector search completed, retrieving chunk data...`,
                });
            }

            const queryResults = searchResults.results as Array<{id: string, distance: number}>;
            const resultIds = queryResults.map(r => r.id);
            const scores = queryResults.map(r => r.distance);

            if (resultIds.length === 0) {
                console.log(`[CyborgDB] No results found for query in session ${sessionId}`);
                if (session) {
                    sseService.sendEngineEvent(sessionId, session.userId, {
                        type: 'notification',
                        scope: 'session',
                        sessionId,
                        message: 'No matching vectors found',
                    });
                }
                return [];
            }

            const chunks = await prisma.chunkData.findMany({
                where: {
                    vectorId: { in: resultIds },
                    ...(attachmentId && { attachmentId }),
                },
                include: {
                    attachment: {
                        select: {
                            id: true,
                            filename: true,
                            metadata: true,
                        },
                    },
                },
            });

            const chunkMap = new Map(
                chunks.map((chunk) => [chunk.vectorId, chunk])
            );

            const resultsWithNulls = resultIds
                .map((vectorId: string, index: number): SearchResult | null => {
                    const chunk = chunkMap.get(vectorId);
                    if (!chunk) {
                        console.warn(`[CyborgDB] Vector ID ${vectorId} not found`);
                        return null;
                    }

                    return {
                        content: chunk.content,
                        attachmentId: chunk.attachmentId,
                        filename: chunk.attachment.filename,
                        chunkIndex: chunk.chunkIndex,
                        pageNumber: chunk.pageNumber ?? undefined,
                        score: scores[index],
                        metadata: {
                            startChar: chunk.startChar,
                            endChar: chunk.endChar,
                            pageNumber: chunk.pageNumber,
                            ...(chunk.attachment.metadata as object),
                        },
                    };
                });
            
            let results: SearchResult[] = resultsWithNulls.filter((r): r is SearchResult => r !== null);

            if (attachmentId) {
                results = results.slice(0, topK);
                console.log(`[CyborgDB] Found ${results.length} results in attachment ${attachmentId}`);
            } else {
                console.log(`[CyborgDB] Found ${results.length} results for query in session ${sessionId}`);
            }

            if (session) {
                const attachmentNames = [...new Set(results.map(r => r.filename))];
                sseService.sendEngineEvent(sessionId, session.userId, {
                    type: 'success',
                    scope: 'session',
                    sessionId,
                    message: `Retrieved ${results.length} chunks from ${attachmentNames.length} document(s)`,
                    data: {
                        title: 'Search Results',
                        body: attachmentNames.slice(0, 5).map(name => `${name}`)
                    }
                });
            }

            return results;
        } catch (error) {
            console.error(`[CyborgDB] Search failed in session ${sessionId}:`, error);
            return [];
        }
    }

    static async getChunk(
        sessionId: string,
        attachmentId: string,
        chunkIndex: number
    ): Promise<SearchResult | null> {
        try {
            const chunk = await prisma.chunkData.findUnique({
                where: {
                    attachmentId_chunkIndex: {
                        attachmentId,
                        chunkIndex,
                    },
                },
                include: {
                    attachment: {
                        select: {
                            filename: true,
                            metadata: true,
                        },
                    },
                },
            });

            if (!chunk) {
                return null;
            }

            return {
                content: chunk.content,
                attachmentId: chunk.attachmentId,
                filename: chunk.attachment.filename,
                chunkIndex: chunk.chunkIndex,
                pageNumber: chunk.pageNumber ?? undefined,
                score: 0, 
                metadata: {
                    startChar: chunk.startChar,
                    endChar: chunk.endChar,
                    pageNumber: chunk.pageNumber,
                    ...(chunk.attachment.metadata as object),
                },
            };
        } catch (error) {
            console.error(
                `[CyborgDB] Failed to retrieve chunk ${chunkIndex} for attachment ${attachmentId}:`,
                error
            );
            return null;
        }
    }

    static async getAllChunks(
        sessionId: string,
        attachmentId: string
    ): Promise<Array<{ content: string; index: number; metadata?: any }>> {
        try {
            const chunks = await prisma.chunkData.findMany({
                where: { attachmentId },
                orderBy: { chunkIndex: 'asc' },
                select: {
                    content: true,
                    chunkIndex: true,
                    pageNumber: true,
                    startChar: true,
                    endChar: true,
                },
            });

            const result = chunks.map((chunk) => ({
                content: chunk.content,
                index: chunk.chunkIndex,
                metadata: {
                    pageNumber: chunk.pageNumber,
                    startChar: chunk.startChar,
                    endChar: chunk.endChar,
                },
            }));

            console.log(`[CyborgDB] Retrieved ${result.length} chunks for attachment ${attachmentId}`);
            return result;
        } catch (error) {
            console.error(`[CyborgDB] Failed to retrieve chunks for attachment ${attachmentId}:`, error);
            return [];
        }
    }
}