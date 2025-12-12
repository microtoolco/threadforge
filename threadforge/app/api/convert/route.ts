\import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateNewsletter } from "@/lib/openai";
import { fetchThreadFromUrl, parseManualThreadInput } from "@/lib/thread-scraper";
import { createClient } from "@/lib/supabase/server";
import type { Affiliate, ConversionResponse } from "@/types";

export const runtime = "nodejs";

const ConvertSchema = z.object({
  threadUrl: z.string().url().optional(),
  manualContent: z.string().optional(),
  style: z.enum(["professional", "casual", "storytelling"]).default("professional"),
  includeAffiliates: z.boolean().default(true)
});

// ✅ Only require what we actually need
type TweetLike = { text: string };

export async function POST(request: NextRequest): Promise<NextResponse<ConversionResponse>> {
  try {
    const body: unknown = await request.json();
    const { threadUrl, manualContent, style, includeAffiliates } = ConvertSchema.parse(body);

    if (!threadUrl && !manualContent) {
      return NextResponse.json(
        { success: false, error: "Please provide a thread URL or content" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    // Check credits for authenticated users
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("credits, plan")
        .eq("id", user.id)
        .single();

      if (profile && profile.plan === "free" && profile.credits <= 0) {
        return NextResponse.json(
          { success: false, error: "No credits remaining. Please upgrade to continue." },
          { status: 403 }
        );
      }
    }

    // Extract tweets from URL or manual input
    let tweets: TweetLike[] = [];

    if (manualContent) {
      tweets = parseManualThreadInput(manualContent);
    } else if (threadUrl) {
      tweets = await fetchThreadFromUrl(threadUrl);
    } else {
      return NextResponse.json(
        { success: false, error: "No content provided" },
        { status: 400 }
      );
    }

    // Get user's affiliates if authenticated and requested
    let affiliates: Affiliate[] = [];
    if (user && includeAffiliates) {
      const { data } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      affiliates = (data as Affiliate[]) || [];
    }

    // Generate newsletter with OpenAI
    const newsletter = await generateNewsletter(tweets, affiliates, style);

    // Save thread and deduct credit for authenticated users
    if (user) {
      const threadId = threadUrl?.match(/status\/(\d+)/)?.[1] || `manual_${Date.now()}`;

      await supabase.from("threads").insert({
        user_id: user.id,
        thread_url: threadUrl || "manual_input",
        thread_id: threadId,
        original_tweets: tweets,
        newsletter_content: newsletter.content,
        title: newsletter.title,
        status: "completed"
      });

      const { data: profile } = await supabase
        .from("users")
        .select("plan, credits")
        .eq("id", user.id)
        .single();

      if (profile?.plan === "free") {
        await supabase
          .from("users")
          .update({ credits: Math.max(0, profile.credits - 1) })
          .eq("id", user.id);
      }
    }

    return NextResponse.json({
      success: true,
      newsletter: {
        title: newsletter.title,
        content: newsletter.content,
        wordCount: newsletter.wordCount
      }
    });
  } catch (error) {
    console.error("Conversion error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to convert thread" },
      { status: 500 }
    );
  }
}
