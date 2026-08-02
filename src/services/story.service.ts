import { createServerFn } from "@tanstack/react-start";
import { getChatCompletion } from '@/utils/aiClient';

export interface DailyStory {
  title: string;
  hook: string;      // A one-line teaser shown before the full story
  content: string;
  reflectionQuestion: string;
}

// Rich variety pools to ensure maximum uniqueness each session
const THEMES = [
  "Small unexpected victories", "The beauty of trying again", "Quiet moments of joy", 
  "A sudden burst of inspiration", "Finding comfort in friendship", "A serendipitous encounter",
  "Discovering a new passion", "The warmth of a shared meal", "Learning to be gentle with oneself",
  "A surprisingly perfect morning", "Overcoming a creative block with a smile"
];

const CHARACTERS = [
  "a 2nd-year engineering student from Pune named Arjun who just finally understood a tough concept",
  "a design student from Delhi named Rhea who found her unique art style today",
  "a medical student from Chennai named Priya taking a well-deserved sunny walk",
  "a first-year hostel student named Kabir who just made his first real friend on campus",
  "a student founder named Zara who launched a tiny, but deeply loved, passion project",
  "a cricketer named Dev who discovered the joy of playing just for fun again",
  "a final-year student named Aisha who realized her self-worth is independent of placements",
  "a literature student named Rohan who wrote a poem that made someone smile",
  "a shy student named Meera who successfully led a group project today",
  "a student named Sam who took their first guilt-free day off in months",
];

const SETTINGS = [
  "a cozy, sunlit corner of the college library",
  "the rooftop of a hostel under a beautiful starry night, sharing snacks",
  "a warm local chai shop where the owner knows everyone's order",
  "a vibrant campus lawn on a breezy spring afternoon",
  "a bustling but cheerful art studio filled with paints and laughter",
  "a quiet dorm room filled with the smell of instant noodles and success",
  "a campus cafe where a spontaneous jam session just started",
  "a peaceful train ride home, watching the sunset out the window",
  "a botanical garden near the university, bursting with colorful flowers",
  "a comfortable couch in the student lounge on a lazy Sunday",
];

const HIDDEN_LESSONS = [
  "even tiny progress is worth celebrating",
  "you are capable of far more than you realize",
  "kindness from a stranger can turn your whole day around",
  "it's beautiful to just exist and breathe",
  "your unique path is exactly where you need to be",
  "taking time to rest makes your mind bloom",
  "there is so much joy in simply trying",
  "the world is full of small, wonderful surprises",
  "you have a community that roots for you",
  "tomorrow is a fresh, bright new page",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const generateDailyStory = createServerFn({ method: "POST" })
  .handler(async (): Promise<DailyStory> => {
  const theme = pick(THEMES);
  const character = pick(CHARACTERS);
  const setting = pick(SETTINGS);
  const lesson = pick(HIDDEN_LESSONS);
  // Timestamp + random seed forces a truly new story every single call
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const systemPrompt = `You are a world-class author who writes deeply moving, UPLIFTING, and COMFORTING short stories for a student wellness app.
Your style is warm, incredibly positive, and deeply relatable to Indian students. The story MUST feel like a warm hug. It should leave the reader feeling motivated, calm, and happy.

TODAY'S BRIEF (Seed: ${seed}):
- Theme: ${theme}
- Character: ${character}
- Setting: ${setting}
- Hidden life lesson (do NOT state this directly — show it through the story): "${lesson}"

ABSOLUTE RULES:
1. **NO HEAVINESS OR DISTRESS**: Do NOT write about failing, extreme stress, depression, or panic. The conflict should be very mild (e.g., losing a pen, a moment of doubt) and quickly resolved with joy.
2. **HOOK FIRST**: The opening line must be curious but POSITIVE. E.g., "He never expected a cup of chai to completely change his Tuesday."
3. **Relatable & Cozy**: Use specific Indian college details (mess food, sunny lawns, chai stops, friendly guards) but cast them in a warm, nostalgic light.
4. **Short & punchy**: 220-280 words for "content". Short paragraphs. Never more than 3 sentences per paragraph.
5. **NO PREACHING**: Never use words like "mental health", "wellness", or "self-care". Let the comforting vibe do the work.
6. **hook field**: Write a single teaser sentence (max 15 words) that creates positive curiosity. It must sound inviting and warm.
7. **reflectionQuestion**: One gentle, open question that makes the user smile about their own life.

RESPOND ONLY with valid JSON, no markdown:
{
  "title": "...",
  "hook": "...",
  "content": "...",
  "reflectionQuestion": "..."
}`;

  try {
    const response = await getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Write today's story. Make it completely fresh — seed: ${seed}` }
      ],
      {
        temperature: 1.0,   // Max creativity for maximum variety
        max_tokens: 700,
      }
    );

    const messageContent = response.choices?.[0]?.message?.content;
    if (!messageContent) throw new Error("No content received from AI");

    const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : messageContent;
    const parsed = JSON.parse(jsonString) as DailyStory;
    return parsed;

  } catch (error) {
    console.error("Failed to generate story:", error);
    // Rich fallback story
    return {
      title: "The Extra Samosa",
      hook: "There was one samosa left, and the canteen aunty smiled as she packed it.",
      content: "Kabir had been studying in the library all afternoon. The equations were finally making sense, but his stomach was loudly protesting. It was 5 PM, the exact time the college canteen served fresh samosas.\n\nHe practically jogged across the sunny courtyard, dodging a group of seniors playing the guitar. When he reached the counter, the glass display was completely empty. He sighed, ready to turn around.\n\n\"Wait, beta,\" the canteen aunty called out. She reached under the counter and pulled out a small brown paper bag, perfectly warm. \"I kept one extra aside today. You always come at five.\"\n\nKabir blinked, surprised she even noticed him in the sea of hundreds of students. He took the bag, thanking her profusely.\n\nHe sat on the steps outside, breaking the crispy crust. It was perfectly spiced. A stray dog wandered over, wagging its tail, and Kabir happily tossed it a small piece. The afternoon sun was warm, the campus was buzzing with laughter, and for the first time all semester, Kabir felt completely, wonderfully at home.",
      reflectionQuestion: "When was the last time a small act of kindness from a stranger made you smile?"
    };
  }
});
