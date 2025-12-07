import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  type Checkout,
} from "@lemonsqueezy/lemonsqueezy.js";

lemonSqueezySetup({
  apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
  onError: (error) => console.error("Lemon Squeezy Error:", error),
});

const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID!;
const MONTHLY_VARIANT_ID = process.env.LEMON_SQUEEZY_MONTHLY_VARIANT_ID!;
const LIFETIME_VARIANT_ID = process.env.LEMON_SQUEEZY_LIFETIME_VARIANT_ID!;

export type PlanType = "monthly" | "lifetime";

export async function createCheckoutUrl(
  userId: string,
  email: string,
  plan: PlanType
): Promise<string> {
  const variantId = plan === "monthly" ? MONTHLY_VARIANT_ID : LIFETIME_VARIANT_ID;

  const checkout = await createCheckout(STORE_ID, variantId, {
    checkoutData: {
      email,
      custom: {
        user_id: userId,
      },
    },
    productOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    },
  });

  return (checkout.data?.data.attributes.url as string) || "";
}

export async function getSubscriptionDetails(subscriptionId: string) {
  const subscription = await getSubscription(subscriptionId);
  return subscription.data?.data.attributes;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require("crypto");
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export interface LemonWebhookEvent {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    attributes: {
      status: string;
      customer_id: number;
      variant_id: number;
      product_id: number;
      order_id?: number;
      subscription_id?: number;
    };
  };
}
