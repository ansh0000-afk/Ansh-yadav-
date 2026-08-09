import { apiFetch } from './apiClient';

/**
 * Helper client service to call server-side Gemini endpoints.
 */

export interface AnalyzeRequest {
  taskType: 'complex_reasoning' | 'code_analysis' | 'summarize' | 'fast_edit' | 'auto_category' | 'general_task';
  text: string;
  context?: string;
}

export interface AnalyzeResponse {
  result: string;
  modelUsed: string;
}

/**
 * Perform content analysis, summarization, code editing or categorization using Gemini.
 */
export async function analyzeContent(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  const response = await apiFetch<AnalyzeResponse>('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });

  if (!response.ok) {
    throw new Error(response.error || 'Failed to analyze content');
  }

  return response.data;
}

/**
 * Generate a visual graphic or image prompt using Gemini Image generation.
 */
export async function generateImage(prompt: string, aspectRatio: string = '1:1'): Promise<string> {
  const response = await apiFetch<{ imageUrl: string }>('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio })
  });

  if (!response.ok || !response.data?.imageUrl) {
    throw new Error(response.error || 'Failed to generate image');
  }

  return response.data.imageUrl;
}

/**
 * Request Text-To-Speech audio output from Gemini TTS model.
 */
export async function generateGeminiSpeech(text: string, voiceName: string = 'Kore'): Promise<string> {
  const response = await apiFetch<{ audioData: string }>('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceName })
  });

  if (!response.ok || !response.data?.audioData) {
    throw new Error(response.error || 'Failed to generate speech');
  }

  return response.data.audioData;
}

