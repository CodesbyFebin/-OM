export type AIProvider = 'ollama' | 'gemini' | 'auto';
export type PrivacyMode = 'private' | 'balanced' | 'performance';

export interface ModelSettings {
  preferredProvider: AIProvider;
  ollamaEndpoint: string;
  ollamaModel: string;
  geminiModel: string;
  fallbackToGemini: boolean;
  privacyMode: PrivacyMode;
  apiKey?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  spaceContext?: string;
}

export interface ChatCompletionResponse {
  content: string;
  provider: 'ollama' | 'gemini';
  modelUsed: string;
  latencyMs: number;
  privacyLevel: 'local' | 'cloud';
  rawResponse?: any;
}

export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  preferredProvider: 'auto',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'qwen2.5:7b',
  geminiModel: 'gemini-3.6-flash',
  fallbackToGemini: true,
  privacyMode: 'balanced',
};

export class ModelRouter {
  private settings: ModelSettings;

  constructor(settings?: Partial<ModelSettings>) {
    this.settings = { ...DEFAULT_MODEL_SETTINGS, ...settings };
  }

  public getSettings(): ModelSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<ModelSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Health check and model discovery via OM Server-Side Bridge
   */
  public async checkOllamaHealth(): Promise<{ available: boolean; models: string[]; message: string; circuitBreaker?: any }> {
    try {
      // Perform discovery exclusively via the server-side bridge to prevent CORS & browser errors
      const proxyRes = await fetch('/api/ollama/status').catch(() => null);
      if (proxyRes && proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.online) {
          return {
            available: true,
            models: data.installedModels || [],
            message: data.message || 'Ollama is online (via server bridge).',
            circuitBreaker: data.circuitBreaker,
          };
        }
        return {
          available: false,
          models: data.suggestedModels || [],
          message: data.reason || 'Ollama offline or circuit breaker OPEN on local port 11434.',
          circuitBreaker: data.circuitBreaker,
        };
      }
    } catch {
      // Ignore
    }

    return {
      available: false,
      models: [],
      message: 'Ollama status bridge unreachable. Routing through OM Cloud Gemini.',
    };
  }

  /**
   * Route and execute prompt through optimal AI provider
   */
  public async complete(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const startTime = Date.now();
    const isStrictlyPrivate = this.settings.privacyMode === 'private';

    // Decide strategy
    let useOllama = false;

    if (this.settings.preferredProvider === 'ollama' || isStrictlyPrivate) {
      useOllama = true;
    } else if (this.settings.preferredProvider === 'auto') {
      const health = await this.checkOllamaHealth();
      useOllama = health.available;
    }

    // Try Ollama first if selected
    if (useOllama) {
      try {
        const response = await this.callOllama(request);
        return {
          content: response.content,
          provider: 'ollama',
          modelUsed: this.settings.ollamaModel,
          latencyMs: Date.now() - startTime,
          privacyLevel: 'local',
          rawResponse: response.raw,
        };
      } catch (err) {
        console.warn('[OM ModelRouter] Ollama call failed:', err);

        if (isStrictlyPrivate || !this.settings.fallbackToGemini) {
          throw new Error('Local Ollama execution failed and fallback to Gemini is disabled under strict Private mode.');
        }
      }
    }

    // Call Gemini (Cloud / Server Proxy)
    if (isStrictlyPrivate) {
      throw new Error('[OM ModelRouter Privacy Enforcement] Request blocked from cloud routing: Privacy mode is strictly set to "private". Local processing required.');
    }

    try {
      const response = await this.callGemini(request);
      return {
        content: response.content,
        provider: 'gemini',
        modelUsed: this.settings.geminiModel,
        latencyMs: Date.now() - startTime,
        privacyLevel: 'cloud',
        rawResponse: response.raw,
      };
    } catch (geminiErr: any) {
      throw new Error(`[OM ModelRouter] Model execution failed on all routes: ${geminiErr.message || geminiErr}`);
    }
  }

  /**
   * Execute via OM Server-Side Bridge Proxy (/api/ollama/chat)
   */
  private async callOllama(request: ChatCompletionRequest): Promise<{ content: string; raw: any }> {
    const promptText = request.prompt || request.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    const res = await fetch('/api/ollama/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.settings.ollamaModel,
        prompt: promptText,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama Server Bridge HTTP Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return {
      content: data.answer || '',
      raw: data,
    };
  }

  /**
   * Execute via OM Server API Proxy (Gemini)
   */
  private async callGemini(request: ChatCompletionRequest): Promise<{ content: string; raw: any }> {
    const query = request.prompt || request.messages.filter((m) => m.role === 'user').pop()?.content || '';

    const res = await fetch('/api/ai/universal-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        spaceContext: request.spaceContext || 'General',
        useWebSearch: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini Proxy Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return {
      content: data.answer || JSON.stringify(data),
      raw: data,
    };
  }
}

// Global Singleton Instance for application-wide routing
export const globalModelRouter = new ModelRouter();

export const routePrompt = (prompt: string, spaceContext?: string) => {
  return globalModelRouter.complete({
    prompt,
    messages: [{ role: 'user', content: prompt }],
    spaceContext,
  });
};
