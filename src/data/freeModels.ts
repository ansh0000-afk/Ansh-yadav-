import { FreeAIModel } from '../types';

export const FREE_AI_MODELS: FreeAIModel[] = [
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
    speed: 'Instant',
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

export const DEFAULT_MODEL_ID = 'gemini-3.5-flash';
