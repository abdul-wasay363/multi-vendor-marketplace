"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Check } from "lucide-react"
import { useCartStore } from "@/store/cart"
import { useState } from "react"

// We pass the exact details the cart needs as props
interface AddToCartProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    sellerName: string;
    sellerId: string; // <-- ADD THIS!
  }
}

export function AddToCartButton({ product }: AddToCartProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    
    // Show a quick success animation
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <Button 
      size="sm" 
      className={`rounded-full px-4 font-semibold shrink-0 transition-all ${
        isAdded ? "bg-green-600 hover:bg-green-700 text-white" : ""
      }`}
      onClick={handleAdd}
    >
      {isAdded ? (
        <><Check className="h-4 w-4 mr-2" /> Added</>
      ) : (
        <><ShoppingCart className="h-4 w-4 mr-2" /> Buy</>
      )}
    </Button>
  )
}