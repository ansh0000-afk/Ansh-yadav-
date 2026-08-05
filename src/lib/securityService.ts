export interface SecurityStatus {
  configured: boolean;
  activeSource: 'request_header' | 'encrypted_vault' | 'environment_variable' | 'missing';
  maskedKey: string;
  storageMechanism: string;
  encryptionActive: boolean;
  vaultHasCustomKey: boolean;
  envHasKey: boolean;
  lastValidated?: string;
  keyFingerprint?: string;
}

export class SecurityService {
  /**
   * Fetch security configuration status from server
   */
  public static async getStatus(): Promise<SecurityStatus | null> {
    try {
      const res = await fetch('/api/security/status');
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch security status:', err);
      return null;
    }
  }

  /**
   * Validate an API key against Google Gemini API before saving
   */
  public static async validateKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    try {
      const res = await fetch('/api/security/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      return await res.json();
    } catch (err: any) {
      return { valid: false, message: err.message || 'Validation request failed' };
    }
  }

  /**
   * Save a key to the server's AES-256 encrypted storage vault
   */
  public static async updateKey(apiKey: string): Promise<{ success: boolean; message: string; status?: SecurityStatus }> {
    try {
      const res = await fetch('/api/security/update-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Update request failed' };
    }
  }

  /**
   * Clear custom key and revert server to environment key defaults
   */
  public static async resetKey(): Promise<{ success: boolean; message: string; status?: SecurityStatus }> {
    try {
      const res = await fetch('/api/security/reset-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Reset request failed' };
    }
  }
}
