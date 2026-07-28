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

// Helper to safely get env vars from either Vite's import.meta.env or Node's process.env
function getEnvVar(key: string): string | undefined {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // ignore
  }
  
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
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
      baseUrl: getEnvVar(`PROVIDER_${i}_BASE_URL`) ?? getEnvVar(`VITE_PROVIDER_${i}_BASE_URL`) ?? "https://api.openai.com/v1",
      model: getEnvVar(`PROVIDER_${i}_MODEL`) ?? getEnvVar(`VITE_PROVIDER_${i}_MODEL`) ?? "gpt-3.5-turbo",
    });
    i++;
  }

  // 2. Fallback to default AI_* vars if no PROVIDER_N_* vars are found
  if (providers.length === 0) {
    const defaultKey = getEnvVar("VITE_AI_API_KEY") ?? getEnvVar("AI_API_KEY");
    if (defaultKey) {
      providers.push({
        name: "DefaultProvider",
        apiKey: defaultKey,
        baseUrl: getEnvVar("VITE_AI_BASE_URL") ?? getEnvVar("AI_BASE_URL") ?? "https://api.groq.com/openai/v1",
        model: getEnvVar("VITE_AI_MODEL") ?? getEnvVar("AI_MODEL") ?? "llama-3.3-70b-versatile",
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
        const response = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${provider.apiKey}`,
            "HTTP-Referer": "https://soulsync.org",
            "X-Title": "SoulSync",
          },
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
