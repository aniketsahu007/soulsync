export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiChatCompletionResponse {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
}

export interface ChatCompletionOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

interface ProviderConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

// Helper to safely get env vars from Vite's import.meta.env, Node's process.env,
// or Cloudflare Workers runtime env (via globalThis with nodejs_compat).
function getEnvVar(key: string): string | undefined {
  // ─── VITE STATIC INJECTION FIX ──────────────────────────────────────────────
  // Vite replaces import.meta.env.X statically at build time. Dynamic access
  // like import.meta.env[key] returns undefined in production builds.
  // We explicitly map ALL known keys so Vite can replace them at build time.
  // @ts-ignore — Vite replaces these at build time; TS doesn't know about them
  const _env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {} as any;
  const staticEnvMap: Record<string, string | undefined> = {
    // Provider 1
    "PROVIDER_1_API_KEY": _env.PROVIDER_1_API_KEY,
    "PROVIDER_1_NAME": _env.PROVIDER_1_NAME,
    "PROVIDER_1_BASE_URL": _env.PROVIDER_1_BASE_URL,
    "PROVIDER_1_MODEL": _env.PROVIDER_1_MODEL,
    "VITE_PROVIDER_1_API_KEY": _env.VITE_PROVIDER_1_API_KEY,
    "VITE_PROVIDER_1_NAME": _env.VITE_PROVIDER_1_NAME,
    "VITE_PROVIDER_1_BASE_URL": _env.VITE_PROVIDER_1_BASE_URL,
    "VITE_PROVIDER_1_MODEL": _env.VITE_PROVIDER_1_MODEL,
    // Provider 2
    "PROVIDER_2_API_KEY": _env.PROVIDER_2_API_KEY,
    "PROVIDER_2_NAME": _env.PROVIDER_2_NAME,
    "PROVIDER_2_BASE_URL": _env.PROVIDER_2_BASE_URL,
    "PROVIDER_2_MODEL": _env.PROVIDER_2_MODEL,
    "VITE_PROVIDER_2_API_KEY": _env.VITE_PROVIDER_2_API_KEY,
    "VITE_PROVIDER_2_NAME": _env.VITE_PROVIDER_2_NAME,
    "VITE_PROVIDER_2_BASE_URL": _env.VITE_PROVIDER_2_BASE_URL,
    "VITE_PROVIDER_2_MODEL": _env.VITE_PROVIDER_2_MODEL,
    // Provider 3 (future-proofing)
    "PROVIDER_3_API_KEY": _env.PROVIDER_3_API_KEY,
    "PROVIDER_3_NAME": _env.PROVIDER_3_NAME,
    "PROVIDER_3_BASE_URL": _env.PROVIDER_3_BASE_URL,
    "PROVIDER_3_MODEL": _env.PROVIDER_3_MODEL,
    "VITE_PROVIDER_3_API_KEY": _env.VITE_PROVIDER_3_API_KEY,
    "VITE_PROVIDER_3_NAME": _env.VITE_PROVIDER_3_NAME,
    "VITE_PROVIDER_3_BASE_URL": _env.VITE_PROVIDER_3_BASE_URL,
    "VITE_PROVIDER_3_MODEL": _env.VITE_PROVIDER_3_MODEL,
    // Groq defaults
    "GROQ_API_KEY": _env.GROQ_API_KEY,
    "GROQ_MODEL": _env.GROQ_MODEL,
    "VITE_GROQ_API_KEY": _env.VITE_GROQ_API_KEY,
    "VITE_GROQ_MODEL": _env.VITE_GROQ_MODEL,
    // Legacy / Default AI keys
    "VITE_AI_API_KEY": _env.VITE_AI_API_KEY,
    "VITE_AI_BASE_URL": _env.VITE_AI_BASE_URL,
    "VITE_AI_MODEL": _env.VITE_AI_MODEL,
    "AI_API_KEY": _env.AI_API_KEY,
    "AI_BASE_URL": _env.AI_BASE_URL,
    "AI_MODEL": _env.AI_MODEL,
  };

  if (staticEnvMap[key] !== undefined && staticEnvMap[key] !== '') {
    return staticEnvMap[key];
  }

  // ─── CLOUDFLARE WORKERS RUNTIME FIX ─────────────────────────────────────────
  // Access process.env through globalThis to bypass Vite's bundler which can
  // statically replace bare `process.env` references with empty objects.
  // On CF Workers with nodejs_compat, globalThis.process.env has the env bindings.
  try {
    const g = globalThis as any;
    if (g.process?.env?.[key]) {
      return g.process.env[key];
    }
  } catch (e) {
    // ignore
  }

  // ─── STANDARD NODE.JS FALLBACK ──────────────────────────────────────────────
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // ignore
  }
  
  return undefined;
}

// Helper to get providers from environment variables
function getProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];
  
  // 1. Scan for PROVIDER_N_* blocks
  let i = 1;
  while (true) {
    // Check both with and without VITE_ prefix just in case
    const apiKey = getEnvVar(`PROVIDER_${i}_API_KEY`) ?? getEnvVar(`VITE_PROVIDER_${i}_API_KEY`);
    if (!apiKey) {
      break; // Stop looking when we find a missing index
    }
    
    providers.push({
      name: getEnvVar(`PROVIDER_${i}_NAME`) ?? getEnvVar(`VITE_PROVIDER_${i}_NAME`) ?? `Provider_${i}`,
      apiKey,
      baseUrl: getEnvVar(`PROVIDER_${i}_BASE_URL`) ?? getEnvVar(`VITE_PROVIDER_${i}_BASE_URL`) ?? "https://api.groq.com/openai/v1",
      model: getEnvVar(`PROVIDER_${i}_MODEL`) ?? getEnvVar(`VITE_PROVIDER_${i}_MODEL`) ?? "llama-3.3-70b-versatile",
    });
    i++;
  }

  // 2. Fallback to default AI_* vars if no PROVIDER_N_* vars are found
  if (providers.length === 0) {
    const defaultKey =
      getEnvVar("GROQ_API_KEY") ??
      getEnvVar("VITE_GROQ_API_KEY") ??
      getEnvVar("VITE_AI_API_KEY") ??
      getEnvVar("AI_API_KEY");
    if (defaultKey) {
      providers.push({
        name: "Groq",
        apiKey: defaultKey,
        baseUrl: getEnvVar("VITE_AI_BASE_URL") ?? getEnvVar("AI_BASE_URL") ?? "https://api.groq.com/openai/v1",
        model:
          getEnvVar("GROQ_MODEL") ??
          getEnvVar("VITE_GROQ_MODEL") ??
          getEnvVar("VITE_AI_MODEL") ??
          getEnvVar("AI_MODEL") ??
          "llama-3.3-70b-versatile",
      });
    }
  }

  return providers;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getChatCompletion(
  messages: AiMessage[],
  options?: ChatCompletionOptions
): Promise<AiChatCompletionResponse> {
  const providers = getProviders();

  if (providers.length === 0) {
    throw new Error("No AI providers configured. Please set AI_API_KEY or PROVIDER_N_API_KEY in your environment.");
  }

  const errors: string[] = [];

  for (const provider of providers) {
    let attempt = 0;
    const maxAttempts = 2; // Try once, retry once if 429/5xx

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const baseUrl = provider.baseUrl.replace(/\/+$/, "");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${provider.apiKey}`,
        };

        if (baseUrl.includes("openrouter.ai")) {
          headers["HTTP-Referer"] = "https://soulsync.org";
          headers["X-Title"] = "SoulSync";
        }

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: provider.model,
            messages,
            ...options,
          }),
        });

        if (response.ok) {
          const result = (await response.json()) as AiChatCompletionResponse;
          console.log(`[AI Fallback] Successfully served by provider: ${provider.name}`);
          return result;
        }

        // Handle specific error codes
        if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
          // Rate limit or server error - retry same provider if attempts left
          if (attempt < maxAttempts) {
            console.warn(`[AI Fallback] Provider ${provider.name} failed with ${response.status}. Retrying in 500ms...`);
            await delay(500);
            continue; // Retry loop
          } else {
            // Out of retries for this provider, move to next
            const msg = `Provider ${provider.name} failed after ${maxAttempts} attempts with status: ${response.status} ${response.statusText}`;
            console.warn(`[AI Fallback] ${msg}. Moving to next provider.`);
            errors.push(msg);
            break; // Break inner retry loop, move to next provider
          }
        } else if (response.status === 401 || response.status === 403) {
          // Auth error — this provider's key is bad, try next provider
          const errorData = await response.text();
          const msg = `Provider ${provider.name} auth failed (${response.status}): ${errorData}`;
          console.warn(`[AI Fallback] ${msg}. Moving to next provider.`);
          errors.push(msg);
          break; // Move to next provider
        } else if (response.status >= 400 && response.status < 500) {
          // Bad request (400), not found (404), etc. - DO NOT retry, the request itself is bad
          const errorData = await response.text();
          const msg = `Bad Request on provider ${provider.name} (${response.status}): ${errorData}`;
          console.error(`[AI Fallback] ${msg}. Aborting — request shape is invalid.`);
          throw new Error(msg);
        } else {
          // Some other error, move to next provider
          const msg = `Provider ${provider.name} failed with status: ${response.status} ${response.statusText}`;
          console.warn(`[AI Fallback] ${msg}. Moving to next provider.`);
          errors.push(msg);
          break; // Break inner retry loop, move to next provider
        }
      } catch (err: any) {
        // Network error (e.g., DNS resolution failure, connection refused)
        if (err.message && err.message.includes('Bad Request')) {
            throw err; // Rethrow 400 level errors that were thrown above
        }
        
        if (attempt < maxAttempts) {
          console.warn(`[AI Fallback] Provider ${provider.name} fetch error: ${err.message}. Retrying in 500ms...`);
          await delay(500);
        } else {
          const msg = `Provider ${provider.name} fetch error after ${maxAttempts} attempts: ${err.message}`;
          console.warn(`[AI Fallback] ${msg}. Moving to next provider.`);
          errors.push(msg);
        }
      }
    }
  }

  // If we reach here, all providers failed
  throw new Error(`All AI providers failed.\nErrors:\n${errors.join('\n')}`);
}
