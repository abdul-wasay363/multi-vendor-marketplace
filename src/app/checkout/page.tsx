"use client"

import { useCartStore } from "@/store/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { Package, ShieldCheck } from "lucide-react"
import { createOrder } from "@/actions/order"
import Link from "next/link"

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  
  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const totalCents = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDollars = (totalCents / 100).toFixed(2);

  // We must stringify the cart array so we can pass it through the HTML form!
  const cartDataString = JSON.stringify(items);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
        <Package className="h-16 w-16 text-zinc-300 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Your cart is empty</h1>
        <p className="text-zinc-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/">
          <Button>Return to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Checkout</h1>
          <p className="text-zinc-500 mt-2">Complete your order securely.</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Side: Order Summary */}
          <div className="bg-zinc-50 p-6 md:p-8 md:w-2/5 border-b md:border-b-0 md:border-r border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-zinc-600">
                    {item.quantity}x <span className="line-clamp-1 inline">{item.name}</span>
                  </span>
                  <span className="font-medium text-zinc-900">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-zinc-200 flex justify-between items-center">
              <span className="font-bold text-zinc-900">Total</span>
              <span className="text-xl font-bold text-zinc-900">${totalDollars}</span>
            </div>
          </div>

          {/* Right Side: Shipping & Payment Form */}
          <div className="p-6 md:p-8 md:w-3/5">
            {/* Notice how we pass our Server Action directly into the form! */}
            <form action={createOrder} className="space-y-6">
              
              {/* HIDDEN INPUTS: This is how we securely pass React state to the Server Action */}
              <input type="hidden" name="cartData" value={cartDataString} />
              <input type="hidden" name="cartTotal" value={totalCents} />

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-1">Shipping Details</h3>
                  <p className="text-sm text-zinc-500 mb-4">Where should we send your items?</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Full Shipping Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    placeholder="123 Marketplace Ave, Tech City, TC 90210" 
                    required 
                  />
                </div>
              </div>

              {/* Payment Mock UI */}
              <div className="space-y-4 pt-6 border-t border-zinc-100">
                <h3 className="text-lg font-bold text-zinc-900 mb-1">Payment</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-700 text-sm">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <p>
                    This is a development environment. No real payment will be processed. Clicking 'Pay Now' will instantly generate a test order in your database.
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full text-lg h-12 mt-4">
                Pay ${totalDollars}
              </Button>

            </form>
          </div>
        </div>

      </div>
    </div>
  )
}