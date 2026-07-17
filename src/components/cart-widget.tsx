"use client"

import { ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/cart"
import { useEffect, useState } from "react"

export function CartWidget() {
  const items = useCartStore((state) => state.items);
  // Add the openCart action here
  const openCart = useCartStore((state) => state.openCart); 
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    // Add the onClick handler to the div!
    <div 
      className="relative flex items-center cursor-pointer p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
      onClick={openCart} 
    >
      <ShoppingBag className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
          {totalItems}
        </span>
      )}
    </div>
  )
}