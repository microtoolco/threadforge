export interface User {
  id: string;
  email: string;
  plan: "free" | "monthly" | "lifetime";
  credits: number;
  lemon_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Thread {
  id: string;
  user_id: string;
  thread_url: string;
  thread_id: string;
  original_tweets: Tweet[];
  newsletter_content: string;
  title: string;
  status: "pending" | "processing" | "completed" | "failed";
  exported_to?: string | null; // Legacy field, no longer used
  created_at: string;
}

export interface Tweet {
  id: string;
  text: string;
  author: string;
  images?: string[];
  created_at: string;
}

export interface Affiliate {
  id: string;
  user_id: string;
  name: string;
  url: string;
  keywords: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface ConversionRequest {
  threadUrl: string;
  includeAffiliates?: boolean;
  style?: "professional" | "casual" | "storytelling";
}

export interface ConversionResponse {
  success: boolean;
  threadId?: string;
  newsletter?: {
    title: string;
    content: string;
    wordCount: number;
    subjectLines: string[];
    tweetableQuotes: string[];
    tldr: string;
    keyTakeaways: string[];
    engagementQuestion: string;
  };
  error?: string;
}

export interface Stats {
  totalThreads: number;
  totalExports: number;
  creditsRemaining: number;
  thisMonth: number;
  plan?: string;
  monthlyLimit?: number;
}

// Cross-platform content repurposing types
export type ContentFormat = "newsletter" | "linkedin" | "blog" | "instagram" | "twitter_summary";

export interface FormatOutput {
  format: ContentFormat;
  title: string;
  content: string;
  wordCount: number;
  metadata?: {
    slideCount?: number;      // Instagram carousel
    tweetCount?: number;      // Twitter summary
    hashtags?: string[];      // LinkedIn/Instagram
    readingTime?: string;     // Blog post
    slides?: InstagramSlide[]; // Instagram carousel slides
    tweets?: SummaryTweet[];  // Twitter summary tweets
  };
}

export interface InstagramSlide {
  slideNumber: number;
  text: string;
  visualDirection?: string;
}

export interface SummaryTweet {
  number: number;
  content: string;
  charCount: number;
}

export interface MultiFormatResponse {
  success: boolean;
  formats?: {
    newsletter?: FormatOutput;
    linkedin?: FormatOutput;
    blog?: FormatOutput;
    instagram?: FormatOutput;
    twitter_summary?: FormatOutput;
  };
  error?: string;
}
