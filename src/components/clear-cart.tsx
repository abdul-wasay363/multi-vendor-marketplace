"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

export function ClearCart() {
  useEffect(() => {
    // The moment this invisible component renders, it empties the cart!
    useCartStore.getState().clearCart();
  }, []);

  return null; 
}