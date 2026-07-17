import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Get the raw body and the cryptographic signature from Stripe
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    // 2. VERIFY THE SIGNATURE: This ensures hackers can't send fake payment confirmations!
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Webhook verification failed:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // 3. Listen specifically for a successful checkout event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    
    // We embedded the orderId into the metadata back in orders.ts!
    const orderId = session.metadata?.orderId;

    if (orderId) {
      // 4. THE MAGIC: Mark the order as officially paid!
      await prisma.order.update({
        where: { id: orderId },
        data: { isPaid: true },
      });
      console.log(`✅ Order ${orderId} successfully marked as PAID!`);
    }
  }

  // 5. Tell Stripe we received the message successfully
  return new NextResponse("Webhook processed successfully", { status: 200 });
}