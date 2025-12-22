import type { Tweet, Affiliate } from "@/types";

export function getBlogPrompt(tweets: Tweet[], affiliates: Affiliate[], style: string): string {
  const tweetsText = tweets
    .map((t, i) => `[${i + 1}] ${t.text}`)
    .join("\n\n");

  const affiliateContext = affiliates.length > 0
    ? `\n\nAvailable affiliate links to naturally incorporate (use 1-2 where relevant):\n${affiliates
        .map((a) => `- ${a.name}: ${a.url} (keywords: ${a.keywords.join(", ")})`)
        .join("\n")}`
    : "";

  const styleGuide: Record<string, string> = {
    professional: "Use a professional, authoritative tone with clear, structured writing.",
    casual: "Keep it conversational and accessible, like explaining to a friend.",
    storytelling: "Weave a narrative throughout with compelling examples and story arcs.",
  };

  return `Transform this X thread into a comprehensive, SEO-friendly blog post.

Thread content:
${tweetsText}
${affiliateContext}

Style: ${styleGuide[style] || styleGuide.professional}

Requirements:
1. Create an H1 title (60-70 characters, include primary keyword, make it compelling)
2. Write a meta description (150-160 chars) that entices clicks from search results
3. Add an engaging introduction with a hook that draws readers in
4. Use H2 subheadings every 200-300 words for scannability
5. Include bullet points and numbered lists where appropriate
6. Write in short paragraphs (3-4 sentences max)
7. Add a "Key Takeaways" or "TL;DR" section near the top
8. End with a conclusion that summarizes and includes a call-to-action
9. Target 1000-1500 words minimum for SEO value
10. If affiliate links provided, incorporate 1-2 naturally where genuinely relevant
11. Use transition words and phrases for flow

You must return a JSON object:
{
  "title": "The H1 title",
  "metaDescription": "The SEO meta description",
  "content": "Full blog post in Markdown format",
  "wordCount": number,
  "readingTime": "X min read"
}

Return ONLY valid JSON.`;
}

export const blogSystemPrompt = `You are an expert content writer and SEO specialist who creates engaging, well-structured blog posts. You understand how to transform social media content into comprehensive articles that rank well in search and provide genuine value to readers. Your writing is clear, scannable, and actionable.`;
