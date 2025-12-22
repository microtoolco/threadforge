import OpenAI from "openai";
import type { Tweet, Affiliate, FormatOutput, ContentFormat } from "@/types";
import { getLinkedInPrompt, linkedInSystemPrompt } from "./prompts/linkedin";
import { getBlogPrompt, blogSystemPrompt } from "./prompts/blog";
import { getInstagramPrompt, instagramSystemPrompt } from "./prompts/instagram";
import { getTwitterSummaryPrompt, twitterSummarySystemPrompt } from "./prompts/twitter-summary";

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

  let responseText = completion.choices[0]?.message?.content || "{}";

  // Strip markdown code fences if present
  responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

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

// Helper to strip markdown code fences
function stripCodeFences(text: string): string {
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
}

// LinkedIn Post Generation
export async function generateLinkedInPost(
  tweets: Tweet[],
  style: "professional" | "casual" | "storytelling" = "professional"
): Promise<FormatOutput> {
  const prompt = getLinkedInPrompt(tweets, style);
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: linkedInSystemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const responseText = stripCodeFences(completion.choices[0]?.message?.content || "{}");

  try {
    const parsed = JSON.parse(responseText);
    return {
      format: "linkedin",
      title: "LinkedIn Post",
      content: parsed.content || "",
      wordCount: parsed.wordCount || parsed.content?.split(/\s+/).length || 0,
      metadata: {
        hashtags: parsed.hashtags || [],
      },
    };
  } catch {
    return {
      format: "linkedin",
      title: "LinkedIn Post",
      content: responseText,
      wordCount: responseText.split(/\s+/).length,
      metadata: { hashtags: [] },
    };
  }
}

// Blog Post Generation
export async function generateBlogPost(
  tweets: Tweet[],
  affiliates: Affiliate[],
  style: "professional" | "casual" | "storytelling" = "professional"
): Promise<FormatOutput> {
  const prompt = getBlogPrompt(tweets, affiliates, style);
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: blogSystemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const responseText = stripCodeFences(completion.choices[0]?.message?.content || "{}");

  try {
    const parsed = JSON.parse(responseText);
    const content = parsed.content || "";
    return {
      format: "blog",
      title: parsed.title || "Blog Post",
      content,
      wordCount: parsed.wordCount || content.split(/\s+/).length,
      metadata: {
        readingTime: parsed.readingTime || `${Math.ceil(content.split(/\s+/).length / 200)} min read`,
      },
    };
  } catch {
    return {
      format: "blog",
      title: "Blog Post",
      content: responseText,
      wordCount: responseText.split(/\s+/).length,
      metadata: { readingTime: "5 min read" },
    };
  }
}

// Instagram Carousel Generation
export async function generateInstagramCarousel(
  tweets: Tweet[]
): Promise<FormatOutput> {
  const prompt = getInstagramPrompt(tweets);
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: instagramSystemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const responseText = stripCodeFences(completion.choices[0]?.message?.content || "{}");

  try {
    const parsed = JSON.parse(responseText);
    const slides = parsed.slides || [];
    const content = slides.map((s: { slideNumber: number; text: string; visualDirection?: string }) =>
      `**Slide ${s.slideNumber}:** ${s.text}${s.visualDirection ? `\n_Visual: ${s.visualDirection}_` : ""}`
    ).join("\n\n");

    return {
      format: "instagram",
      title: "Instagram Carousel",
      content: content + (parsed.caption ? `\n\n---\n**Caption:**\n${parsed.caption}` : ""),
      wordCount: content.split(/\s+/).length,
      metadata: {
        slideCount: parsed.slideCount || slides.length,
        hashtags: parsed.hashtags || [],
        slides: slides,
      },
    };
  } catch {
    return {
      format: "instagram",
      title: "Instagram Carousel",
      content: responseText,
      wordCount: responseText.split(/\s+/).length,
      metadata: { slideCount: 0, hashtags: [], slides: [] },
    };
  }
}

// Twitter Summary Thread Generation
export async function generateTwitterSummary(
  tweets: Tweet[]
): Promise<FormatOutput> {
  const prompt = getTwitterSummaryPrompt(tweets);
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: twitterSummarySystemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const responseText = stripCodeFences(completion.choices[0]?.message?.content || "{}");

  try {
    const parsed = JSON.parse(responseText);
    const summaryTweets = parsed.tweets || [];
    const content = summaryTweets.map((t: { number: number; content: string; charCount: number }) =>
      `${t.content}\n_(${t.charCount} chars)_`
    ).join("\n\n");

    return {
      format: "twitter_summary",
      title: "Twitter Summary Thread",
      content,
      wordCount: content.split(/\s+/).length,
      metadata: {
        tweetCount: parsed.tweetCount || summaryTweets.length,
        tweets: summaryTweets,
      },
    };
  } catch {
    return {
      format: "twitter_summary",
      title: "Twitter Summary Thread",
      content: responseText,
      wordCount: responseText.split(/\s+/).length,
      metadata: { tweetCount: 0, tweets: [] },
    };
  }
}

// Generate all formats in parallel
export async function generateAllFormats(
  tweets: Tweet[],
  affiliates: Affiliate[],
  style: "professional" | "casual" | "storytelling" = "professional",
  requestedFormats: ContentFormat[] = ["newsletter", "linkedin", "blog", "instagram", "twitter_summary"]
): Promise<Record<ContentFormat, FormatOutput>> {
  const results: Partial<Record<ContentFormat, FormatOutput>> = {};
  const promises: Promise<void>[] = [];

  if (requestedFormats.includes("newsletter")) {
    promises.push(
      generateNewsletter(tweets, affiliates, style).then((newsletter) => {
        results.newsletter = {
          format: "newsletter",
          title: newsletter.title,
          content: newsletter.content,
          wordCount: newsletter.wordCount,
          metadata: {},
        };
      })
    );
  }

  if (requestedFormats.includes("linkedin")) {
    promises.push(
      generateLinkedInPost(tweets, style).then((result) => {
        results.linkedin = result;
      })
    );
  }

  if (requestedFormats.includes("blog")) {
    promises.push(
      generateBlogPost(tweets, affiliates, style).then((result) => {
        results.blog = result;
      })
    );
  }

  if (requestedFormats.includes("instagram")) {
    promises.push(
      generateInstagramCarousel(tweets).then((result) => {
        results.instagram = result;
      })
    );
  }

  if (requestedFormats.includes("twitter_summary")) {
    promises.push(
      generateTwitterSummary(tweets).then((result) => {
        results.twitter_summary = result;
      })
    );
  }

  await Promise.all(promises);
  return results as Record<ContentFormat, FormatOutput>;
}
