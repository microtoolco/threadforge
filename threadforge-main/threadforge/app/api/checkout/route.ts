import { NextRequest, NextResponse } from "next/server";
import { createCheckoutUrl, type PlanType } from "@/lib/lemon-squeezy";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get("plan") as PlanType;

    if (!plan || !["monthly", "lifetime"].includes(plan)) {
      return NextResponse.redirect(new URL("/?error=invalid_plan", request.url));
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to signup with return URL
      const returnUrl = `/api/checkout?plan=${plan}`;
      return NextResponse.redirect(
        new URL(`/auth/signup?returnUrl=${encodeURIComponent(returnUrl)}`, request.url)
      );
    }

    const checkoutUrl = await createCheckoutUrl(user.id, user.email!, plan);

    if (!checkoutUrl) {
      return NextResponse.redirect(new URL("/?error=checkout_failed", request.url));
    }

    return NextResponse.redirect(checkoutUrl);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.redirect(new URL("/?error=checkout_error", request.url));
  }
}
