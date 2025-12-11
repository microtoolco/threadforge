import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Stats } from "@/types";

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

    const stats: Stats = {
      totalThreads: totalThreads || 0,
      totalExports: totalExports || 0,
      creditsRemaining: profile?.credits || 0,
      thisMonth: thisMonth || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
