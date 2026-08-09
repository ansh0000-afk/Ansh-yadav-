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
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric'
  });
}

export async function copyConversationToClipboard(messages: any[]): Promise<boolean> {
  try {
    const text = messages.map(m => `${m.role || 'User'}: ${m.text || m.content}`).join('\n\n');
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Copy failed:", err);
    return false;
  }
}

export async function shareChatSession(title: string, messages: any[]): Promise<boolean> {
  try {
    const text = messages.map(m => `${m.role || 'User'}: ${m.text || m.content}`).join('\n\n');
    if (navigator.share) {
      await navigator.share({ title, text });
      return true;
    }
    return await copyConversationToClipboard(messages);
  } catch (err) {
    console.error("Share failed:", err);
    return false;
  }
}
