import type { Tweet } from "@/types";

// Note: In production, you'd use Twitter API v2 or a scraping service
// This is a simulated extraction for demo purposes

export async function fetchThreadFromUrl(url: string): Promise<Tweet[]> {
  // Extract thread ID from URL
  const threadIdMatch = url.match(/status\/(\d+)/);
  if (!threadIdMatch) {
    throw new Error("Invalid X/Twitter thread URL");
  }

  const threadId = threadIdMatch[1];

  // In production, you would:
  // 1. Use Twitter API v2 with bearer token
  // 2. Or use a service like Apify, ScrapingBee, etc.
  // 3. Or implement proper scraping with rate limiting

  // For demo, return placeholder that will be replaced
  // when user provides actual Twitter API credentials

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // This would be replaced with actual API call:
  // const response = await fetch(
  //   `https://api.twitter.com/2/tweets?ids=${threadId}&expansions=author_id,attachments.media_keys&tweet.fields=created_at,text,attachments&media.fields=url,preview_image_url`,
  //   {
  //     headers: {
  //       Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  //     },
  //   }
  // );

  // For now, return demo content indicating setup needed
  return [
    {
      id: threadId,
      text: `Thread from ${url} - Configure Twitter API for live extraction. For now, paste thread content manually in the text area below, and our AI will convert it.`,
      author: "@threadforge",
      images: [],
      created_at: new Date().toISOString(),
    },
  ];
}

export function parseManualThreadInput(text: string): Tweet[] {
  // Split by common thread separators
  const separators = [
    /\n\d+\//g,           // 1/ 2/ 3/ format
    /\n\d+\.\s/g,         // 1. 2. 3. format
    /\n---+\n/g,          // --- separators
    /\n\n+/g,             // Double newlines
  ];

  let tweets: string[] = [text];

  for (const separator of separators) {
    if (text.match(separator)) {
      tweets = text.split(separator).filter((t) => t.trim().length > 0);
      break;
    }
  }

  return tweets.map((content, index) => ({
    id: `manual_${index + 1}`,
    text: content.trim(),
    author: "@user",
    images: extractImagesFromText(content),
    created_at: new Date().toISOString(),
  }));
}

function extractImagesFromText(text: string): string[] {
  const imageUrlPattern = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/gi;
  const matches = text.match(imageUrlPattern);
  return matches || [];
}
