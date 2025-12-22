import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateNewsletter, generateAllFormats } from "@/lib/openai";
import { fetchThreadFromUrl, parseManualThreadInput } from "@/lib/thread-scraper";
import { createClient } from "@/lib/supabase/server";
import type { Affiliate, ConversionResponse, Tweet, ContentFormat, MultiFormatResponse } from "@/types";

export const runtime = "nodejs";

// Plan limits
const PLAN_LIMITS = {
  free: 3,        // 3 total (uses credits)
  monthly: 100,   // 100 per month
  lifetime: 200,  // 200 per month
};

const ConvertSchema = z.object({
  threadUrl: z.string().url().optional(),
  manualContent: z.string().optional(),
  style: z.enum(["professional", "casual", "storytelling"]).default("professional"),
  includeAffiliates: z.boolean().default(true),
  formats: z.array(z.enum(["newsletter", "linkedin", "blog", "instagram", "twitter_summary"])).default(["newsletter"]),
  multiFormat: z.boolean().default(false)
});

function toTweetArray(input: Array<Partial<Tweet> & { text: string }>, fallbackAuthor = "Manual") : Tweet[] {
  const now = new Date().toISOString();
  return input.map((t, idx) => ({
    id: t.id ?? `manual_${Date.now()}_${idx}`,
    text: t.text,
    author: t.author ?? fallbackAuthor,
    created_at: t.created_at ?? now
  }));
}

// Get the start of current month in ISO format
function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export async function POST(request: NextRequest): Promise<NextResponse<ConversionResponse | MultiFormatResponse>> {
  try {
    const body: unknown = await request.json();
    const { threadUrl, manualContent, style, includeAffiliates, formats, multiFormat } = ConvertSchema.parse(body);

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

    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("credits, plan")
        .eq("id", user.id)
        .single();

      if (!profile) {
        return NextResponse.json(
          { success: false, error: "User profile not found" },
          { status: 403 }
        );
      }

      // Check limits based on plan
      if (profile.plan === "free") {
        if (profile.credits <= 0) {
          return NextResponse.json(
            { success: false, error: "No free credits remaining. Upgrade to Pro for 100 conversions per month!" },
            { status: 403 }
          );
        }
      } else {
        // For paid plans, count conversions this month
        const monthStart = getMonthStart();
        const { count } = await supabase
          .from("threads")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", monthStart);

        const monthlyUsage = count || 0;
        const limit = PLAN_LIMITS[profile.plan as keyof typeof PLAN_LIMITS] || 100;

        if (monthlyUsage >= limit) {
          return NextResponse.json(
            { success: false, error: `Monthly limit reached (${limit} conversions). Your limit resets on the 1st of next month.` },
            { status: 403 }
          );
        }
      }
    }

    let tweets: Tweet[] = [];

    if (manualContent) {
      const parsed = parseManualThreadInput(manualContent);
      // parsed likely returns items with at least { text }, so normalize into Tweet[]
      tweets = toTweetArray(parsed as Array<Partial<Tweet> & { text: string }>, user?.email ?? "Manual");
    } else if (threadUrl) {
      // fetchThreadFromUrl should already return Tweet[]
      tweets = await fetchThreadFromUrl(threadUrl);
    } else {
      return NextResponse.json(
        { success: false, error: "No content provided" },
        { status: 400 }
      );
    }

    let affiliates: Affiliate[] = [];
    if (user && includeAffiliates) {
      const { data } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      affiliates = (data as Affiliate[]) || [];
    }

    // Check if user is requesting multi-format (Pro feature)
    const userPlan = user ? (await supabase.from("users").select("plan").eq("id", user.id).single()).data?.plan : "free";
    const isPro = userPlan === "monthly" || userPlan === "lifetime";

    // If multiFormat requested but not Pro, only allow newsletter
    const allowedFormats: ContentFormat[] = multiFormat && isPro
      ? formats as ContentFormat[]
      : ["newsletter"];

    // Generate content based on allowed formats
    if (multiFormat && isPro && allowedFormats.length > 1) {
      // Generate all requested formats in parallel
      const allFormats = await generateAllFormats(tweets, affiliates, style, allowedFormats);

      if (user) {
        const threadId = threadUrl?.match(/status\/(\d+)/)?.[1] || `manual_${Date.now()}`;

        await supabase.from("threads").insert({
          user_id: user.id,
          thread_url: threadUrl || "manual_input",
          thread_id: threadId,
          original_tweets: tweets,
          newsletter_content: allFormats.newsletter?.content || "",
          title: allFormats.newsletter?.title || "Untitled",
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
        formats: allFormats
      } as MultiFormatResponse);
    }

    // Standard newsletter-only flow
    const newsletter = await generateNewsletter(tweets, affiliates, style);

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
        wordCount: newsletter.wordCount,
        subjectLines: newsletter.subjectLines,
        tweetableQuotes: newsletter.tweetableQuotes,
        tldr: newsletter.tldr,
        keyTakeaways: newsletter.keyTakeaways,
        engagementQuestion: newsletter.engagementQuestion
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
