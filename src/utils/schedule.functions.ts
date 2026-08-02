import { supabase } from "@/integrations/supabase/client";

export interface AtomicHabit {
  id: string;
  cue: string;
  location: string;
  action: string;
  successRate: number;
  completionCount: number;
  totalTarget: number;
  category: "Growth" | "Recovery" | "Leakage";
  streak: number;
  duration?: number; // Target duration in minutes
}

export interface ScheduleActivity {
  id: string;
  category: "Growth" | "Recovery" | "Leakage";
  description: string;
  duration: number; // in minutes
  timestamp: string;
}

export interface ScheduleArchitectState {
  onboardingCompleted: boolean;
  profile: "Achiever" | "Overthinker" | "Caregiver" | "Avoider" | "Sprinter" | null;
  onboardingAnswers: Record<string, string>;
  habits: AtomicHabit[];
  xp: {
    growth: number;
    focus: number;
    selfCare: number;
    social: number;
  };
  activities: ScheduleActivity[];
  privacySync: boolean;
}

export const DEFAULT_STATE: ScheduleArchitectState = {
  onboardingCompleted: false,
  profile: null,
  onboardingAnswers: {},
  habits: [],
  xp: {
    growth: 0,
    focus: 0,
    selfCare: 0,
    social: 0,
  },
  activities: [],
  privacySync: true,
};

/**
 * Helper to parse memory_context from Supabase.
 * Checks if it is a JSON format and extracts schedule_architect and AI memory.
 */
export function parseMemoryContext(rawContext: string | null): {
  aiMemory: string;
  scheduleArchitect: ScheduleArchitectState | null;
} {
  if (!rawContext) {
    return { aiMemory: "", scheduleArchitect: null };
  }

  const trimmed = rawContext.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        return {
          aiMemory: parsed.ai_memory || "",
          scheduleArchitect: parsed.schedule_architect || null,
        };
      }
    } catch (e) {
      console.warn("Failed to parse JSON memory_context:", e);
    }
  }

  // Fallback if it is plain text
  return { aiMemory: rawContext, scheduleArchitect: null };
}

/**
 * Helper to stringify both AI memory and Schedule Architect state for saving.
 */
export function stringifyMemoryContext(
  aiMemory: string,
  scheduleArchitect: ScheduleArchitectState
): string {
  const payload = {
    ai_memory: aiMemory,
    schedule_architect: scheduleArchitect,
  };
  return JSON.stringify(payload);
}

/**
 * Fetches Schedule Architect state from Supabase for a student alias.
 */
export async function fetchScheduleArchitectData(aliasId: string): Promise<ScheduleArchitectState | null> {
  try {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("memory_context")
      .eq("alias_id", aliasId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching Schedule Architect data:", error);
      return null;
    }

    if (!data) return null;

    const { scheduleArchitect } = parseMemoryContext(data.memory_context);
    return scheduleArchitect;
  } catch (err) {
    console.error("Exception in fetchScheduleArchitectData:", err);
    return null;
  }
}

/**
 * Saves Schedule Architect state to Supabase.
 * Uses upsert so it works for both new users (auth-based ID) and existing anonymous users.
 * Preserves any existing AI memory context.
 */
export async function saveScheduleArchitectData(
  aliasId: string,
  state: ScheduleArchitectState
): Promise<boolean> {
  try {
    // 1. Fetch current profile first to preserve existing AI memory
    const { data, error: fetchError } = await supabase
      .from("student_profiles")
      .select("memory_context")
      .eq("alias_id", aliasId)
      .maybeSingle();

    let aiMemory = "";
    if (!fetchError && data) {
      const parsed = parseMemoryContext(data.memory_context);
      aiMemory = parsed.aiMemory;
    }

    // 2. Write back unified context — upsert creates the row if it doesn't exist yet
    // This is critical for signed-in users whose row may only be keyed by auth user ID
    const updatedContext = stringifyMemoryContext(aiMemory, state);
    const { error: upsertError } = await supabase
      .from("student_profiles")
      .upsert(
        { alias_id: aliasId, memory_context: updatedContext, anonymous_username: "" },
        { onConflict: "alias_id", ignoreDuplicates: false }
      );

    if (upsertError) {
      console.error("Error upserting Schedule Architect data:", upsertError);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception in saveScheduleArchitectData:", err);
    return false;
  }
}
