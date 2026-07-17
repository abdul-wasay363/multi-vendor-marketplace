"use client"

import { useEffect, Suspense } from "react"
import { useCartStore } from "@/store/cart"
import { useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// We isolate the search params logic inside a component so we can wrap it in a Suspense boundary (Next.js requirement)
function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const clearCart = useCartStore((state) => state.clearCart);

  // Instantly clear the global cart state the moment they hit the success page!
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 sm:p-12 text-center max-w-lg w-full mx-4">
      <div className="flex justify-center mb-6">
        <CheckCircle className="h-20 w-20 text-green-500" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">
        Order Confirmed!
      </h1>
      
      <p className="text-zinc-500 mb-8 text-lg">
        Thank you for your purchase. Your order has been securely processed.
      </p>

      {orderId && (
        <div className="bg-zinc-50 rounded-lg p-4 mb-8 border border-zinc-100">
          <p className="text-sm text-zinc-500 mb-1">Order Reference ID</p>
          <p className="font-mono font-medium text-zinc-900">{orderId}</p>
        </div>
      )}

      <Link href="/">
        <Button className="w-full text-lg h-12">
          Continue Shopping
        </Button>
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
      <Suspense fallback={<div>Loading confirmation...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}