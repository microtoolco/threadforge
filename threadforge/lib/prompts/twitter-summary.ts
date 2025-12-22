import type { Tweet } from "@/types";

export function getTwitterSummaryPrompt(tweets: Tweet[]): string {
  const tweetsText = tweets
    .map((t, i) => `[${i + 1}] ${t.text}`)
    .join("\n\n");

  return `Condense this X thread into a punchy 3-5 tweet summary thread that captures the key insights.

Original thread:
${tweetsText}

Requirements:
1. Tweet 1: HOOK + thread indicator
   - Must grab attention immediately
   - Include emoji thread indicator like "🧵" or "[Thread]"
   - Set up what readers will learn
2. Tweets 2-4: Core insights condensed (one key point per tweet)
   - Extract the MOST valuable insights only
   - Make each tweet valuable on its own
3. Final tweet: Key takeaway + engagement CTA
   - Summarize the main lesson
   - Ask for retweets, replies, or follows
4. Each tweet MUST be under 280 characters (crucial!)
5. Use the 1/ 2/ 3/ numbering format at the start of each tweet
6. Include 1-2 relevant emojis per tweet for visual appeal
7. Write in a punchy, engaging style that performs well on X

You must return a JSON object:
{
  "tweets": [
    {
      "number": 1,
      "content": "The full tweet text including numbering and emojis",
      "charCount": number
    }
  ],
  "tweetCount": number
}

IMPORTANT: Double-check that every tweet is under 280 characters!

Return ONLY valid JSON.`;
}

export const twitterSummarySystemPrompt = `You are a Twitter/X content strategist who creates viral thread summaries. You know how to distill long content into punchy, engaging tweets that drive impressions and engagement. You write with hooks, use strategic emojis, and always stay under the character limit.`;
