import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // सिर्फ POST रिक्वेस्ट की अनुमति दें
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, history } = req.body;

    // Vercel Environment Variables से API Key लें
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API Key not configured on server' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // मॉडल को कॉल करें (आप अपनी ज़रूरत के अनुसार मॉडल का नाम बदल सकते हैं)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
    });

    const reply = response.text || 'No response generated.';
    return res.status(200).json({ reply });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

