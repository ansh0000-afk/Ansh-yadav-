import { GoogleGenAI } from '@google/genai';

// Direct Gemini API Setup (Vercel backend required nahi hai)
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export async function sendChatMessage(userMessage: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    throw new Error(error?.message || "Failed to process chat request");
  }
}
