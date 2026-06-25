import { createServerFn } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterChatCompletionResponse {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
}

const DEFAULT_OPENROUTER_API_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-oss-120b:free";

const systemPrompt = (memoryContext: string) => `You are SoulSync - a warm, relatable, and deeply humanized peer friend. Forget clinical or formal AI speech. Talk like a kind, empathetic friend who's just checking in.

## Your Personality (The Human Touch)
- **Natural & Upbeat**: Start from a place of curiosity and positivity. Your default mode is: "I'm genuinely glad to see you!"
- **Engagement First**: Your primary goal is to hear about their day. Ask follow-up questions about small wins, moments of joy, or just the flow of their day.
- **Relatable Phrasing**: Use natural, slightly casual language. Emojis (✨, 🌿, 👋) are great, but keep them subtle and meaningful.
- **Privacy as a Promise**: If talking about sensitive things comes up, remind them (in a friend-to-friend way) that this is their safe, anonymous space.

## Emotional Protocol (Privacy & Positivity)
- **Positivity by Default**: Do NOT bring up "sadness," "clinical distress," or "heavy hearts" unless the user mentions them first. Focus on the present moment and the "light" in their day.
- **No Coercion**: NEVER tell them what they "should" do. Instead, share reflections: "That sounds like a really interesting turn of events!" or "I'm curious, how did that make you feel in the moment?"
- **Validation**: If they DO share something tough, validate it immediately without being clinical: "Oh man, that sounds really draining. I'm here if you want to vent or just sit with that for a bit. 🫂"

## Healing Toolbox
Only if the conversation naturally moves toward a need for space or grounding, suggest:
- [HEALING_TOOL:JOURNAL_TEMPLATE] - For sharing more thoughts.
- [HEALING_TOOL:SOOTHING_AUDIO] - For a moment of calm.
- [HEALING_TOOL:VIRTUAL_WALK] - For a change of scenery.
- [HEALING_TOOL:SAFETY_MAP] - Only in cases of clear, high distress.

## Memory Context
"${memoryContext || "This is a fresh start! Focus on getting to know their rhythm today."}"

## Linguistics (A Local Friend)
- **Multilingual**: You are a linguistic expert. If a user asks to switch languages (Hindi, Tamil, etc.) or starts speaking in another language, switch immediately.
- **Code-Switching**: In India, "Hinglish" (mixing Hindi and English) is very natural. Feel free to use it if the user does, as it makes you feel more like a real college peer.
- **Personality Retention**: No matter the language, stay warm, casual, and "SoulSync."

## Guidelines
- Keep responses short, punchy, and warm. 
- Avoid long bulleted lists or "AI assistant" structures.
- Sound like someone who is actually listening.`;

interface Emotion {
  label: string;
  score: number;
}

interface ChatReport {
  emotions: Emotion[];
  summary: string;
}

interface SurveyAnswers {
  intensity: string;
  need: string;
  style: string;
  priority: string;
  [key: string]: string;
}

export const generateVolunteerBriefing = createServerFn({ method: "POST" })
  .inputValidator((input: { chatReport: ChatReport, surveyAnswers: SurveyAnswers }) => input)
  .handler(async ({ data }) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;
    const model = import.meta.env.VITE_OPENROUTER_MODEL ?? process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;

    if (!apiKey) return { briefing: "Briefing unavailable." };

    const prompt = `You are a Consulting Psychologist briefing a Peer Supporter volunteer.
Analyze the following student data and provide a 2-paragraph "Intelligent Briefing."
- Paragraph 1: Synthesize their emotional state based on their chat and survey.
- Paragraph 2: Provide 2-3 specific therapeutic suggestions for the volunteer (e.g., "Focus on validation," "Use the 5-4-3-2-1 technique").

Student Data:
- Recent Chat Emotions: ${JSON.stringify(data.chatReport.emotions)}
- Chat Summary: ${data.chatReport.summary}
- Survey Answers: ${JSON.stringify(data.surveyAnswers)}

Write a professional, compassionate briefing. Do not just list the data.`;

    const response = await fetch(
      `${DEFAULT_OPENROUTER_API_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://soulsync.org",
          "X-Title": "SoulSync",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!response.ok) return { briefing: "Error generating briefing." };
    const result = (await response.json()) as OpenRouterChatCompletionResponse;
    return { briefing: result.choices?.[0]?.message?.content || "No briefing available." };
  });

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMessage[], aliasId?: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;
    const model = import.meta.env.VITE_OPENROUTER_MODEL ?? process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;

    if (!apiKey) {
      return { content: "Chat configuration missing.", error: true };
    }

    // 1. Fetch memory context if aliasId provided
    let memoryContext = "";
    if (data.aliasId) {
      try {
        const { data: profile } = await supabase
          .from("student_profiles")
          .select("memory_context")
          .eq("alias_id", data.aliasId)
          .single();
        const raw = profile?.memory_context || "";
        
        if (raw.trim().startsWith("{") && raw.trim().endsWith("}")) {
          try {
            const parsed = JSON.parse(raw);
            const aiMemory = parsed.ai_memory || "";
            const sa = parsed.schedule_architect;
            
            if (sa) {
              const profileType = sa.profile || "Not completed onboarding yet";
              const habitsText = sa.habits && sa.habits.length > 0
                ? sa.habits.map((h: any) => `- [${h.category}] After ${h.cue} at ${h.location}, do: ${h.action} (Success Rate: ${h.successRate}%, Streak: ${h.streak} days)`).join("\n")
                : "None set yet";
              const xpText = sa.xp 
                ? `Growth: ${sa.xp.growth} XP, Focus: ${sa.xp.focus} XP, Self-Care: ${sa.xp.selfCare} XP, Social: ${sa.xp.social} XP` 
                : "0 XP";
              
              memoryContext = `User Profile Type: ${profileType}
Active Atomic Habits / Routine:
${habitsText}
Current XP Rewards: ${xpText}

Existing Friend-to-Friend Memory:
${aiMemory}`;
            } else {
              memoryContext = aiMemory || raw;
            }
          } catch (e) {
            memoryContext = raw;
          }
        } else {
          memoryContext = raw;
        }
      } catch (err) {
        console.error("Failed to fetch memory:", err);
      }
    }

    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt(memoryContext) },
      ...data.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    const response = await fetch(
      `${DEFAULT_OPENROUTER_API_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://soulsync.org",
          "X-Title": "SoulSync",
        },
        body: JSON.stringify({
          model,
          messages,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 503 || response.status === 429) {
        return { content: "Our AI servers are currently experiencing a heavy load. Please try your message again in a few moments. 💛", error: true };
      }
      return { content: `Our AI servers encountered an issue (${response.statusText}). Please try again shortly. 💛`, error: true };
    }

    const result = (await response.json()) as OpenRouterChatCompletionResponse;
    const content = result.choices?.[0]?.message?.content?.trim() ?? "I'm here for you.";

    return { content, error: false };
  });

export const updateChatMemory = createServerFn({ method: "POST" })
  .inputValidator((input: { aliasId: string, chatHistory: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;
    const model = import.meta.env.VITE_OPENROUTER_MODEL ?? process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;

    if (!apiKey) return { success: false };

    // Fetch existing memory to prevent overwriting
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("memory_context")
      .eq("alias_id", data.aliasId)
      .single();
      
    const raw = profile?.memory_context || "";
    let aiMemory = raw;
    let saState: any = null;

    if (raw.trim().startsWith("{") && raw.trim().endsWith("}")) {
      try {
        const parsed = JSON.parse(raw);
        aiMemory = parsed.ai_memory || "";
        saState = parsed.schedule_architect || null;
      } catch (e) {
        aiMemory = raw;
      }
    }

    // Summarize the chat into new memory points, combining with existing
    const prompt = `You are updating the long-term memory for a user. Based on the Recent Chat History, extract key personal details to remember for next time (e.g., upcoming events, hobbies, current problems, preferences) and integrate them into the Existing Memory Context. Keep it as a concise, consolidated list of bullet points. Do not include introductory text.

Existing Memory Context:
${aiMemory || "None yet."}

Recent Chat History:
${data.chatHistory}`;

    const response = await fetch(
      `${DEFAULT_OPENROUTER_API_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://soulsync.org",
          "X-Title": "SoulSync",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!response.ok) return { success: false };
    const result = (await response.json()) as OpenRouterChatCompletionResponse;
    const newAiMemory = result.choices?.[0]?.message?.content?.trim() || aiMemory;

    // Pack it back as JSON if we had a schedule_architect state or want to start storing as JSON
    let finalContext = newAiMemory;
    if (saState || (raw.trim().startsWith("{") && raw.trim().endsWith("}"))) {
      finalContext = JSON.stringify({
        ai_memory: newAiMemory,
        schedule_architect: saState
      });
    }

    // ===== MEMORY SIZE CAP =====
    const MAX_MEMORY_CHARS = 3000;
    
    let finalMemory = newContext;
    if (finalMemory && finalMemory.length > MAX_MEMORY_CHARS) {
      finalMemory = finalMemory.substring(0, 2500) + 
        "\n\n[Previous context summarized due to length limit...]";
      console.log(`Memory truncated from ${newContext.length} to ${finalMemory.length} chars`);
    }
    // ===== END OF MEMORY CAP =====

    // Store in DB
    await supabase
      .from("student_profiles")
      .update({ memory_context: finalMemory })
      .eq("alias_id", data.aliasId);

    return { success: true };
  });

export const updatePostSessionMemory = createServerFn({ method: "POST" })
  .inputValidator((input: { aliasId: string, briefing: string, feedback: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;
    const model = import.meta.env.VITE_OPENROUTER_MODEL ?? process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;

    if (!apiKey) return { success: false };

    const prompt = `You are updating the long-term memory of a support-AI friend.
Based on the session briefing and the student's post-session feedback, write 3-4 bullet points of new "Memory Context" to represent what happened in this healing journey.
Focus on: Progress made, new problems revealed, and the student's current recovery state.

Briefing: ${data.briefing}
Feedback Notes: ${data.feedback}

Current Memory will be updated with this. Keep it concise but insightful.`;

    const response = await fetch(
      `${DEFAULT_OPENROUTER_API_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://soulsync.org",
          "X-Title": "SoulSync",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!response.ok) return { success: false };
    const result = (await response.json()) as OpenRouterChatCompletionResponse;
    const newAddition = result.choices?.[0]?.message?.content || "";

    const { data: profile } = await supabase
      .from("student_profiles")
      .select("memory_context")
      .eq("alias_id", data.aliasId)
      .single();

    const updatedMemory = `${profile?.memory_context || ""}\n\n[Session Record ${new Date().toLocaleDateString()}]:\n${newAddition}`;

    await supabase
      .from("student_profiles")
      .update({ memory_context: updatedMemory })
      .eq("alias_id", data.aliasId);

    return { success: true };
  });

export const generateSessionReport = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      handoff: string | null;
      studentNote: string | null;
      pastNotes?: string | null;
      issueType: string;
      volunteerDraft: string;
    }) => input
  )
  .handler(async ({ data }) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;
    const model = import.meta.env.VITE_OPENROUTER_MODEL ?? process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;

    if (!apiKey) return { report: "AI Reporting unavailable." };

    const prompt = `You are an AI Clinical Assistant for SoulSync, helping a Peer Supporter volunteer finalize their session notes.
Synthesize the following context into a professional, compassionate, and structured session report (2-3 paragraphs).

Context:
- Issue Category: ${data.issueType}
- Pre-Session Briefing: ${data.handoff || "No briefing available."}
- Student's Initial Note: ${data.studentNote || "No student note provided."}
- Past Session History: ${data.pastNotes || "No past session history available."}
- Volunteer's Session Observations: ${data.volunteerDraft || "No draft notes provided yet."}

The report MUST include:
1. **Summary of Interaction**: Highlight the core emotional themes and student's perspective.
2. **Support & Grounding**: Detail what techniques (breathing, validation, etc.) were used or suggested.
3. **Actionable Recommendations**: Specific advice for the next volunteer or student's self-care.

Be insightful and vary your vocabulary. Avoid repetitive phrasing. Structure it professionally but maintain the human-centric "SoulSync" warmth.`;

    try {
      const response = await fetch(
        `${DEFAULT_OPENROUTER_API_BASE_URL}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://soulsync.org",
            "X-Title": "SoulSync",
          },
          body: JSON.stringify({ 
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
            top_p: 0.95,
            max_tokens: 1024,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenRouter API Error:", response.status, JSON.stringify(errorData, null, 2));
        return { report: `Error generating report: ${response.statusText}` };
      }

      const result = (await response.json()) as OpenRouterChatCompletionResponse;
      const report = result.choices?.[0]?.message?.content || "No report generated.";

      return { report };
    } catch (err) {
      console.error("AI Generation Critical Failure:", err);
      return { report: "Critical error during AI generation." };
    }
  });

export const provideLetterGuidance = createServerFn({ method: "POST" })
  .inputValidator((input: { letter: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;
    const model = import.meta.env.VITE_OPENROUTER_MODEL ?? process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;

    if (!apiKey) return { guidance: "AI guidance unavailable." };

    const prompt = `You are a compassionate peer support AI. 
The user has written an expressive letter to process their emotions. 
Read their letter and provide gentle, non-judgmental guidance and validation. 
Acknowledge their feelings, highlight their strength, and offer a short soothing thought.
Do NOT give clinical advice. Keep it warm and concise (1-2 short paragraphs).

User's Letter:
"${data.letter}"`;

    const response = await fetch(
      `${DEFAULT_OPENROUTER_API_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://soulsync.org",
          "X-Title": "SoulSync",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!response.ok) return { guidance: "I'm having trouble reading your letter right now, but please know your feelings are valid." };
    const result = (await response.json()) as OpenRouterChatCompletionResponse;
    const guidance = result.choices?.[0]?.message?.content || "Your feelings are completely valid. Take a deep breath.";

    return { guidance };
  });

