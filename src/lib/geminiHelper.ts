import { GoogleGenAI } from '@google/genai';

// Environment variable ya direct API key set karein
const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || '' });

export interface AnalyzeRequest {
  taskType: 'complex_reasoning' | 'code_analysis' | 'summarize' | 'fast_response';
  text: string;
  context?: string;
}

export interface AnalyzeResponse {
  result: string;
  modelUsed: string;
}

export async function analyzeContent(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  const modelName = 'gemini-2.5-flash';
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `${req.context ? req.context + '\n' : ''}${req.text}`,
  });

  return {
    result: response.text || '',
    modelUsed: modelName,
  };
}
