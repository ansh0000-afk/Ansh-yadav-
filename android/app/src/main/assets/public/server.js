// server.ts
import express from "express";
import path2 from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI as GoogleGenAI2, Type, Modality } from "@google/genai";
import dotenv from "dotenv";

// securityKeyManager.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
var SecurityKeyManager = class {
  constructor() {
    this.memoryVaultKey = null;
    this.lastValidatedTimestamp = null;
    this.vaultPath = path.join(process.cwd(), ".secure_vault.dat");
    this.masterSecret = process.env.VAULT_MASTER_SECRET || crypto.createHash("sha256").update(process.cwd() + (process.env.APP_URL || "alpha-ai-secure-salt")).digest("hex");
    this.loadVaultFromFile();
  }
  /**
   * Helper to securely mask API key for public display/logs
   */
  maskKey(key) {
    if (!key || key.length < 8) return "Not Configured";
    const prefix = key.substring(0, 6);
    const suffix = key.substring(key.length - 4);
    return `${prefix}...${suffix}`;
  }
  /**
   * Helper to generate a non-reversible SHA-256 key fingerprint
   */
  getKeyFingerprint(key) {
    if (!key) return "none";
    return crypto.createHash("sha256").update(key).digest("hex").substring(0, 12);
  }
  /**
   * Encrypts plaintext using AES-256-GCM
   */
  encrypt(text) {
    const iv = crypto.randomBytes(12);
    const key = crypto.pbkdf2Sync(this.masterSecret, "alpha_vault_salt_2026", 1e5, 32, "sha256");
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");
    return {
      iv: iv.toString("hex"),
      encryptedData: encrypted,
      tag
    };
  }
  /**
   * Decrypts ciphertext using AES-256-GCM
   */
  decrypt(ivHex, encryptedData, tagHex) {
    try {
      const iv = Buffer.from(ivHex, "hex");
      const tag = Buffer.from(tagHex, "hex");
      const key = crypto.pbkdf2Sync(this.masterSecret, "alpha_vault_salt_2026", 1e5, 32, "sha256");
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(tag);
      let decrypted = decipher.update(encryptedData, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (err) {
      console.error("Failed to decrypt vault content:", err);
      return null;
    }
  }
  /**
   * Loads vault content from encrypted file
   */
  loadVaultFromFile() {
    try {
      if (fs.existsSync(this.vaultPath)) {
        const raw = fs.readFileSync(this.vaultPath, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed.iv && parsed.encryptedData && parsed.tag) {
          const decryptedKey = this.decrypt(parsed.iv, parsed.encryptedData, parsed.tag);
          if (decryptedKey) {
            this.memoryVaultKey = decryptedKey;
            this.lastValidatedTimestamp = parsed.lastValidated || (/* @__PURE__ */ new Date()).toISOString();
          }
        }
      }
    } catch (err) {
      console.warn("Vault load warning:", err);
    }
  }
  /**
   * Saves vault key to encrypted file
   */
  saveVaultToFile(apiKey) {
    try {
      const payload = this.encrypt(apiKey);
      const dataToSave = {
        ...payload,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastValidated: (/* @__PURE__ */ new Date()).toISOString()
      };
      fs.writeFileSync(this.vaultPath, JSON.stringify(dataToSave, null, 2), { mode: 384 });
      this.memoryVaultKey = apiKey;
      this.lastValidatedTimestamp = dataToSave.lastValidated;
    } catch (err) {
      console.error("Failed to save vault file:", err);
      this.memoryVaultKey = apiKey;
    }
  }
  /**
   * Resolve active API Key based on multi-tiered precedence:
   * 1. Client Request Header (X-Gemini-API-Key or X-API-Key or Authorization Bearer)
   * 2. AES-256 Encrypted Storage Vault
   * 3. Server Environment Variable (GEMINI_API_KEY)
   */
  getApiKey(req) {
    if (req && req.headers) {
      const headerKey = req.headers["x-gemini-api-key"] || req.headers["x-api-key"];
      if (typeof headerKey === "string" && headerKey.trim().length > 10) {
        return headerKey.trim();
      }
      const authHeader = req.headers["authorization"];
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer AIza")) {
        return authHeader.substring(7).trim();
      }
    }
    if (this.memoryVaultKey && this.memoryVaultKey.trim().length > 10) {
      return this.memoryVaultKey.trim();
    }
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 10 && envKey !== "your_gemini_api_key_here") {
      return envKey.trim();
    }
    if (envKey && envKey.length > 0) {
      return envKey.trim();
    }
    throw new Error("GEMINI_API_KEY is not configured in server environment or secure key vault.");
  }
  /**
   * Get active source label
   */
  getActiveSource(req) {
    if (req && req.headers && (req.headers["x-gemini-api-key"] || req.headers["x-api-key"])) {
      return "request_header";
    }
    if (this.memoryVaultKey && this.memoryVaultKey.trim().length > 10) {
      return "encrypted_vault";
    }
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 10 && envKey !== "your_gemini_api_key_here") {
      return "environment_variable";
    }
    return "missing";
  }
  /**
   * Get complete security status object
   */
  getSecurityStatus(req) {
    const activeSource = this.getActiveSource(req);
    let activeKey;
    try {
      activeKey = this.getApiKey(req);
    } catch {
      activeKey = void 0;
    }
    const envKey = process.env.GEMINI_API_KEY;
    const envHasKey = !!(envKey && envKey.trim().length > 10 && envKey !== "your_gemini_api_key_here");
    return {
      configured: !!activeKey,
      activeSource,
      maskedKey: this.maskKey(activeKey),
      storageMechanism: "AES-256-GCM Encrypted Storage Vault (Server-Side)",
      encryptionActive: true,
      vaultHasCustomKey: !!this.memoryVaultKey,
      envHasKey,
      lastValidated: this.lastValidatedTimestamp || (/* @__PURE__ */ new Date()).toISOString(),
      keyFingerprint: this.getKeyFingerprint(activeKey)
    };
  }
  /**
   * Validate an API key against Google Gemini API
   */
  async validateApiKey(apiKey) {
    if (!apiKey || apiKey.trim().length < 10) {
      return { valid: false, message: "Invalid key length or empty key provided." };
    }
    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: { headers: { "User-Agent": "aistudio-security-check" } }
      });
      await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: "ping"
      });
      return { valid: true, message: "API key successfully validated with Google Gemini API!" };
    } catch (err) {
      const msg = err?.message || String(err);
      return { valid: false, message: `Key validation failed: ${msg}` };
    }
  }
  /**
   * Store a custom key into secure vault
   */
  async storeCustomKey(apiKey) {
    const validation = await this.validateApiKey(apiKey);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
        status: this.getSecurityStatus()
      };
    }
    this.saveVaultToFile(apiKey.trim());
    return {
      success: true,
      message: "API Key encrypted with AES-256-GCM and saved to secure server vault!",
      status: this.getSecurityStatus()
    };
  }
  /**
   * Reset/clear custom vault key
   */
  resetCustomKey() {
    this.memoryVaultKey = null;
    this.lastValidatedTimestamp = null;
    try {
      if (fs.existsSync(this.vaultPath)) {
        fs.unlinkSync(this.vaultPath);
      }
    } catch (err) {
      console.warn("Unlink vault file warning:", err);
    }
    return {
      success: true,
      message: "Custom vault key removed. System fell back to environment key default.",
      status: this.getSecurityStatus()
    };
  }
};
var securityKeyManager = new SecurityKeyManager();

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var PORT = 3e3;
app.use(express.json({ limit: "20mb" }));
function getGenAI(req) {
  const apiKey = securityKeyManager.getApiKey(req);
  return new GoogleGenAI2({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build-secure"
      }
    }
  });
}
var createTaskDeclaration = {
  name: "create_task",
  description: "Create a new task on the user's personal action board.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Short summary or title of the task" },
      description: { type: Type.STRING, description: "Optional details or checklist" },
      priority: { type: Type.STRING, description: "Priority level: high, medium, or low" },
      dueDate: { type: Type.STRING, description: 'Optional due date string (e.g. "Today", "Tomorrow", "2026-08-10")' }
    },
    required: ["title"]
  }
};
var saveNoteDeclaration = {
  name: "save_note",
  description: "Save a structured note or snippet into the user's Knowledge Base memory.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the knowledge note" },
      content: { type: Type.STRING, description: "Detailed note content or markdown documentation" },
      category: { type: Type.STRING, description: "Category e.g. Work, Research, Code, Ideas, Life" }
    },
    required: ["title", "content"]
  }
};
var generateImageDeclaration = {
  name: "generate_image",
  description: "Generate a visual graphic, illustration, diagram, or concept image using AI.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING, description: "Detailed image description for the generation model" }
    },
    required: ["prompt"]
  }
};
var saveMemoryDeclaration = {
  name: "save_user_memory",
  description: "Automatically remember or save an important user fact, preference, goal, or instruction into long-term AI memory.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      key: { type: Type.STRING, description: 'Short memory topic or key, e.g. "Favorite Programming Language", "Target Exam", "Coding Style"' },
      value: { type: Type.STRING, description: "Detailed memory value to store" },
      category: { type: Type.STRING, description: "Category: preference, fact, instruction, or general" }
    },
    required: ["key", "value"]
  }
};
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/security/status", (req, res) => {
  try {
    const status = securityKeyManager.getSecurityStatus(req);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to retrieve security status" });
  }
});
app.post("/api/security/validate", async (req, res) => {
  try {
    const { apiKey } = req.body;
    const result = await securityKeyManager.validateApiKey(apiKey);
    res.json(result);
  } catch (err) {
    res.status(500).json({ valid: false, message: err.message || "Validation error" });
  }
});
app.post("/api/security/update-key", async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ success: false, message: "apiKey parameter is required" });
    }
    const result = await securityKeyManager.storeCustomKey(apiKey);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to update key" });
  }
});
app.post("/api/security/reset-key", (req, res) => {
  try {
    const result = securityKeyManager.resetCustomKey();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to reset key" });
  }
});
var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function callGeminiWithFallback(ai, primaryContents, fullSystemPrompt, settings) {
  const primaryTools = [
    { functionDeclarations: [createTaskDeclaration, saveNoteDeclaration, generateImageDeclaration, saveMemoryDeclaration] }
  ];
  if (settings?.enableSearch !== false) {
    primaryTools.push({ googleSearch: {} });
  }
  const requestedModel = settings?.aiModel || "gemini-3.6-flash";
  const attempts = [
    { model: requestedModel, tools: primaryTools, useSearchConfig: settings?.enableSearch !== false, delayBefore: 0 },
    { model: "gemini-3.6-flash", tools: primaryTools, useSearchConfig: settings?.enableSearch !== false, delayBefore: requestedModel === "gemini-3.6-flash" ? 1e3 : 0 },
    { model: "gemini-3.6-flash", tools: [{ functionDeclarations: [createTaskDeclaration, saveNoteDeclaration, generateImageDeclaration, saveMemoryDeclaration] }], useSearchConfig: false, delayBefore: 1e3 },
    { model: "gemini-2.5-flash", tools: [{ functionDeclarations: [createTaskDeclaration, saveNoteDeclaration, generateImageDeclaration, saveMemoryDeclaration] }], useSearchConfig: false, delayBefore: 1200 },
    { model: "gemini-3.1-flash-lite", tools: [], useSearchConfig: false, delayBefore: 1500 }
  ];
  let lastError = null;
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    if (attempt.delayBefore > 0) {
      await delay(attempt.delayBefore);
    }
    try {
      const config = {
        systemInstruction: fullSystemPrompt
      };
      if (settings?.temperature !== void 0) {
        config.temperature = settings.temperature;
      }
      if (settings?.maxTokens !== void 0) {
        config.maxOutputTokens = settings.maxTokens;
      }
      if (attempt.tools && attempt.tools.length > 0) {
        config.tools = attempt.tools;
      }
      if (attempt.useSearchConfig) {
        config.toolConfig = { includeServerSideToolInvocations: true };
      }
      const response = await ai.models.generateContent({
        model: attempt.model,
        contents: primaryContents,
        config
      });
      return response;
    } catch (err) {
      lastError = err;
      console.warn(`Gemini API attempt ${i + 1} (${attempt.model}) failed:`, err?.message || err);
    }
  }
  throw lastError;
}
app.post("/api/chat", async (req, res) => {
  try {
    const ai = getGenAI(req);
    const { messages, persona, settings, tasks, notes, attachedImage } = req.body;
    const currentPersona = persona || {
      name: "Alpha AI",
      title: "Next-Gen Intelligent AI Assistant",
      systemPrompt: "You are Alpha AI, a next-generation intelligent AI assistant."
    };
    let fullSystemPrompt = `${currentPersona.systemPrompt}

`;
    if (settings?.userCustomInstructions) {
      fullSystemPrompt += `User Instructions:
${settings.userCustomInstructions}

`;
    }
    fullSystemPrompt += `Current Date/Time: ${(/* @__PURE__ */ new Date()).toLocaleString()}
`;
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      const activeTasks = tasks.filter((t) => t.status !== "completed").slice(0, 5);
      fullSystemPrompt += `
User's Active Tasks (${activeTasks.length}):
` + activeTasks.map((t) => `- [${t.priority.toUpperCase()}] ${t.title} (Status: ${t.status})`).join("\n") + "\n";
    }
    if (notes && Array.isArray(notes) && notes.length > 0) {
      const recentNotes = notes.slice(0, 3);
      fullSystemPrompt += `
User's Recent Knowledge Notes (${recentNotes.length}):
` + recentNotes.map((n) => `- ${n.title} (${n.category})`).join("\n") + "\n";
    }
    fullSystemPrompt += `
Tools & Capabilities:
- You can create tasks using create_task tool whenever the user asks to remind them or create a task.
- You can save structured notes using save_note tool when valuable ideas/summaries are discussed.
- You can generate images using generate_image tool when visual concepts are requested.
When using tools, also summarize what action was taken in friendly text.`;
    const contents = [];
    if (Array.isArray(messages) && messages.length > 0) {
      const history = messages.slice(-10);
      for (const msg of history) {
        if (msg.role === "user") {
          contents.push({
            role: "user",
            parts: [{ text: msg.content }]
          });
        } else if (msg.role === "assistant") {
          contents.push({
            role: "model",
            parts: [{ text: msg.content }]
          });
        }
      }
    }
    if (attachedImage) {
      const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1].content : "Analyze this image";
      if (contents.length > 0 && contents[contents.length - 1].role === "user") {
        contents.pop();
      }
      contents.push({
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: attachedImage.replace(/^data:image\/\w+;base64,/, "")
            }
          },
          { text: lastUserMsg || "Analyze this image" }
        ]
      });
    }
    let response = null;
    try {
      response = await callGeminiWithFallback(ai, contents, fullSystemPrompt, settings);
    } catch (apiErr) {
      console.error("All Gemini API attempts failed:", apiErr);
      return res.json({
        text: "\u26A0\uFE0F **API Rate Limit / Quota Reached**: Gemini API quota limit exceed ho gayi hai. Kripya 30-60 seconds baad wapas retry karein.",
        groundingSources: [],
        toolExecutions: [],
        generatedImageUrl: void 0
      });
    }
    const textOutput = response.text || "";
    const functionCalls = response.functionCalls || [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingSources = groundingChunks ? groundingChunks.map((chunk) => {
      if (chunk.web) {
        return { title: chunk.web.title || "Web Source", url: chunk.web.uri };
      }
      return null;
    }).filter(Boolean) : [];
    const toolExecutions = [];
    let generatedImageUrl = void 0;
    if (functionCalls && functionCalls.length > 0) {
      for (const fc of functionCalls) {
        toolExecutions.push({
          name: fc.name,
          args: fc.args
        });
        if (fc.name === "generate_image" && fc.args?.prompt) {
          try {
            const imgRes = await ai.models.generateContent({
              model: "gemini-3.1-flash-lite-image",
              contents: { parts: [{ text: fc.args.prompt }] },
              config: {
                imageConfig: { aspectRatio: "1:1" }
              }
            });
            for (const part of imgRes.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData) {
                generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
              }
            }
          } catch (imgErr) {
            console.error("Error generating image tool:", imgErr);
          }
        }
      }
    }
    res.json({
      text: textOutput || "Processing completed.",
      groundingSources,
      toolExecutions,
      generatedImageUrl
    });
  } catch (err) {
    console.error("Chat API Error:", err);
    res.json({
      text: "\u26A0\uFE0F **Service Busy**: Kripya ek baar retry karein.",
      groundingSources: [],
      toolExecutions: []
    });
  }
});
app.post("/api/analyze", async (req, res) => {
  try {
    const ai = getGenAI(req);
    const { taskType, text, context } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text content is required for analysis" });
    }
    let selectedModel = "gemini-3.6-flash";
    let systemInstruction = "You are Alpha AI Intelligence Engine.";
    if (taskType === "complex_reasoning" || taskType === "code_analysis") {
      selectedModel = "gemini-3.1-pro-preview";
      systemInstruction = "You are a Senior AI Code & Systems Analyst. Analyze the input thoroughly, identify edge cases, performance bottlenecks, bugs, and provide refactored, optimized code with detailed explanations.";
    } else if (taskType === "summarize") {
      selectedModel = "gemini-3.6-flash";
      systemInstruction = "You are a concise executive summarizer. Provide key takeaways, action items, and a structured summary.";
    } else if (taskType === "fast_edit") {
      selectedModel = "gemini-3.1-flash-lite";
      systemInstruction = "You are a rapid text editor. Fix grammar, improve flow, and return clean polished text quickly.";
    } else if (taskType === "auto_category") {
      selectedModel = "gemini-3.1-flash-lite";
      systemInstruction = "Categorize the text into one of: Work, Study, Ideas, Research, Personal, Coding, Life. Output ONLY the single category name.";
    }
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: context ? `Context: ${context}

Input Content:
${text}` : text,
      config: { systemInstruction }
    });
    res.json({
      result: response.text || "",
      modelUsed: selectedModel
    });
  } catch (err) {
    console.error("Analyze API Error:", err);
    try {
      const ai = getGenAI(req);
      const fallbackRes = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: req.body.text || ""
      });
      res.json({ result: fallbackRes.text || "", modelUsed: "gemini-3.6-flash" });
    } catch (fbErr) {
      res.status(500).json({ error: err.message || "Analysis failed" });
    }
  }
});
app.post("/api/generate-image", async (req, res) => {
  try {
    const ai = getGenAI(req);
    const { prompt, aspectRatio } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: aspectRatio || "1:1" }
      }
    });
    let imageUrl = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
    if (!imageUrl) {
      return res.status(500).json({ error: "No image data returned from model" });
    }
    res.json({ imageUrl });
  } catch (err) {
    console.error("Generate Image Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate image" });
  }
});
app.post("/api/tts", async (req, res) => {
  try {
    const ai = getGenAI(req);
    const { text, voiceName } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: text.slice(0, 500) }] }],
      // limit length for fast response
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || "Kore" }
          }
        }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: "No audio generated" });
    }
    res.json({ audioData: `data:audio/wav;base64,${base64Audio}` });
  } catch (err) {
    console.error("TTS Error:", err);
    res.status(500).json({ error: err.message || "TTS generation failed" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Personal AI Agent Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.js.map
