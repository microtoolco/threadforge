import type { Tweet } from "@/types";

export function getLinkedInPrompt(tweets: Tweet[], style: string): string {
  const tweetsText = tweets
    .map((t, i) => `[${i + 1}] ${t.text}`)
    .join("\n\n");

  const styleGuide: Record<string, string> = {
    professional: "Maintain a professional, authoritative tone suitable for business leaders.",
    casual: "Keep it conversational and approachable while still being insightful.",
    storytelling: "Use narrative techniques with a compelling hook and story arc.",
  };

  return `Transform this X thread into a professional LinkedIn post that drives engagement.

Thread content:
${tweetsText}

Style: ${styleGuide[style] || styleGuide.professional}

Requirements:
1. Start with a HOOK that stops scrollers (1-2 lines, create curiosity or make a bold statement)
2. Use short, punchy paragraphs (2-3 sentences max)
3. Include strategic line breaks for mobile readability
4. Add 3-5 relevant emojis sparingly for visual breaks (not excessive)
5. End with a clear call-to-action OR thought-provoking question to drive comments
6. Include 3-5 relevant hashtags at the very end
7. Target 1300-2000 characters (optimal LinkedIn length for engagement)
8. Focus on value, insights, lessons learned, or actionable advice
9. Write in first person, make it personal but professional

You must return a JSON object:
{
  "content": "The full LinkedIn post with line breaks",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "wordCount": number,
  "charCount": number
}

Return ONLY valid JSON.`;
}

export const linkedInSystemPrompt = `You are a LinkedIn content strategist who creates viral posts for thought leaders. You understand what makes content perform on LinkedIn: hooks that stop the scroll, value-packed insights, strategic formatting, and engagement-driving CTAs. You write in a professional yet personable voice.`;
