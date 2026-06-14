import { pipeline } from "@xenova/transformers";

// We use the roberta-base-go_emotions model as it's well-suited for multi-label emotion classification
// https://huggingface.co/SamLowe/roberta-base-go_emotions
let classifier: any = null;
let classifierPromise: Promise<any> | null = null;

async function getEmotionClassifier() {
  if (classifier) {
    return classifier;
  }

  if (!classifierPromise) {
    classifierPromise = pipeline("text-classification", "SamLowe/roberta-base-go_emotions", {
      revision: "main",
    });
  }

  try {
    classifier = await classifierPromise;
    return classifier;
  } catch (error) {
    console.error("Failed to load emotion classifier:", error);
    classifierPromise = null; // Reset so we can retry
    throw error;
  }
}

export async function warmUpEmotionModel() {
  try {
    await getEmotionClassifier();
    return true;
  } catch (error) {
    console.error("Emotion model warm-up failed:", error);
    return false;
  }
}

export async function detectEmotions(text: string): Promise<DetectedEmotion[]> {
  try {
    const emotionClassifier = await getEmotionClassifier();
    const result = await emotionClassifier(text, { topk: 5 });

    // Filter for emotions with a confidence score > 0.1
    return (result as any[])
      .filter((r) => r.score > 0.1)
      .map((r) => ({
        label: r.label,
        score: r.score,
      }));
  } catch (error) {
    console.error("Emotion detection failed:", error);
    return [];
  }
}

export type DetectedEmotion = {
  label: string;
  score: number;
};