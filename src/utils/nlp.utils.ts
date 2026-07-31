// RoBERTa emotion classification — browser-only (uses WASM, cannot run on SSR/Node)
// Browser-compatible ONNX clone of https://huggingface.co/SamLowe/roberta-base-go_emotions
// https://huggingface.co/MicahB/roberta-base-go_emotions
// Model is cached by @xenova/transformers after first download (~90MB, browser-cached)

let classifier: any = null;
let classifierLoadError: string | null = null;
const EMOTION_MODEL_ID = "MicahB/roberta-base-go_emotions";

/** Returns true only when running in a real browser environment */
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

async function getPipeline() {
  // CRITICAL FIX: Vite/TanStack Start often corrupts the internal onnxruntime-web WASM loading
  // by trying to optimize/bundle the CommonJS backend. By fetching pure ESM directly from jsdelivr,
  // we completely bypass the Vite bundler and the "registerBackend" crash.
  
  // @ts-ignore
  const transformers = await import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/+esm");
  
  transformers.env.allowLocalModels = false;
  transformers.env.useBrowserCache = true;

  return transformers.pipeline;
}

/**
 * Pre-warms the RoBERTa classifier so it's ready before the user's first message.
 * Call this on chat mount to avoid delay on first analysis. Safe to call multiple times.
 */
export async function warmupClassifier(): Promise<void> {
  if (!isBrowser || classifier || classifierLoadError) return;
  try {
    const pipeline = await getPipeline();
    classifier = await pipeline(
      "text-classification",
      EMOTION_MODEL_ID,
      { revision: "main" }
    );
  } catch (err) {
    classifierLoadError = String(err);
    console.warn("[RoBERTa] Model warmup failed:", err);
    throw err;
  }
}

export async function detectEmotions(text: string): Promise<DetectedEmotion[]> {
  // Only run in browser — silently skip on SSR
  if (!isBrowser) return [];
  // If a previous load failed, don't retry on every message
  if (classifierLoadError) return [];

  try {
    if (!classifier) {
      const pipeline = await getPipeline();
      classifier = await pipeline(
        "text-classification",
        EMOTION_MODEL_ID,
        { revision: "main" }
      );
    }

    const result = await classifier(text, { topk: 5 });

    // Filter for emotions with a confidence score > 0.1
    return (result as any[])
      .filter((r) => r.score > 0.1)
      .map((r) => ({
        label: r.label,
        score: Math.round(r.score * 1000) / 1000,
      }));
  } catch (err) {
    classifierLoadError = String(err);
    console.error("[RoBERTa] Emotion detection failed:", err);
    return [];
  }
}

export type DetectedEmotion = {
  label: string;
  score: number;
};


