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
  exported_to?: "beehiiv" | "substack" | null;
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
  };
  error?: string;
}

export interface Stats {
  totalThreads: number;
  totalExports: number;
  creditsRemaining: number;
  thisMonth: number;
}
