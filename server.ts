import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '' 
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, prompt } = req.body;
    const userPrompt = message || prompt || '';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
    });

    res.json({ result: response.text, text: response.text });
  } catch (error: any) {
    console.error("Server API Error:", error);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
