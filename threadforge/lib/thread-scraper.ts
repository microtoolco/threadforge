import type { Tweet } from "@/types";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "twitter-api45.p.rapidapi.com";

interface TwitterAPI45Tweet {
  id?: string;
  tweet_id?: string;
  text?: string;
  full_text?: string;
  created_at?: string;
  author?: {
    screen_name?: string;
    name?: string;
    id?: string;
  };
  user?: {
    screen_name?: string;
    username?: string;
    name?: string;
  };
  media?: {
    photo?: Array<{
      media_url_https?: string;
      url?: string;
    }>;
  };
  extended_entities?: {
    media?: Array<{
      media_url_https: string;
    }>;
  };
}

interface TwitterAPI45Response {
  thread?: TwitterAPI45Tweet[];
  tweets?: TwitterAPI45Tweet[];
  conversation?: TwitterAPI45Tweet[];
}

export async function fetchThreadFromUrl(url: string): Promise<Tweet[]> {
  // Extract tweet ID from URL
  const tweetIdMatch = url.match(/status\/(\d+)/);
  if (!tweetIdMatch) {
    throw new Error("Invalid X/Twitter thread URL. URL must contain /status/ followed by a tweet ID.");
  }

  const tweetId = tweetIdMatch[1];

  // Check if API key is configured
  if (!RAPIDAPI_KEY) {
    throw new Error("Twitter API not configured. Please contact support.");
  }

  try {
    // Use the tweet_thread endpoint from Twitter API45
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/tweet_thread.php?id=${tweetId}`,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twitter API error:", errorText);
      throw new Error("Failed to fetch tweet. The tweet may be private or deleted.");
    }

    const data: TwitterAPI45Response = await response.json();

    // Extract tweets from response
    const threadTweets = data.thread || data.tweets || data.conversation || [];

    if (!Array.isArray(threadTweets) || threadTweets.length === 0) {
      throw new Error("Could not extract any content from this tweet.");
    }

    // Get the main author from the first tweet
    const firstTweet = threadTweets[0];
    const mainAuthor = firstTweet?.author?.screen_name || firstTweet?.user?.screen_name || firstTweet?.user?.username;

    // Convert to our Tweet format, filtering to same author
    const allTweets: Tweet[] = [];

    for (const tweet of threadTweets) {
      const tweetAuthor = tweet.author?.screen_name || tweet.user?.screen_name || tweet.user?.username;

      // Only include tweets from the same author (the actual thread)
      if (tweetAuthor === mainAuthor || !mainAuthor) {
        allTweets.push({
          id: tweet.id || tweet.tweet_id || `thread_${allTweets.length}`,
          text: tweet.text || tweet.full_text || "",
          author: tweetAuthor ? `@${tweetAuthor}` : "@unknown",
          images: extractImages45(tweet),
          created_at: tweet.created_at || new Date().toISOString(),
        });
      }
    }

    if (allTweets.length === 0) {
      throw new Error("Could not extract any content from this tweet.");
    }

    return allTweets;
  } catch (error) {
    console.error("Thread fetch error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch thread. Please try again or use manual input.");
  }
}

function extractImages45(tweet: TwitterAPI45Tweet): string[] {
  const images: string[] = [];

  // Check media.photo array
  if (tweet.media?.photo && Array.isArray(tweet.media.photo)) {
    for (const photo of tweet.media.photo) {
      if (photo.media_url_https) {
        images.push(photo.media_url_https);
      } else if (photo.url) {
        images.push(photo.url);
      }
    }
  }

  // Check extended_entities.media
  if (tweet.extended_entities?.media) {
    for (const media of tweet.extended_entities.media) {
      if (media.media_url_https && !images.includes(media.media_url_https)) {
        images.push(media.media_url_https);
      }
    }
  }

  return images;
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
