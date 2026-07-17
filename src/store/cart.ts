import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  sellerName: string;
  sellerId: string; // <-- ADD THIS!
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean; // 1. New State: Is the cart open?
  
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void; // 2. New Action: Change quantity
  clearCart: () => void;
  
  openCart: () => void;  // 3. New Action: Open menu
  closeCart: () => void; // 4. New Action: Close menu
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false, // Default to closed

      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find((item) => item.id === newItem.id);
        if (existingItem) {
          return {
            items: state.items.map((item) =>
              item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
            isOpen: true, // Auto-open the cart when they click "Buy"!
          };
        }
        return { 
          items: [...state.items, { ...newItem, quantity: 1 }],
          isOpen: true // Auto-open here too!
        };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      })),

      clearCart: () => set({ items: [] }),
      
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'marketplace-cart', 
      // We only want to persist the items, NOT the isOpen state. 
      // We don't want the cart flying open automatically when they refresh the page!
      partialize: (state) => ({ items: state.items }),
    }
  )
)