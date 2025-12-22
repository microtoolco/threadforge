import type { Tweet } from "@/types";

export function getInstagramPrompt(tweets: Tweet[]): string {
  const tweetsText = tweets
    .map((t, i) => `[${i + 1}] ${t.text}`)
    .join("\n\n");

  return `Transform this X thread into an Instagram carousel script (slide-by-slide format).

Thread content:
${tweetsText}

Requirements:
1. Slide 1: HOOK/TITLE - Bold statement, question, or curiosity gap (max 15 words)
   - This is the most important slide, it must stop the scroll
2. Slides 2-8: ONE key point per slide (max 25 words each)
   - Each slide should be impactful on its own
   - Use simple, punchy language that's easy to read
   - Keep it scannable - people swipe fast
3. Final Slide: Call-to-action (save this post, share with a friend, follow for more, comment below)
4. Each slide should flow naturally to the next but also stand alone
5. Include visual direction hints in brackets for each slide (e.g., "[Bold text on gradient background]")
6. Suggest 20-30 relevant hashtags for the caption (mix of broad and niche)
7. Write a short caption for the post (2-3 sentences + question to drive comments)
8. Target 8-10 slides total (the sweet spot for engagement)

You must return a JSON object:
{
  "slides": [
    {
      "slideNumber": 1,
      "text": "The text for this slide",
      "visualDirection": "Suggestion for visual style/background"
    }
  ],
  "caption": "The Instagram caption with engagement question",
  "hashtags": ["hashtag1", "hashtag2"],
  "slideCount": number
}

Return ONLY valid JSON.`;
}

export const instagramSystemPrompt = `You are an Instagram content strategist who creates viral carousel posts. You understand that Instagram carousels need bold hooks, scannable slides, and strong CTAs. You write content that performs well on mobile, drives saves and shares, and builds engaged audiences.`;
