import { GoogleGenAI, Content } from '@google/genai';
import { RetrievalService } from './retrieval.service';
import { buildPrompt } from './prompts/system.prompt';
import { logger } from '../../utils/logger.util';
import { isGeminiError, parseGeminiError, ProcessingError } from '../../types/error.types';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const MODEL = 'gemini-2.5-flash';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function formatHistory(
  conversationHistory: ChatMessage[]
): Content[] {
  return conversationHistory.map((msg) => ({
    role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: msg.content }],
  }));
}


export class GenerationService {
  static async *streamResponse(
    sessionId: string,
    query: string,
    conversationHistory: ChatMessage[] = [],
    attachmentIds?: string[]
  ): AsyncGenerator<string> {
    try {
      const enhancedContexts = await RetrievalService.getContext(sessionId, query, attachmentIds);
      const systemPromptWithContext = buildPrompt('', enhancedContexts, []);

      logger.info('Generation', 'Starting stream response', { sessionId });

      const contents: Content[] = [
        {
          role: 'user' as const,
          parts: [{ text: systemPromptWithContext }],
        },
        ...formatHistory(conversationHistory),
        {
          role: 'user' as const,
          parts: [{ text: query }],
        },
      ];

      const stream = await ai.models.generateContentStream({
        model: MODEL,
        contents,
        config: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      for await (const chunk of stream) {
        const candidates = chunk.candidates ?? [];

        for (const candidate of candidates) {
          const parts = candidate.content?.parts ?? [];

          for (const part of parts) {
            if (part.text) {
              yield part.text;
            }
          }
        }
      }
    } catch (error) {
      logger.error('Generation', 'Error streaming response', error instanceof Error ? error : undefined, { sessionId });

      if (isGeminiError(error)) {
        throw parseGeminiError(error);
      }

      throw new ProcessingError('Failed to stream response');
    }
  }

  static async generate(params: {
    systemPrompt?: string
    userPrompt: string
    temperature?: number
    maxTokens?: number
  }): Promise<string> {
    const {
      systemPrompt,
      userPrompt,
      temperature = 0.5,
      maxTokens = 200,
    } = params

    try {
      const contents: Content[] = []

      if (systemPrompt) {
        contents.push({
          role: 'user' as const,
          parts: [{ text: systemPrompt }],
        })
      }

      contents.push({
        role: 'user' as const,
        parts: [{ text: userPrompt }],
      })

      const result = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      })

      const text =
        result.candidates?.[0]?.content?.parts
          ?.map(p => p.text)
          .filter(Boolean)
          .join('') ?? ''

      return text.trim()
    } catch (error) {
      logger.error(
        'Generation',
        'generate() failed',
        error instanceof Error ? error : undefined
      )
      throw error
    }
  }
}