//please pull llama4:maverick via ollama.
import OpenAI from 'openai';
import { RetrievalService } from './retrieval.service';
import { buildPrompt } from './prompts/system.prompt';
import { logger } from '../../utils/logger.util.js';
import { ProcessingError } from '../../types/error.types';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1'//fallback is for development
const openai = new OpenAI({
  baseURL: OLLAMA_BASE_URL,
  apiKey: 'ollama',
});

const MODEL = process.env.OLLAMA_MODEL || 'llama4:maverick';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function formatHistory(
  conversationHistory: ChatMessage[]
): OpenAI.Chat.ChatCompletionMessageParam[] {
  return conversationHistory
    .filter(msg => msg.role !== 'system')
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
}


export class GenerationService {
  static async warmup(): Promise<void> {
    try {
      logger.info('Generation', 'Warming up LLM!!');
      
      await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          prompt: "",
          stream: false,
          keep_alive: -1,
        }),
      });

      logger.info('Generation', 'LLM model warmed up and loaded into memory');
    } catch (error) {
      logger.error('Generation', 'Failed to warm up LLM model', error instanceof Error ? error : undefined);
    }
  }

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

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPromptWithContext,
        },
        ...formatHistory(conversationHistory),
        {
          role: 'user',
          content: query,
        },
      ];

      const stream = await openai.chat.completions.create(
        {
          model: MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 2048,
          stream: true,
        },
        { body: { keep_alive: -1 } as any }
      );

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      logger.error('Generation', 'Error streaming response', error instanceof Error ? error : undefined, { sessionId });
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
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt,
        });
      }

      messages.push({
        role: 'user',
        content: userPrompt,
      });

      const result = await openai.chat.completions.create(
        {
          model: MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
        },
        { body: { keep_alive: -1 } as any }
      );

      const text = result.choices[0]?.message?.content || '';

      return text.trim();
    } catch (error) {
      logger.error(
        'Generation',
        'generate() failed',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  }
}