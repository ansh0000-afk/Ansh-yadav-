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
    this.memoryOpenRouterKey = null;
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
        if (parsed.orIv && parsed.orEncryptedData && parsed.orTag) {
          const decryptedOrKey = this.decrypt(parsed.orIv, parsed.orEncryptedData, parsed.orTag);
          if (decryptedOrKey) {
            this.memoryOpenRouterKey = decryptedOrKey;
          }
        }
      }
    } catch (err) {
      console.warn("Vault load warning:", err);
    }
  }
  /**
   * Saves vault keys to encrypted file
   */
  saveVaultToFile(apiKey, openRouterKey) {
    try {
      const payload = this.encrypt(apiKey);
      let orPayload = {};
      if (openRouterKey) {
        const encryptedOr = this.encrypt(openRouterKey);
        orPayload = {
          orIv: encryptedOr.iv,
          orEncryptedData: encryptedOr.encryptedData,
          orTag: encryptedOr.tag
        };
      }
      const dataToSave = {
        ...payload,
        ...orPayload,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastValidated: (/* @__PURE__ */ new Date()).toISOString()
      };
      fs.writeFileSync(this.vaultPath, JSON.stringify(dataToSave, null, 2), { mode: 384 });
      this.memoryVaultKey = apiKey;
      if (openRouterKey) this.memoryOpenRouterKey = openRouterKey;
      this.lastValidatedTimestamp = dataToSave.lastValidated;
    } catch (err) {
      console.error("Failed to save vault file:", err);
      this.memoryVaultKey = apiKey;
      if (openRouterKey) this.memoryOpenRouterKey = openRouterKey;
    }
  }
  /**
   * Resolve active Gemini API Key
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
   * Resolve OpenRouter API Key (Optional for OpenRouter free models)
   */
  getOpenRouterKey(req) {
    if (req && req.headers) {
      const headerKey = req.headers["x-openrouter-api-key"];
      if (typeof headerKey === "string" && headerKey.trim().length > 10) {
        return headerKey.trim();
      }
    }
    if (this.memoryOpenRouterKey && this.memoryOpenRouterKey.trim().length > 10) {
      return this.memoryOpenRouterKey.trim();
    }
    const envKey = process.env.OPENROUTER_API_KEY;
    if (envKey && envKey.trim().length > 10) {
      return envKey.trim();
    }
    return null;
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
    const openRouterKey = this.getOpenRouterKey(req);
    return {
      configured: !!activeKey,
      activeSource,
      maskedKey: this.maskKey(activeKey),
      storageMechanism: "AES-256-GCM Encrypted Storage Vault (Server-Side)",
      encryptionActive: true,
      vaultHasCustomKey: !!this.memoryVaultKey,
      envHasKey,
      openRouterConfigured: !!openRouterKey,
      maskedOpenRouterKey: this.maskKey(openRouterKey || void 0),
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
  async storeCustomKey(apiKey, openRouterKey) {
    const validation = await this.validateApiKey(apiKey);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
        status: this.getSecurityStatus()
      };
    }
    this.saveVaultToFile(apiKey.trim(), openRouterKey?.trim());
    return {
      success: true,
      message: "API Keys encrypted with AES-256-GCM and saved to secure server vault!",
      status: this.getSecurityStatus()
    };
  }
  /**
   * Reset/clear custom vault key
   */
  resetCustomKey() {
    this.memoryVaultKey = null;
    this.memoryOpenRouterKey = null;
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
      message: "Custom vault keys removed. System fell back to environment defaults.",
      status: this.getSecurityStatus()
    };
  }
};
var securityKeyManager = new SecurityKeyManager();

// serverModelHandler.ts
var FREE_AI_MODELS_SERVER = [
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    provider: "google",
    providerLabel: "Google Gemini",
    description: "Flagship high-speed multimodal model. Best reasoning & search grounding.",
    contextWindow: "1M tokens",
    speed: "Ultra Fast",
    isFree: true,
    badge: "Recommended",
    supportsImage: true
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    providerLabel: "Google Gemini",
    description: "Fast versatile model for reasoning, coding, and structured responses.",
    contextWindow: "1M tokens",
    speed: "Ultra Fast",
    isFree: true,
    supportsImage: true
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "google",
    providerLabel: "Google Gemini",
    description: "Lightweight high-throughput model with minimal latency.",
    contextWindow: "1M tokens",
    speed: "Ultra Fast",
    isFree: true,
    supportsImage: true
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    provider: "google",
    providerLabel: "Google Gemini",
    description: "Ultra-lean Flash variant for instant low-power pings.",
    contextWindow: "1M tokens",
    speed: "Ultra Fast",
    isFree: true
  },
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1 (Free)",
    provider: "openrouter",
    providerLabel: "OpenRouter Free",
    description: "Open-weights reasoning model with chain-of-thought capabilities.",
    contextWindow: "128K tokens",
    speed: "Balanced",
    isFree: true,
    badge: "Reasoning"
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B Instruct (Free)",
    provider: "openrouter",
    providerLabel: "OpenRouter Free",
    description: "Meta flagship open 70B parameter model for complex instruction following.",
    contextWindow: "128K tokens",
    speed: "Fast",
    isFree: true,
    badge: "Open Meta"
  },
  {
    id: "google/gemma-2-9b-it:free",
    name: "Gemma 2 9B IT (Free)",
    provider: "openrouter",
    providerLabel: "OpenRouter Free",
    description: "Google lightweight Gemma 2 open model optimized for general dialogue.",
    contextWindow: "8K tokens",
    speed: "Ultra Fast",
    isFree: true
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct:free",
    name: "Qwen 2.5 Coder 32B (Free)",
    provider: "openrouter",
    providerLabel: "OpenRouter Free",
    description: "Alibaba Qwen 2.5 32B model fine-tuned specifically for code generation.",
    contextWindow: "32K tokens",
    speed: "Fast",
    isFree: true,
    badge: "Coding Specialist"
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B Instruct (Free)",
    provider: "openrouter",
    providerLabel: "OpenRouter Free",
    description: "Mistral AI lightweight 7B model for quick conversational turns.",
    contextWindow: "32K tokens",
    speed: "Ultra Fast",
    isFree: true
  }
];
var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function callOpenRouter(modelId, messages, systemPrompt, settings, req) {
  const userOpenRouterKey = securityKeyManager.getOpenRouterKey(req);
  const openRouterMessages = [];
  if (systemPrompt) {
    openRouterMessages.push({ role: "system", content: systemPrompt });
  }
  for (const msg of messages) {
    if (msg.parts && Array.isArray(msg.parts)) {
      const textPart = msg.parts.map((p) => p.text || "").filter(Boolean).join("\n");
      if (textPart) {
        openRouterMessages.push({
          role: msg.role === "model" ? "assistant" : msg.role || "user",
          content: textPart
        });
      }
    } else if (msg.content) {
      openRouterMessages.push({
        role: msg.role === "assistant" || msg.role === "model" ? "assistant" : msg.role || "user",
        content: msg.content
      });
    }
  }
  const headers = {
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.APP_URL || "https://ai.studio/build",
    "X-Title": "Alpha AI Assistant"
  };
  if (userOpenRouterKey) {
    headers["Authorization"] = `Bearer ${userOpenRouterKey}`;
  } else {
    headers["Authorization"] = `Bearer openrouter-free-tier`;
  }
  const payload = {
    model: modelId,
    messages: openRouterMessages,
    temperature: settings?.temperature ?? 0.7,
    max_tokens: settings?.maxTokens ?? 2048
  };
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${errorText.slice(0, 200)}`);
  }
  const data = await response.json();
  const textOutput = data?.choices?.[0]?.message?.content || "";
  if (!textOutput) {
    throw new Error("OpenRouter returned an empty response.");
  }
  return {
    text: textOutput,
    modelUsed: modelId,
    isFallback: false
  };
}
async function callGemini(ai, modelId, contents, systemPrompt, settings, tools) {
  const config = {
    systemInstruction: systemPrompt
  };
  if (settings?.temperature !== void 0) {
    config.temperature = settings.temperature;
  }
  if (settings?.maxTokens !== void 0) {
    config.maxOutputTokens = settings.maxTokens;
  }
  if (tools && tools.length > 0) {
    config.tools = tools;
  }
  if (settings?.enableSearch !== false) {
    config.toolConfig = { includeServerSideToolInvocations: true };
  }
  const res = await ai.models.generateContent({
    model: modelId,
    contents,
    config
  });
  return {
    text: res.text || "",
    functionCalls: res.functionCalls || [],
    candidates: res.candidates || [],
    modelUsed: modelId
  };
}
async function executeMultiModelRequest(ai, contents, fullSystemPrompt, settings, tools, req) {
  const primaryModel = settings?.selectedModel || settings?.aiModel || "gemini-3.6-flash";
  const autoFallback = settings?.autoFallback !== false;
  let candidates = [];
  if (primaryModel.includes("/") || primaryModel.includes(":free")) {
    candidates = [
      primaryModel,
      "meta-llama/llama-3.3-70b-instruct:free",
      "deepseek/deepseek-r1:free",
      "qwen/qwen-2.5-coder-32b-instruct:free",
      "gemini-3.6-flash",
      "gemini-2.5-flash"
    ];
  } else {
    candidates = [
      primaryModel,
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash-lite",
      "deepseek/deepseek-r1:free",
      "meta-llama/llama-3.3-70b-instruct:free"
    ];
  }
  candidates = Array.from(new Set(candidates));
  if (!autoFallback) {
    candidates = [primaryModel];
  }
  let lastError = null;
  for (let i = 0; i < candidates.length; i++) {
    const candidateModel = candidates[i];
    const isFallbackAttempt = i > 0;
    if (isFallbackAttempt) {
      await delay(800 * i);
    }
    try {
      if (candidateModel.includes("/") || candidateModel.includes(":free")) {
        const result = await callOpenRouter(candidateModel, contents, fullSystemPrompt, settings, req);
        return {
          text: result.text,
          groundingSources: [],
          toolExecutions: [],
          modelUsed: result.modelUsed,
          wasFallback: isFallbackAttempt
        };
      } else {
        const toolsToUse = isFallbackAttempt ? [] : tools;
        const result = await callGemini(ai, candidateModel, contents, fullSystemPrompt, settings, toolsToUse);
        const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const groundingSources = groundingChunks ? groundingChunks.map((chunk) => {
          if (chunk.web) {
            return { title: chunk.web.title || "Web Source", url: chunk.web.uri };
          }
          return null;
        }).filter(Boolean) : [];
        const toolExecutions = [];
        let generatedImageUrl = void 0;
        if (result.functionCalls && result.functionCalls.length > 0) {
          for (const fc of result.functionCalls) {
            toolExecutions.push({
              name: fc.name,
              args: fc.args
            });
            if (fc.name === "generate_image" && fc.args?.prompt) {
              try {
                const imgRes = await ai.models.generateContent({
                  model: "gemini-2.5-flash",
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
                console.error("Error in generate_image tool:", imgErr);
              }
            }
          }
        }
        return {
          text: result.text || "Response received.",
          groundingSources,
          toolExecutions,
          generatedImageUrl,
          modelUsed: result.modelUsed,
          wasFallback: isFallbackAttempt
        };
      }
    } catch (err) {
      lastError = err;
      console.warn(`Model execution attempt ${i + 1} (${candidateModel}) failed:`, err?.message || err);
    }
  }
  throw lastError || new Error("All free AI model attempts failed.");
}

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
app.get("/api/models", (req, res) => {
  try {
    const secStatus = securityKeyManager.getSecurityStatus(req);
    res.json({
      models: FREE_AI_MODELS_SERVER,
      defaultModel: "gemini-3.6-flash",
      geminiConfigured: secStatus.configured,
      openRouterConfigured: secStatus.openRouterConfigured,
      autoFallbackAvailable: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to list models" });
  }
});
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
    const primaryTools = [
      { functionDeclarations: [createTaskDeclaration, saveNoteDeclaration, generateImageDeclaration, saveMemoryDeclaration] }
    ];
    if (settings?.enableSearch !== false) {
      primaryTools.push({ googleSearch: {} });
    }
    let responseResult = null;
    try {
      responseResult = await executeMultiModelRequest(
        ai,
        contents,
        fullSystemPrompt,
        settings,
        primaryTools,
        req
      );
    } catch (apiErr) {
      console.error("All Multi-Model AI attempts failed:", apiErr);
      return res.json({
        text: "\u26A0\uFE0F **All Free AI Models Busy / Rate Limited**: Free tier quota limits reach ho gayi hain. Kripya 30-60 seconds baad retry karein ya custom API key configure karein.",
        groundingSources: [],
        toolExecutions: [],
        generatedImageUrl: void 0,
        modelUsed: settings?.selectedModel || "gemini-3.6-flash",
        wasFallback: true
      });
    }
    res.json({
      text: responseResult.text || "Processing completed.",
      groundingSources: responseResult.groundingSources || [],
      toolExecutions: responseResult.toolExecutions || [],
      generatedImageUrl: responseResult.generatedImageUrl,
      modelUsed: responseResult.modelUsed,
      wasFallback: responseResult.wasFallback
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
