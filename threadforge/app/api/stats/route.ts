import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Stats } from "@/types";

// Plan limits (same as in convert route)
const PLAN_LIMITS = {
  free: 3,
  monthly: 100,
  lifetime: 200,
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("credits, plan")
      .eq("id", user.id)
      .single();

    // Get total threads count
    const { count: totalThreads } = await supabase
      .from("threads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Get exported threads count
    const { count: totalExports } = await supabase
      .from("threads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("exported_to", "is", null);

    // Get this month's threads
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: thisMonth } = await supabase
      .from("threads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    const monthlyUsage = thisMonth || 0;
    const plan = profile?.plan || "free";
    const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || 3;

    // Calculate remaining conversions
    let conversionsRemaining: number;
    if (plan === "free") {
      conversionsRemaining = profile?.credits || 0;
    } else {
      conversionsRemaining = Math.max(0, limit - monthlyUsage);
    }

    const stats: Stats = {
      totalThreads: totalThreads || 0,
      totalExports: totalExports || 0,
      creditsRemaining: conversionsRemaining,
      thisMonth: monthlyUsage,
      plan: plan,
      monthlyLimit: limit,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
