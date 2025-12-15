import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, type LemonWebhookEvent } from "@/lib/lemon-squeezy";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") || "";

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: LemonWebhookEvent = JSON.parse(rawBody);
    const { event_name, custom_data } = event.meta;
    const userId = custom_data?.user_id;

    if (!userId) {
      console.error("No user_id in webhook custom data");
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const { attributes } = event.data;

    switch (event_name) {
      case "order_created": {
        // One-time purchase (lifetime)
        const isLifetime = attributes.variant_id === parseInt(process.env.LEMON_SQUEEZY_LIFETIME_VARIANT_ID!);

        if (isLifetime) {
          await supabase
            .from("users")
            .update({
              plan: "lifetime",
              credits: 999999,
              lemon_customer_id: String(attributes.customer_id),
            })
            .eq("id", userId);
        }
        break;
      }

      case "subscription_created":
      case "subscription_updated": {
        const isActive = attributes.status === "active";

        await supabase
          .from("users")
          .update({
            plan: isActive ? "monthly" : "free",
            credits: isActive ? 999999 : 3,
            lemon_customer_id: String(attributes.customer_id),
            lemon_subscription_id: String(attributes.subscription_id),
          })
          .eq("id", userId);
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        await supabase
          .from("users")
          .update({
            plan: "free",
            credits: 0,
          })
          .eq("id", userId);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event_name}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
