import { getChatCompletion } from '@/utils/aiClient';

export interface DailyStory {
  title: string;
  hook: string;      // A one-line teaser shown before the full story
  content: string;
  reflectionQuestion: string;
}

// Rich variety pools to ensure maximum uniqueness each session
const THEMES = [
  "College Life", "Adventure", "Sports", "Entrepreneurship",
  "Fantasy", "Mystery", "Slice of Life", "Science Fiction",
  "Mythology retold in modern India", "Startup hustle", "Cricket match",
  "Friendship & heartbreak", "Exam pressure", "Late-night hostel life"
];

const CHARACTERS = [
  "a 2nd-year engineering student from Pune named Arjun",
  "a design student from Delhi named Rhea who loves anime",
  "a medical student from Chennai named Priya studying for NEET PG",
  "a first-year hostel student named Kabir who misses home",
  "a startup founder dropout named Zara who pivoted three times",
  "a cricketer named Dev who just lost the inter-college final",
  "a final-year student named Aisha preparing for campus placements",
  "a literature student named Rohan who secretly writes poetry",
  "a shy student named Meera who just moved to a new city for college",
  "an overachiever named Sam who always needs to be number one",
];

const SETTINGS = [
  "a packed college canteen at 2 AM before exams",
  "the rooftop of a hostel on a quiet Sunday evening",
  "a local chai shop near a university campus",
  "a WhatsApp group chat that turned into something more",
  "a cricket ground at sunset after a practice session",
  "a library where everyone else seems to understand everything",
  "a startup office that is just a cramped dorm room",
  "a crowded train home for semester break",
  "an empty classroom after everyone else has left",
  "the first day of college, utterly lost and overwhelmed",
];

const HIDDEN_LESSONS = [
  "rest is productive, not lazy",
  "asking for help is the strongest thing you can do",
  "you are not behind — everyone is fighting their own pace",
  "failure is not the end; it is just data",
  "you don't need to have everything figured out yet",
  "comparison is the thief of joy",
  "one good friendship is worth more than a hundred followers",
  "your worth is not your grades or your rank",
  "taking a break is not giving up",
  "it's okay to not be okay — and that is a good starting point",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function generateDailyStory(): Promise<DailyStory> {
  const theme = pick(THEMES);
  const character = pick(CHARACTERS);
  const setting = pick(SETTINGS);
  const lesson = pick(HIDDEN_LESSONS);
  // Timestamp + random seed forces a truly new story every single call
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const systemPrompt = `You are a world-class author who writes deeply moving, short stories for a student wellness app.
Your style is inspired by R.K. Narayan, Ruskin Bond, and Chetan Bhagat — warm, relatable to Indian students, yet universal.

TODAY'S BRIEF (Seed: ${seed}):
- Theme: ${theme}
- Character: ${character}
- Setting: ${setting}
- Hidden life lesson (do NOT state this directly — show it through the story): "${lesson}"

ABSOLUTE RULES:
1. **HOOK FIRST**: The opening line must be irresistible. It should make the reader STOP and think "wait, what?" — use suspense, emotion, or a surprising observation.
2. **Relatable**: The character must feel like someone the reader knows — or IS. Use specific Indian college details (mess food, exams, hostel rooms, coaching classes, placements).
3. **Short & punchy**: 220-280 words for "content". Short paragraphs. Never more than 3 sentences per paragraph.
4. **Fun, then real**: Start with something entertaining or curious, then let the emotional truth arrive naturally at the end. The reader should feel it — not be told it.
5. **NO PREACHING**: Never say words like "anxiety", "mental health", "burnout", "stress". The lesson must feel like a discovery, not a lecture.
6. **hook field**: Write a single teaser sentence (max 15 words) that creates intense curiosity. Like a movie trailer line. E.g., "He had studied 14 hours a day. Then he opened his results."
7. **reflectionQuestion**: One gentle, open question. Not diagnostic. Something a friend might ask over chai.

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
      title: "The Last Samosa",
      hook: "There was one samosa left in the canteen. Two students reached for it at the same time.",
      content: "Kabir had not eaten since morning. It was 11 PM, the mess was closed, and the canteen aunty was already putting on her dupatta to leave. And then — there it was. One lonely samosa under the glass counter, glistening under a yellow bulb.\n\nHe reached for it at the exact same moment as the girl from his Signals class. Their hands touched the glass simultaneously. She looked at him. He looked at her.\n\n\"You take it,\" he said, because he didn't know what else to say.\n\n\"Split it?\" she offered.\n\nHe had been alone in this city for four months. He ate lunch at his desk and studied with earphones in so no one would try to talk to him. He had told himself he preferred it that way.\n\nThey sat on the canteen steps and split the samosa with a plastic fork. She talked about her hometown. He talked about his. The aunty locked up around them without a word.\n\nKabir walked back to his room an hour later. The samosa was long gone. But somehow, he was no longer hungry.",
      reflectionQuestion: "When was the last time something small turned into something you really needed?"
    };
  }
}
