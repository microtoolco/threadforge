import OpenAI from "openai";
import type { Tweet, Affiliate } from "@/types";

// Use Groq API (OpenAI-compatible) for faster, cheaper inference
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1"
  });
}

interface NewsletterResult {
  title: string;
  content: string;
  wordCount: number;
  subjectLines: string[];
  tweetableQuotes: string[];
  tldr: string;
  keyTakeaways: string[];
  engagementQuestion: string;
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
    professional: "Use a professional, authoritative tone with sophisticated vocabulary. Write with the polish and refinement of a top-tier publication like The Atlantic or Harvard Business Review. Use clear headings and well-structured paragraphs.",
    casual: "Use a conversational, friendly tone as if writing to a close colleague. Keep it warm but still insightful.",
    storytelling: "Use narrative techniques to tell a compelling story, with a strong hook, vivid details, and a memorable conclusion.",
  };

  const prompt = `Transform this X (Twitter) thread into a beautifully crafted, publication-ready newsletter article.

Thread content:
${tweetsText}
${affiliateContext}

Style: ${styleGuide[style]}

You must return a JSON object with this exact structure:
{
  "newsletter": "The full newsletter content in Markdown format",
  "subjectLines": ["5 different email subject line options for A/B testing - make them compelling, curiosity-driven, and varied in style"],
  "tweetableQuotes": ["3 powerful quotes from the newsletter that readers can tweet - each under 280 chars, include the insight without needing context"],
  "tldr": "A 2-3 sentence executive summary for busy readers",
  "keyTakeaways": ["3-5 bullet point takeaways - the most actionable insights"],
  "engagementQuestion": "One thought-provoking question to ask readers at the end to drive replies and discussion"
}

Newsletter requirements:
1. Create a compelling, attention-grabbing title (as H1)
2. Write a sophisticated introduction that hooks readers immediately
3. Transform tweets into eloquent, flowing paragraphs with seamless transitions
4. Add meaningful section headings (H2) for logical flow
5. Use varied sentence structure and sophisticated vocabulary while remaining accessible
6. If affiliate links are provided, weave 1-2 naturally where relevant
7. End with a thought-provoking conclusion
8. Format for email readability: short paragraphs, clear sections

Write with the quality expected from a top publication. Return ONLY valid JSON.`;

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are an elite newsletter writer and editor with experience at top publications. You transform social media threads into beautifully written, engaging newsletter content that readers love. You maintain the author's core message and voice while elevating the prose to publication quality. Your writing is polished, insightful, and a pleasure to read.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const responseText = completion.choices[0]?.message?.content || "{}";

  try {
    const parsed = JSON.parse(responseText);
    const content = parsed.newsletter || "";
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : "Untitled Newsletter";
    const wordCount = content.split(/\s+/).length;

    return {
      title,
      content,
      wordCount,
      subjectLines: parsed.subjectLines || [],
      tweetableQuotes: parsed.tweetableQuotes || [],
      tldr: parsed.tldr || "",
      keyTakeaways: parsed.keyTakeaways || [],
      engagementQuestion: parsed.engagementQuestion || "",
    };
  } catch {
    // Fallback if JSON parsing fails - treat response as plain markdown
    const content = responseText;
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : "Untitled Newsletter";
    const wordCount = content.split(/\s+/).length;

    return {
      title,
      content,
      wordCount,
      subjectLines: [],
      tweetableQuotes: [],
      tldr: "",
      keyTakeaways: [],
      engagementQuestion: "",
    };
  }
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

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You extract structured tweet data from raw thread content. Always return valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0,
  });

  const response = completion.choices[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(response);
    return parsed.tweets || parsed || [];
  } catch {
    return [];
  }
}
