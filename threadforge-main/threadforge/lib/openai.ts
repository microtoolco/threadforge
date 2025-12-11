import OpenAI from "openai";
import type { Tweet, Affiliate } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NewsletterResult {
  title: string;
  content: string;
  wordCount: number;
}

export async function generateNewsletter(
  tweets: Tweet[],
  affiliates: Affiliate[],
  style: "professional" | "casual" | "storytelling" = "professional"
): Promise<NewsletterResult> {
  const tweetsText = tweets
    .map((t, i) => `[${i + 1}] ${t.text}${t.images?.length ? ` [Image: ${t.images[0]}]` : ""}`)
    .join("\n\n");

  const affiliateContext = affiliates.length > 0
    ? `\n\nAvailable affiliate links to naturally incorporate where relevant:\n${affiliates
        .map((a) => `- ${a.name}: ${a.url} (keywords: ${a.keywords.join(", ")})`)
        .join("\n")}`
    : "";

  const styleGuide = {
    professional: "Use a professional, authoritative tone with clear headings and bullet points where appropriate.",
    casual: "Use a conversational, friendly tone as if writing to a close colleague.",
    storytelling: "Use narrative techniques to tell a compelling story, with a strong hook and conclusion.",
  };

  const prompt = `Convert this X (Twitter) thread into a polished newsletter article in Markdown format.

Thread content:
${tweetsText}
${affiliateContext}

Style: ${styleGuide[style]}

Requirements:
1. Create an engaging title (as H1)
2. Write a compelling introduction that hooks readers
3. Transform tweets into flowing paragraphs with proper transitions
4. Add section headings (H2) to organize content logically
5. Preserve any important images as Markdown image syntax
6. If affiliate links are provided, naturally incorporate 1-2 where contextually relevant (don't force them)
7. End with a strong conclusion or call-to-action
8. Format for email readability (short paragraphs, clear sections)

Output the newsletter in clean Markdown format.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert newsletter writer who transforms social media threads into engaging, professional newsletter content. You maintain the author's voice while improving structure and readability.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = completion.choices[0]?.message?.content || "";
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : "Untitled Newsletter";
  const wordCount = content.split(/\s+/).length;

  return { title, content, wordCount };
}

export async function extractThreadContent(rawContent: string): Promise<Tweet[]> {
  const prompt = `Extract individual tweets from this X thread content. Return as JSON array.

Content:
${rawContent}

Return format:
[
  {
    "id": "tweet_1",
    "text": "The tweet content here",
    "author": "@username",
    "images": ["url1", "url2"],
    "created_at": "2024-01-01T00:00:00Z"
  }
]

Extract all tweets in order. If no images, use empty array. If author unknown, use "@unknown".`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You extract structured tweet data from raw thread content. Always return valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const response = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(response);
  return parsed.tweets || parsed || [];
}
