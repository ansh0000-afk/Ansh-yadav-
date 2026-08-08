import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API Key not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // नए SDK के लिए सही मॉडल नाम फॉर्मेट
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: messages && messages.length > 0 
        ? messages.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content || msg.text || '' }]
          }))
        : [{ role: 'user', parts: [{ text: "Hello" }] }]
    });

    const reply = response.text || 'No response generated.';
    return res.status(200).json({ reply });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
