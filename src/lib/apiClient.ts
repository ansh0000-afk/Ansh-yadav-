/**
 * API Client with safe JSON response parsing and exponential backoff retry for 429 rate limits.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

/**
 * Safely parse HTTP response without throwing "Unexpected token '<'" on HTML error pages.
 */
export async function safeParseResponse<T = any>(res: Response): Promise<ApiResponse<T>> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');

  let rawText = '';
  try {
    rawText = await res.text();
  } catch (readErr) {
    rawText = '';
  }

  if (isJson && rawText.trim().length > 0) {
    try {
      const data = JSON.parse(rawText);
      return {
        ok: res.ok,
        status: res.status,
        data,
        error: !res.ok ? (data.error || data.message || `Request failed with status ${res.status}`) : undefined
      };
    } catch (parseErr) {
      // Content type stated JSON but body wasn't valid JSON
      console.warn('Failed to parse JSON response despite JSON content-type:', parseErr);
    }
  }

  // Handle HTML or non-JSON error pages (e.g. Vercel/Cloud Run 502/504 HTML)
  const trimmed = rawText.trim();
  if (trimmed.startsWith('<') || trimmed.toLowerCase().includes('<!doctype')) {
    const cleanMsg = `Server returned an HTML error page (HTTP ${res.status} ${res.statusText || 'Service Unavailable'}). Please try again.`;
    return {
      ok: false,
      status: res.status,
      data: { error: cleanMsg, text: cleanMsg } as any,
      error: cleanMsg
    };
  }

  const fallbackMsg = trimmed || `Server error (HTTP ${res.status})`;
  return {
    ok: res.ok,
    status: res.status,
    data: { error: fallbackMsg, text: fallbackMsg } as any,
    error: fallbackMsg
  };
}

/**
 * Perform a fetch request with automatic exponential backoff on 429 rate limits (max 3 retries).
 */
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<ApiResponse<T>> {
  let attempt = 0;
  let delayMs = 1000;

  while (true) {
    attempt++;
    try {
      const res = await fetch(url, options);
      const parsed = await safeParseResponse<T>(res);

      const isRateLimit = res.status === 429 || (parsed.data && typeof parsed.data === 'object' && (parsed.data as any).isRateLimit);

      if (isRateLimit && attempt <= maxRetries) {
        console.warn(`[API Client] 429 Rate limit hit on ${url}. Retry ${attempt}/${maxRetries} after ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // 1s -> 2s -> 4s
        continue;
      }

      return parsed;
    } catch (err: any) {
      if (options.signal?.aborted) {
        throw err; // User canceled request
      }

      if (attempt <= maxRetries) {
        console.warn(`[API Client] Fetch network error on ${url}. Retry ${attempt}/${maxRetries} after ${delayMs}ms...`, err);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2;
        continue;
      }

      const errMsg = err?.message || 'Network request failed';
      return {
        ok: false,
        status: 0,
        data: { error: errMsg } as any,
        error: errMsg
      };
    }
  }
}
