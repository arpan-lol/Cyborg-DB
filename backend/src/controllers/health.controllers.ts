import { Response } from 'express';
import { AuthRequest } from '../types/express.js';

class HealthController {
  static async getHealth(req: AuthRequest, res: Response): Promise<Response> {
    const checks: Record<string, any> = {
      api: 'ok',
    };

    try {
      const ollamaUrl = process.env.OLLAMA_BASE_URL?.replace('/v1', '');
      const ollamaResponse = await fetch(`${ollamaUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      
      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json();
        const models = (data as any).models?.map((m: any) => m.name) || [];
        checks.ollama = {
          status: 'ok',
          models,
        };
      } else {
        checks.ollama = { status: 'error', message: 'Ollama not responding' };
      }
    } catch (error) {
      checks.ollama = { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Connection failed' 
      };
    }

    const allOk = Object.values(checks).every(
      v => typeof v === 'string' ? v === 'ok' : v.status === 'ok'
    );

    return res.status(allOk ? 200 : 503).json({ 
      status: allOk ? 'ok' : 'degraded',
      checks,
    });
  }
}

export { HealthController}