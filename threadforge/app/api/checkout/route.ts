import { NextRequest, NextResponse } from "next/server";
import { createCheckoutUrl, type PlanType } from "@/lib/lemon-squeezy";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function parsePlan(plan: string | null): PlanType | null {
  if (plan === "monthly" || plan === "lifetime") return plan;
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = parsePlan(searchParams.get("plan"));

    if (!plan) {
      return NextResponse.redirect(new URL("/?error=invalid_plan", request.url));
    }

    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      const returnUrl = `/api/checkout?plan=${plan}`;
      return NextResponse.redirect(
        new URL(
          `/auth/signup?returnUrl=${encodeURIComponent(returnUrl)}`,
          request.url
        )
      );
    }

    const checkoutUrl = await createCheckoutUrl(user.id, user.email ?? "", plan);

    if (!checkoutUrl) {
      return NextResponse.redirect(new URL("/?error=checkout_failed", request.url));
    }

    return NextResponse.redirect(new URL(checkoutUrl));
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.redirect(new URL("/?error=checkout_error", request.url));
  }
}
