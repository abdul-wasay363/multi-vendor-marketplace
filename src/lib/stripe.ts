import Stripe from "stripe";

// We initialize Stripe using your secret key from the .env file
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia", // The current stable API version
  typescript: true,
});