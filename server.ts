import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, FunctionDeclaration, Modality } from '@google/genai';
import dotenv from 'dotenv';
import { securityKeyManager } from './securityKeyManager.js';
import { FREE_AI_MODELS_SERVER, executeMultiModelRequest } from './serverModelHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Lazy/safe initialization of GoogleGenAI SDK with Security Key Manager resolution
function getGenAI(req?: express.Request) {
  const apiKey = securityKeyManager.getApiKey(req);
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-secure',
      },
    },
  });
}

// Function Declarations for Agent Tools
const createTaskDeclaration: FunctionDeclaration = {
  name: 'create_task',
  description: 'Create a new task on the user\'s personal action board.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Short summary or title of the task' },
      description: { type: Type.STRING, description: 'Optional details or checklist' },
      priority: { type: Type.STRING, description: 'Priority level: high, medium, or low' },
      dueDate: { type: Type.STRING, description: 'Optional due date string (e.g. "Today", "Tomorrow", "2026-08-10")' }
    },
    required: ['title']
  }
};

const saveNoteDeclaration: FunctionDeclaration = {
  name: 'save_note',
  description: 'Save a structured note or snippet into the user\'s Knowledge Base memory.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Title of the knowledge note' },
      content: { type: Type.STRING, description: 'Detailed note content or markdown documentation' },
      category: { type: Type.STRING, description: 'Category e.g. Work, Research, Code, Ideas, Life' }
    },
    required: ['title', 'content']
  }
};

const generateImageDeclaration: FunctionDeclaration = {
  name: 'generate_image',
  description: 'Generate a visual graphic, illustration, diagram, or concept image using AI.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING, description: 'Detailed image description for the generation model' }
    },
    required: ['prompt']
  }
};

const saveMemoryDeclaration: FunctionDeclaration = {
  name: 'save_user_memory',
  description: 'Automatically remember or save an important user fact, preference, goal, or instruction into long-term AI memory.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      key: { type: Type.STRING, description: 'Short memory topic or key, e.g. "Favorite Programming Language", "Target Exam", "Coding Style"' },
      value: { type: Type.STRING, description: 'Detailed memory value to store' },
      category: { type: Type.STRING, description: 'Category: preference, fact, instruction, or general' }
    },
    required: ['key', 'value']
  }
};

// API Route: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Security Management Routes
app.get('/api/security/status', (req, res) => {
  try {
    const status = securityKeyManager.getSecurityStatus(req);
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve security status' });
  }
});

app.post('/api/security/validate', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const result = await securityKeyManager.validateApiKey(apiKey);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ valid: false, message: err.message || 'Validation error' });
  }
});

app.post('/api/security/update-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ success: false, message: 'apiKey parameter is required' });
    }
    const result = await securityKeyManager.storeCustomKey(apiKey);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update key' });
  }
});

app.post('/api/security/reset-key', (req, res) => {
  try {
    const result = securityKeyManager.resetCustomKey();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to reset key' });
  }
});

// API Route: Available Free AI Models
app.get('/api/models', (req, res) => {
  try {
    const secStatus = securityKeyManager.getSecurityStatus(req);
    res.json({
      models: FREE_AI_MODELS_SERVER,
      defaultModel: 'gemini-3.5-flash',
      geminiConfigured: secStatus.configured,
      openRouterConfigured: secStatus.openRouterConfigured,
      autoFallbackAvailable: true
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list models' });
  }
});

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Route: Chat with AI Agent
app.post('/api/chat', async (req, res) => {
  try {
    const ai = getGenAI(req);
    const { messages, persona, settings, tasks, notes, attachedImage } = req.body;

    const currentPersona = persona || {
      name: 'Alpha AI',
      title: 'Next-Gen Intelligent AI Assistant',
      systemPrompt: 'You are Alpha AI, a next-generation intelligent AI assistant.'
    };

    // System prompt construction
    let fullSystemPrompt = `${currentPersona.systemPrompt}\n\n`;

    if (settings?.userCustomInstructions) {
      fullSystemPrompt += `User Instructions:\n${settings.userCustomInstructions}\n\n`;
    }

    fullSystemPrompt += `Current Date/Time: ${new Date().toLocaleString()}\n`;

    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      const activeTasks = tasks.filter((t: any) => t.status !== 'completed').slice(0, 5);
      fullSystemPrompt += `\nUser's Active Tasks (${activeTasks.length}):\n` + 
        activeTasks.map((t: any) => `- [${t.priority.toUpperCase()}] ${t.title} (Status: ${t.status})`).join('\n') + '\n';
    }

    if (notes && Array.isArray(notes) && notes.length > 0) {
      const recentNotes = notes.slice(0, 3);
      fullSystemPrompt += `\nUser's Recent Knowledge Notes (${recentNotes.length}):\n` + 
        recentNotes.map((n: any) => `- ${n.title} (${n.category})`).join('\n') + '\n';
    }

    fullSystemPrompt += `\nTools & Capabilities:
- You can create tasks using create_task tool whenever the user asks to remind them or create a task.
- You can save structured notes using save_note tool when valuable ideas/summaries are discussed.
- You can generate images using generate_image tool when visual concepts are requested.
When using tools, also summarize what action was taken in friendly text.`;

    // Prepare contents
    const contents: any[] = [];

    // History
    if (Array.isArray(messages) && messages.length > 0) {
      const history = messages.slice(-10); // last 10 messages for context
      for (const msg of history) {
        if (msg.role === 'user') {
          contents.push({
            role: 'user',
            parts: [{ text: msg.content }]
          });
        } else if (msg.role === 'assistant') {
          contents.push({
            role: 'model',
            parts: [{ text: msg.content }]
          });
        }
      }
    }

    // Attached image if present in last prompt
    if (attachedImage) {
      const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1].content : 'Analyze this image';
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents.pop(); // remove standard text user item
      }
      contents.push({
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: attachedImage.replace(/^data:image\/\w+;base64,/, '')
            }
          },
          { text: lastUserMsg || 'Analyze this image' }
        ]
      });
    }

    const primaryTools: any[] = [
      { functionDeclarations: [createTaskDeclaration, saveNoteDeclaration, generateImageDeclaration, saveMemoryDeclaration] }
    ];
    if (settings?.enableSearch !== false) {
      primaryTools.push({ googleSearch: {} });
    }

    let responseResult: any = null;
    try {
      responseResult = await executeMultiModelRequest(
        ai,
        contents,
        fullSystemPrompt,
        settings,
        primaryTools,
        req
      );
    } catch (apiErr: any) {
      console.error('All Multi-Model AI attempts failed:', apiErr);
      return res.json({
        text: '⚠️ **All Free AI Models Busy / Rate Limited**: Free tier quota limits reach ho gayi hain. Kripya 30-60 seconds baad retry karein ya custom API key configure karein.',
        groundingSources: [],
        toolExecutions: [],
        generatedImageUrl: undefined,
        modelUsed: settings?.selectedModel || 'gemini-3.6-flash',
        wasFallback: true
      });
    }

    res.json({
      text: responseResult.text || 'Processing completed.',
      groundingSources: responseResult.groundingSources || [],
      toolExecutions: responseResult.toolExecutions || [],
      generatedImageUrl: responseResult.generatedImageUrl,
      modelUsed: responseResult.modelUsed,
      wasFallback: responseResult.wasFallback
    });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    res.json({
      text: '⚠️ **Service Busy**: Kripya ek baar retry karein.',
      groundingSources: [],
      toolExecutions: []
    });
  }
});

// API Route: Gemini Intelligence (Analyze, Edit, Summarize, Code Reasoning)
app.post('/api/analyze', async (req, res) => {
  try {
    const ai = getGenAI(req);
    const { taskType, text, context } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text content is required for analysis' });
    }

    let selectedModel = 'gemini-3.6-flash';
    let systemInstruction = 'You are Alpha AI Intelligence Engine.';

    if (taskType === 'complex_reasoning' || taskType === 'code_analysis') {
      selectedModel = 'gemini-3.1-pro-preview';
      systemInstruction = 'You are a Senior AI Code & Systems Analyst. Analyze the input thoroughly, identify edge cases, performance bottlenecks, bugs, and provide refactored, optimized code with detailed explanations.';
    } else if (taskType === 'summarize' || taskType === 'general_task') {
      selectedModel = 'gemini-3.5-flash';
      systemInstruction = 'You are a versatile AI assistant and executive summarizer. Provide key takeaways, action items, and a structured response.';
    } else if (taskType === 'fast_edit' || taskType === 'auto_category') {
      selectedModel = 'gemini-3.1-flash-lite';
      systemInstruction = 'You are a rapid text editor. Fix grammar, improve flow, categorize input, and return clean polished text instantly.';
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: context ? `Context: ${context}\n\nInput Content:\n${text}` : text,
      config: { systemInstruction }
    });

    res.json({
      result: response.text || '',
      modelUsed: selectedModel
    });
  } catch (err: any) {
    console.error('Analyze API Error:', err);
    try {
      const ai = getGenAI(req);
      const fallbackRes = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: req.body.text || '',
      });
      res.json({ result: fallbackRes.text || '', modelUsed: 'gemini-3.6-flash' });
    } catch (fbErr: any) {
      res.status(500).json({ error: err.message || 'Analysis failed' });
    }
  }
});

// API Route: Direct Image Generation
app.post('/api/generate-image', async (req, res) => {
  try {
    const ai = getGenAI(req);
    const { prompt, aspectRatio } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: aspectRatio || '1:1' }
      }
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'No image data returned from model' });
    }

    res.json({ imageUrl });
  } catch (err: any) {
    console.error('Generate Image Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate image' });
  }
});

// API Route: Text-To-Speech (TTS)
app.post('/api/tts', async (req, res) => {
  try {
    const ai = getGenAI(req);
    const { text, voiceName } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: text.slice(0, 500) }] }], // limit length for fast response
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio generated' });
    }

    res.json({ audioData: `data:audio/wav;base64,${base64Audio}` });
  } catch (err: any) {
    console.error('TTS Error:', err);
    res.status(500).json({ error: err.message || 'TTS generation failed' });
  }
});

// Start Server & Vite Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Personal AI Agent Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
