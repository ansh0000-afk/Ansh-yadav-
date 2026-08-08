import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

export interface SecurityStatus {
  configured: boolean;
  activeSource: 'request_header' | 'encrypted_vault' | 'environment_variable' | 'missing';
  maskedKey: string;
  storageMechanism: string;
  encryptionActive: boolean;
  vaultHasCustomKey: boolean;
  envHasKey: boolean;
  openRouterConfigured: boolean;
  maskedOpenRouterKey?: string;
  lastValidated?: string;
  keyFingerprint?: string;
}

class SecurityKeyManager {
  private vaultPath: string;
  private memoryVaultKey: string | null = null;
  private memoryOpenRouterKey: string | null = null;
  private lastValidatedTimestamp: string | null = null;
  // Dynamic AES-256 secret derived from server machine/instance environment
  private masterSecret: string;

  constructor() {
    this.vaultPath = path.join(process.cwd(), '.secure_vault.dat');
    // Internal encryption salt/secret
    this.masterSecret = process.env.VAULT_MASTER_SECRET || 
      crypto.createHash('sha256').update(process.cwd() + (process.env.APP_URL || 'alpha-ai-secure-salt')).digest('hex');
    this.loadVaultFromFile();
  }

  /**
   * Helper to securely mask API key for public display/logs
   */
  public maskKey(key?: string): string {
    if (!key || key.length < 8) return 'Not Configured';
    const prefix = key.substring(0, 6);
    const suffix = key.substring(key.length - 4);
    return `${prefix}...${suffix}`;
  }

  /**
   * Helper to generate a non-reversible SHA-256 key fingerprint
   */
  public getKeyFingerprint(key?: string): string {
    if (!key) return 'none';
    return crypto.createHash('sha256').update(key).digest('hex').substring(0, 12);
  }

  /**
   * Encrypts plaintext using AES-256-GCM
   */
  private encrypt(text: string): { iv: string; encryptedData: string; tag: string } {
    const iv = crypto.randomBytes(12);
    const key = crypto.pbkdf2Sync(this.masterSecret, 'alpha_vault_salt_2026', 100000, 32, 'sha256');
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      tag
    };
  }

  /**
   * Decrypts ciphertext using AES-256-GCM
   */
  private decrypt(ivHex: string, encryptedData: string, tagHex: string): string | null {
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const key = crypto.pbkdf2Sync(this.masterSecret, 'alpha_vault_salt_2026', 100000, 32, 'sha256');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      console.error('Failed to decrypt vault content:', err);
      return null;
    }
  }

  /**
   * Loads vault content from encrypted file
   */
  private loadVaultFromFile(): void {
    try {
      if (fs.existsSync(this.vaultPath)) {
        const raw = fs.readFileSync(this.vaultPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.iv && parsed.encryptedData && parsed.tag) {
          const decryptedKey = this.decrypt(parsed.iv, parsed.encryptedData, parsed.tag);
          if (decryptedKey) {
            this.memoryVaultKey = decryptedKey;
            this.lastValidatedTimestamp = parsed.lastValidated || new Date().toISOString();
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
      console.warn('Vault load warning:', err);
    }
  }

  /**
   * Saves vault keys to encrypted file
   */
  private saveVaultToFile(apiKey: string, openRouterKey?: string): void {
    try {
      const payload = this.encrypt(apiKey);
      let orPayload: any = {};
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
        createdAt: new Date().toISOString(),
        lastValidated: new Date().toISOString()
      };
      fs.writeFileSync(this.vaultPath, JSON.stringify(dataToSave, null, 2), { mode: 0o600 });
      this.memoryVaultKey = apiKey;
      if (openRouterKey) this.memoryOpenRouterKey = openRouterKey;
      this.lastValidatedTimestamp = dataToSave.lastValidated;
    } catch (err) {
      console.error('Failed to save vault file:', err);
      this.memoryVaultKey = apiKey;
      if (openRouterKey) this.memoryOpenRouterKey = openRouterKey;
    }
  }

  /**
   * Resolve active Gemini API Key
   */
  public getApiKey(req?: any): string {
    if (req && req.headers) {
      const headerKey = req.headers['x-gemini-api-key'] || req.headers['x-api-key'];
      if (typeof headerKey === 'string' && headerKey.trim().length > 10) {
        return headerKey.trim();
      }
      const authHeader = req.headers['authorization'];
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer AIza')) {
        return authHeader.substring(7).trim();
      }
    }

    if (this.memoryVaultKey && this.memoryVaultKey.trim().length > 10) {
      return this.memoryVaultKey.trim();
    }

    const envKey = process.env.GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 10 && envKey !== 'your_gemini_api_key_here') {
      return envKey.trim();
    }

    if (envKey && envKey.length > 0) {
      return envKey.trim();
    }

    throw new Error('GEMINI_API_KEY is not configured in server environment or secure key vault.');
  }

  /**
   * Resolve OpenRouter API Key (Optional for OpenRouter free models)
   */
  public getOpenRouterKey(req?: any): string | null {
    if (req && req.headers) {
      const headerKey = req.headers['x-openrouter-api-key'];
      if (typeof headerKey === 'string' && headerKey.trim().length > 10) {
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
  public getActiveSource(req?: any): 'request_header' | 'encrypted_vault' | 'environment_variable' | 'missing' {
    if (req && req.headers && (req.headers['x-gemini-api-key'] || req.headers['x-api-key'])) {
      return 'request_header';
    }
    if (this.memoryVaultKey && this.memoryVaultKey.trim().length > 10) {
      return 'encrypted_vault';
    }
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 10 && envKey !== 'your_gemini_api_key_here') {
      return 'environment_variable';
    }
    return 'missing';
  }

  /**
   * Get complete security status object
   */
  public getSecurityStatus(req?: any): SecurityStatus {
    const activeSource = this.getActiveSource(req);
    let activeKey: string | undefined;

    try {
      activeKey = this.getApiKey(req);
    } catch {
      activeKey = undefined;
    }

    const envKey = process.env.GEMINI_API_KEY;
    const envHasKey = !!(envKey && envKey.trim().length > 10 && envKey !== 'your_gemini_api_key_here');
    const openRouterKey = this.getOpenRouterKey(req);

    return {
      configured: !!activeKey,
      activeSource,
      maskedKey: this.maskKey(activeKey),
      storageMechanism: 'AES-256-GCM Encrypted Storage Vault (Server-Side)',
      encryptionActive: true,
      vaultHasCustomKey: !!this.memoryVaultKey,
      envHasKey,
      openRouterConfigured: !!openRouterKey,
      maskedOpenRouterKey: this.maskKey(openRouterKey || undefined),
      lastValidated: this.lastValidatedTimestamp || new Date().toISOString(),
      keyFingerprint: this.getKeyFingerprint(activeKey)
    };
  }

  /**
   * Validate an API key against Google Gemini API
   */
  public async validateApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    if (!apiKey || apiKey.trim().length < 10) {
      return { valid: false, message: 'Invalid key length or empty key provided.' };
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: { headers: { 'User-Agent': 'aistudio-security-check' } }
      });

      await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: 'ping'
      });

      return { valid: true, message: 'API key successfully validated with Google Gemini API!' };
    } catch (err: any) {
      const msg = err?.message || String(err);
      return { valid: false, message: `Key validation failed: ${msg}` };
    }
  }

  /**
   * Store a custom key into secure vault
   */
  public async storeCustomKey(apiKey: string, openRouterKey?: string): Promise<{ success: boolean; message: string; status: SecurityStatus }> {
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
      message: 'API Keys encrypted with AES-256-GCM and saved to secure server vault!',
      status: this.getSecurityStatus()
    };
  }

  /**
   * Reset/clear custom vault key
   */
  public resetCustomKey(): { success: boolean; message: string; status: SecurityStatus } {
    this.memoryVaultKey = null;
    this.memoryOpenRouterKey = null;
    this.lastValidatedTimestamp = null;
    try {
      if (fs.existsSync(this.vaultPath)) {
        fs.unlinkSync(this.vaultPath);
      }
    } catch (err) {
      console.warn('Unlink vault file warning:', err);
    }

    return {
      success: true,
      message: 'Custom vault keys removed. System fell back to environment defaults.',
      status: this.getSecurityStatus()
    };
  }
}

export const securityKeyManager = new SecurityKeyManager();
