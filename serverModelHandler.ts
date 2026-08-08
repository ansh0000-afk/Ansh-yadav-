import { securityKeyManager } from './securityKeyManager';

export interface FreeAIModelInfo {
  id: string;
  name: string;
  provider: 'google' | 'openrouter';
  providerLabel: string;
  description: string;
  contextWindow: string;
  speed: 'Ultra Fast' | 'Fast' | 'Balanced' | 'Instant';
  isFree: true;
  badge?: string;
  supportsImage?: boolean;
}

export const FREE_AI_MODELS_SERVER: FreeAIModelInfo[] = [
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    provider: 'google',
    providerLabel: 'Google Gemini',
    description: 'Flagship versatile model for general multi-turn chat, reasoning & search grounding.',
    contextWindow: '1M tokens',
    speed: 'Ultra Fast',
    isFree: true,
    badge: 'Flagship Chat',
    supportsImage: true
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    provider: 'google',
    providerLabel: 'Google Gemini',
    description: 'Advanced reasoning model for complex code, mathematics, and deep analysis.',
    contextWindow: '2M tokens',
    speed: 'Fast',
    isFree: true,
    badge: 'Complex Reasoning',
    supportsImage: true
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    provider: 'google',
    providerLabel: 'Google Gemini',
    description: 'Ultra-fast lightweight model for rapid text editing, summaries & instant tasks.',
    contextWindow: '1M tokens',
    speed: 'Ultra Fast',
    isFree: true,
    badge: 'Fast Tasks',
    supportsImage: true
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    provider: 'google',
    providerLabel: 'Google Gemini',
    description: 'High-speed multimodal model. Best reasoning & search grounding.',
    contextWindow: '1M tokens',
    speed: 'Ultra Fast',
    isFree: true,
    badge: 'Recommended',
    supportsImage: true
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    providerLabel: 'Google Gemini',
    description: 'Fast versatile model for reasoning, coding, and structured responses.',
    contextWindow: '1M tokens',
    speed: 'Ultra Fast',
    isFree: true,
    supportsImage: true
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'google',
    providerLabel: 'Google Gemini',
    description: 'Lightweight high-throughput model with minimal latency.',
    contextWindow: '1M tokens',
    speed: 'Ultra Fast',
    isFree: true,
    supportsImage: true
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'google',
    providerLabel: 'Google Gemini',
    description: 'Ultra-lean Flash variant for instant low-power pings.',
    contextWindow: '1M tokens',
    speed: 'Ultra Fast',
    isFree: true
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'openrouter',
    providerLabel: 'OpenRouter Free',
    description: 'Open-weights reasoning model with chain-of-thought capabilities.',
    contextWindow: '128K tokens',
    speed: 'Balanced',
    isFree: true,
    badge: 'Reasoning'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B Instruct (Free)',
    provider: 'openrouter',
    providerLabel: 'OpenRouter Free',
    description: 'Meta flagship open 70B parameter model for complex instruction following.',
    contextWindow: '128K tokens',
    speed: 'Fast',
    isFree: true,
    badge: 'Open Meta'
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'Gemma 2 9B IT (Free)',
    provider: 'openrouter',
    providerLabel: 'OpenRouter Free',
    description: 'Google lightweight Gemma 2 open model optimized for general dialogue.',
    contextWindow: '8K tokens',
    speed: 'Ultra Fast',
    isFree: true
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct:free',
    name: 'Qwen 2.5 Coder 32B (Free)',
    provider: 'openrouter',
    providerLabel: 'OpenRouter Free',
    description: 'Alibaba Qwen 2.5 32B model fine-tuned specifically for code generation.',
    contextWindow: '32K tokens',
    speed: 'Fast',
    isFree: true,
    badge: 'Coding Specialist'
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B Instruct (Free)',
    provider: 'openrouter',
    providerLabel: 'OpenRouter Free',
    description: 'Mistral AI lightweight 7B model for quick conversational turns.',
    contextWindow: '32K tokens',
    speed: 'Ultra Fast',
    isFree: true
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute request against OpenRouter API
 */
async function callOpenRouter(
  modelId: string,
  messages: any[],
  systemPrompt: string,
  settings: any,
  req: any
): Promise<{ text: string; modelUsed: string; isFallback: boolean }> {
  const userOpenRouterKey = securityKeyManager.getOpenRouterKey(req);
  
  // Format messages for OpenRouter OpenAI-compatible endpoint
  const openRouterMessages: any[] = [];
  if (systemPrompt) {
    openRouterMessages.push({ role: 'system', content: systemPrompt });
  }

  for (const msg of messages) {
    if (msg.parts && Array.isArray(msg.parts)) {
      const textPart = msg.parts.map((p: any) => p.text || '').filter(Boolean).join('\n');
      if (textPart) {
        openRouterMessages.push({
          role: msg.role === 'model' ? 'assistant' : msg.role || 'user',
          content: textPart
        });
      }
    } else if (msg.content) {
      openRouterMessages.push({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : msg.role || 'user',
        content: msg.content
      });
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.APP_URL || 'https://ai.studio/build',
    'X-Title': 'Alpha AI Assistant'
  };

  if (userOpenRouterKey) {
    headers['Authorization'] = `Bearer ${userOpenRouterKey}`;
  } else {
    // OpenRouter free models work with public authorization or anonymous access token
    headers['Authorization'] = `Bearer openrouter-free-tier`;
  }

  const payload: any = {
    model: modelId,
    messages: openRouterMessages,
    temperature: settings?.temperature ?? 0.7,
    max_tokens: settings?.maxTokens ?? 2048
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const data: any = await response.json();
  const textOutput = data?.choices?.[0]?.message?.content || '';

  if (!textOutput) {
    throw new Error('OpenRouter returned an empty response.');
  }

  return {
    text: textOutput,
    modelUsed: modelId,
    isFallback: false
  };
}

/**
 * Execute request against Gemini API
 */
async function callGemini(
  ai: any,
  modelId: string,
  contents: any[],
  systemPrompt: string,
  settings: any,
  tools?: any[]
): Promise<{ text: string; functionCalls?: any[]; candidates?: any[]; modelUsed: string }> {
  const config: any = {
    systemInstruction: systemPrompt
  };

  if (settings?.temperature !== undefined) {
    config.temperature = settings.temperature;
  }
  if (settings?.maxTokens !== undefined) {
    config.maxOutputTokens = settings.maxTokens;
  }
  if (tools && tools.length > 0) {
    config.tools = tools;
  }
  if (settings?.enableSearch !== false) {
    config.toolConfig = { includeServerSideToolInvocations: true };
  }

  let attempt = 0;
  const maxRetries = 3;
  let delayMs = 1000;

  while (true) {
    attempt++;
    try {
      const res = await ai.models.generateContent({
        model: modelId,
        contents,
        config
      });

      return {
        text: res.text || '',
        functionCalls: res.functionCalls || [],
        candidates: res.candidates || [],
        modelUsed: modelId
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isRateLimit = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded') || err?.status === 429;

      if (isRateLimit && attempt <= maxRetries) {
        console.warn(`[Gemini API] 429 Rate limit hit for ${modelId}. Retry attempt ${attempt}/${maxRetries} after ${delayMs}ms...`);
        await delay(delayMs);
        delayMs *= 2; // exponential backoff
        continue;
      }

      throw err;
    }
  }
}

/**
 * Unified execution route with automatic fallback across free models
 */
export async function executeMultiModelRequest(
  ai: any,
  contents: any[],
  fullSystemPrompt: string,
  settings: any,
  tools: any[],
  req: any
): Promise<{
  text: string;
  groundingSources: any[];
  toolExecutions: any[];
  generatedImageUrl?: string;
  modelUsed: string;
  wasFallback: boolean;
}> {
  const primaryModel = settings?.selectedModel || settings?.aiModel || 'gemini-3.5-flash';
  const autoFallback = settings?.autoFallback !== false;

  // Define candidate sequence based on user preference
  let candidates: string[] = [];

  if (primaryModel.includes('/') || primaryModel.includes(':free')) {
    // OpenRouter primary
    candidates = [
      primaryModel,
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-r1:free',
      'qwen/qwen-2.5-coder-32b-instruct:free',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-2.5-flash'
    ];
  } else {
    // Gemini primary
    candidates = [
      primaryModel,
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash-lite',
      'deepseek/deepseek-r1:free',
      'meta-llama/llama-3.3-70b-instruct:free'
    ];
  }

  // Deduplicate candidate sequence
  candidates = Array.from(new Set(candidates));

  if (!autoFallback) {
    candidates = [primaryModel];
  }

  let lastError: any = null;

  for (let i = 0; i < candidates.length; i++) {
    const candidateModel = candidates[i];
    const isFallbackAttempt = i > 0;

    if (isFallbackAttempt) {
      await delay(800 * i); // progressive backoff before retry
    }

    try {
      if (candidateModel.includes('/') || candidateModel.includes(':free')) {
        // OpenRouter Model Execution
        const result = await callOpenRouter(candidateModel, contents, fullSystemPrompt, settings, req);
        return {
          text: result.text,
          groundingSources: [],
          toolExecutions: [],
          modelUsed: result.modelUsed,
          wasFallback: isFallbackAttempt
        };
      } else {
        // Gemini Model Execution
        const toolsToUse = isFallbackAttempt ? [] : tools; // skip complex tools on deep fallback to maximize success
        const result = await callGemini(ai, candidateModel, contents, fullSystemPrompt, settings, toolsToUse);

        // Extract grounding sources
        const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const groundingSources = groundingChunks
          ? groundingChunks
              .map((chunk: any) => {
                if (chunk.web) {
                  return { title: chunk.web.title || 'Web Source', url: chunk.web.uri };
                }
                return null;
              })
              .filter(Boolean)
          : [];

        const toolExecutions: any[] = [];
        let generatedImageUrl: string | undefined = undefined;

        if (result.functionCalls && result.functionCalls.length > 0) {
          for (const fc of result.functionCalls) {
            toolExecutions.push({
              name: fc.name,
              args: fc.args
            });

            // Handle image generation tool
            if (fc.name === 'generate_image' && fc.args?.prompt) {
              try {
                const imgRes = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: { parts: [{ text: fc.args.prompt as string }] },
                  config: {
                    imageConfig: { aspectRatio: '1:1' }
                  }
                });

                for (const part of imgRes.candidates?.[0]?.content?.parts || []) {
                  if (part.inlineData) {
                    generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
                    break;
                  }
                }
              } catch (imgErr) {
                console.error('Error in generate_image tool:', imgErr);
              }
            }
          }
        }

        return {
          text: result.text || 'Response received.',
          groundingSources,
          toolExecutions,
          generatedImageUrl,
          modelUsed: result.modelUsed,
          wasFallback: isFallbackAttempt
        };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model execution attempt ${i + 1} (${candidateModel}) failed:`, err?.message || err);
    }
  }

  throw lastError || new Error('All free AI model attempts failed.');
}
