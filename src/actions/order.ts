"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe"; // 1. Import our new Stripe client!

// ------------------------------------------------------------------
// 1. CREATE ORDER & TRIGGER STRIPE CHECKOUT
// ------------------------------------------------------------------
export async function createOrder(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/login");
  }

  const shippingAddress = formData.get("address") as string;
  const cartDataString = formData.get("cartData") as string;
  const cartTotalString = formData.get("cartTotal") as string;

  if (!shippingAddress || !cartDataString) {
    throw new Error("Missing required checkout information.");
  }

  const cartItems = JSON.parse(cartDataString);
  const totalAmount = parseInt(cartTotalString, 10);

  // 1. Create the Pending Order in your database just like before
  const order = await prisma.order.create({
    data: {
      buyerId: session.user.id,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      // We set the status to PENDING explicitly. We will only change it to PAID later via Webhooks.
      // status: "PENDING", 
      items: {
        create: cartItems.map((item: any) => ({
          productId: item.id,
          sellerId: item.sellerId,
          quantity: item.quantity,
          priceAtEpoch: item.price, 
        })),
      },
    },
  });

  // 2. Map your Zustand cart items into Stripe's exact Line Item format
  const stripeLineItems = cartItems.map((item: any) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name || "Marketplace Item", 
      },
      unit_amount: item.price, // Stripe requires this to be in cents, which we already do!
    },
    quantity: item.quantity,
  }));

  // 3. Generate the secure Stripe Checkout Session
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: stripeLineItems,
    // We pass the Order ID securely into the metadata so we know exactly which order this payment belongs to
    metadata: {
      orderId: order.id,
    },
    // Where Stripe should send the user after a successful or failed payment
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?canceled=true`,
  });

  // 4. Redirect the user away from your site and directly to the Stripe Payment UI
  if (stripeSession.url) {
    redirect(stripeSession.url);
  } else {
    throw new Error("Failed to create Stripe session");
  }
}

// ------------------------------------------------------------------
// 2. UPDATE ITEM STATUS (Per-Item Multi-Vendor Fulfillment)
// ------------------------------------------------------------------
export async function updateOrderItemStatus(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const orderItemId = formData.get("orderItemId") as string;
  const newStatus = formData.get("status") as string;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (user?.role !== "SELLER" && user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only vendors can update order statuses.");
  }

  await prisma.orderItem.updateMany({
    where: { 
      id: orderItemId,
      ...(user?.role !== "ADMIN" ? { sellerId: session.user.id } : {}) 
    },
    data: { status: newStatus }
  });

  revalidatePath("/products");
  revalidatePath("/orders");
  revalidatePath("/admin");
}