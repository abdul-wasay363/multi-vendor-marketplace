"use client"

import { useCartStore } from "@/store/cart"
import { X, Trash2, Package, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import Link from "next/link"

export function CartSlideOut() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  
  // Hydration fix for the client component
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Don't render the overlay at all if it's closed
  if (!isOpen) return null;

  const totalCents = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDollars = (totalCents / 100).toFixed(2);

  return (
    <div className="relative z-50">
      {/* Dark Background Overlay */}
      <div 
        className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm transition-opacity" 
        onClick={closeCart} // Clicking outside the menu closes it
      />

      {/* The Sliding Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900">Your Cart</h2>
          <button onClick={closeCart} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <Package className="h-12 w-12 text-zinc-300 stroke-[1.5]" />
              <p className="text-zinc-500 font-medium">Your cart is empty.</p>
              <Button variant="outline" onClick={closeCart}>Continue Shopping</Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4">
                {/* Thumbnail */}
                <div className="h-20 w-20 bg-zinc-100 rounded-md overflow-hidden flex-shrink-0 border border-zinc-200 flex items-center justify-center">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-6 w-6 text-zinc-300" />
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-900 text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Sold by {item.sellerName}</p>
                    <p className="font-bold text-zinc-900 text-sm mt-1">${(item.price / 100).toFixed(2)}</p>
                  </div>
                  
                  {/* Quantity & Delete Controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-zinc-200 rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-zinc-500 hover:text-zinc-900 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-100 p-6 bg-zinc-50">
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="font-medium text-zinc-500">Subtotal</span>
              <span className="font-bold text-lg text-zinc-900">${totalDollars}</span>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <Button className="w-full text-base font-semibold py-6">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}