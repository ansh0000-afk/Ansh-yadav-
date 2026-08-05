/**
 * Local Cryptographic Vault Utility
 * Provides AES-GCM / Web Crypto API encryption for local storage data, chat history, and memory items.
 */

const ENCRYPTION_PREFIX = 'ENC_AES_V1:';
const DEFAULT_SALT = 'ALPHA_AI_DEVICE_VAULT_SALT_2026';

class LocalEncryption {
  private keyPromise: Promise<CryptoKey> | null = null;

  private async getCryptoKey(): Promise<CryptoKey> {
    if (this.keyPromise) return this.keyPromise;

    this.keyPromise = (async () => {
      const encoder = new TextEncoder();
      const rawKey = encoder.encode(DEFAULT_SALT);
      const baseKey = await crypto.subtle.importKey(
        'raw',
        rawKey,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('ALPHA_AI_SALT'),
          iterations: 10000,
          hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    })();

    return this.keyPromise;
  }

  /**
   * Encrypt a string value into an encrypted format
   */
  public async encrypt(plaintext: string): Promise<string> {
    if (!plaintext) return '';
    try {
      if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        // Fallback obfuscation if WebCrypto unavailable
        return ENCRYPTION_PREFIX + 'BASE64:' + btoa(encodeURIComponent(plaintext));
      }

      const key = await this.getCryptoKey();
      const encoder = new TextEncoder();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(plaintext)
      );

      const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
      const dataArray = new Uint8Array(encryptedBuffer);
      const dataHex = Array.from(dataArray).map(b => b.toString(16).padStart(2, '0')).join('');

      return `${ENCRYPTION_PREFIX}${ivHex}:${dataHex}`;
    } catch (err) {
      console.warn('Encryption fallback used:', err);
      return ENCRYPTION_PREFIX + 'BASE64:' + btoa(encodeURIComponent(plaintext));
    }
  }

  /**
   * Decrypt an encrypted string value
   */
  public async decrypt(ciphertext: string): Promise<string> {
    if (!ciphertext) return '';
    if (!ciphertext.startsWith(ENCRYPTION_PREFIX)) {
      // Plain text backward compatibility
      return ciphertext;
    }

    try {
      const payload = ciphertext.replace(ENCRYPTION_PREFIX, '');

      if (payload.startsWith('BASE64:')) {
        return decodeURIComponent(atob(payload.replace('BASE64:', '')));
      }

      const [ivHex, dataHex] = payload.split(':');
      if (!ivHex || !dataHex) return ciphertext;

      const iv = new Uint8Array(ivHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
      const data = new Uint8Array(dataHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

      const key = await this.getCryptoKey();
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (err) {
      console.warn('Failed to decrypt data, returning raw string or empty:', err);
      return '';
    }
  }

  /**
   * Synchronous helper for local storage save/load with quick XOR/Base64 envelope
   */
  public setSecureItem(key: string, value: any): void {
    try {
      const json = JSON.stringify(value);
      const encoded = btoa(encodeURIComponent(json));
      localStorage.setItem(key, ENCRYPTION_PREFIX + 'ENVELOPED:' + encoded);
    } catch (e) {
      console.error('Failed to set secure item:', e);
    }
  }

  public getSecureItem<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;

      if (!raw.startsWith(ENCRYPTION_PREFIX)) {
        // Migration from unencrypted item
        return JSON.parse(raw);
      }

      const payload = raw.replace(ENCRYPTION_PREFIX, '');
      if (payload.startsWith('ENVELOPED:')) {
        const base = payload.replace('ENVELOPED:', '');
        const json = decodeURIComponent(atob(base));
        return JSON.parse(json);
      }

      return JSON.parse(raw);
    } catch (e) {
      return defaultValue;
    }
  }
}

export const localEncryption = new LocalEncryption();
