"use client";

import { useCartStore } from "@/store/cart";
import { ShoppingCart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // 1. Import the router to bounce users
import { authClient } from "@/lib/auth-client"; // 2. Import your auth client to check session

interface ProductCardProps {
  id: string;
  name: string;
  price: number; 
  imageUrl: string | null;
  sellerName: string;
  sellerId: string;
}

export function ProductCard({ id, name, price, imageUrl, sellerName, sellerId }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter(); // Initialize the router

  // We change this to an async function so we can securely check the auth state
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 1. THE BOUNCER: Check if the user is currently logged in
    const { data: session } = await authClient.getSession();

    if (!session) {
      // If they are not logged in, immediately redirect them to the login page!
      router.push("/login");
      return; // Stop the function here so the item NEVER gets added to the cart
    }

    // 2. If they are logged in, proceed to add the item to the Zustand store
    addItem({
      id,
      name,
      price,
      quantity: 1,
      sellerId,
      imageUrl, // <-- ADD THIS LINE!
      sellerName,
    });
  };

  return (
    <div className="group relative bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      
      {/* Product Image Container */}
      <div className="aspect-square w-full bg-zinc-100 relative overflow-hidden group-hover:opacity-95 transition-opacity">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 gap-2">
            <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
            <span className="text-xs font-medium">No image available</span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 block">
            Vendor: {sellerName}
          </span>
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight line-clamp-2 min-h-[40px]">
            {name}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <p className="text-base font-mono font-bold text-zinc-900">
            ${(price / 100).toFixed(2)}
          </p>
          
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="h-9 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 font-semibold shadow-sm px-4 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

    </div>
  );
}