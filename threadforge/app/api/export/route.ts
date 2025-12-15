import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ExportSchema = z.object({
  threadId: z.string().uuid(),
  platform: z.enum(["beehiiv", "substack"])
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const { threadId, platform } = ExportSchema.parse(body);

    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile || profile.plan === "free") {
      return NextResponse.json(
        { error: "Upgrade to Pro to export to newsletter platforms" },
        { status: 403 }
      );
    }

    const { data: thread } = await supabase
      .from("threads")
      .select("*")
      .eq("id", threadId)
      .eq("user_id", user.id)
      .single();

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const webhookUrl =
      platform === "beehiiv"
        ? process.env.ZAPIER_BEEHIIV_WEBHOOK_URL
        : process.env.ZAPIER_SUBSTACK_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: `${platform} integration not configured` },
        { status: 500 }
      );
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: thread.title,
        content: thread.newsletter_content,
        author_email: user.email,
        created_at: new Date().toISOString()
      })
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed: ${webhookResponse.status}`);
    }

    await supabase.from("threads").update({ exported_to: platform }).eq("id", threadId);

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${platform} via Zapier`
    });
  } catch (error) {
    console.error("Export error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
