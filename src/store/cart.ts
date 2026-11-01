"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItem {
  /** Product ID from the database */
  productId: string;
  /** Variant ID (ProductVariant PK = product + color + size) */
  variantId: string;
  /** Display info – kept in cart for UI rendering */
  name: string;
  slug: string;
  image: string;
  colorName: string;
  colorHex: string;
  sizeName: string;
  /** Unit price at the time of adding (for display only – recalculated server-side at checkout) */
  unitPrice: number;
  /** Discounted unit price at add time (display only) */
  discountedPrice: number | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  // Derived
  totalItems: () => number;
  subtotal: () => number;
}

// ─── Store ───────────────────────────────────────────────────────────────────

/**
 * Zustand cart store with localStorage persistence.
 *
 * IMPORTANT: Prices stored here are for display only.
 * At checkout, the server recalculates all prices from the database.
 * Never trust frontend cart values for payment or inventory decisions.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === newItem.variantId
          );
          if (existing) {
            // Increment quantity if same variant already in cart
            return {
              items: state.items.map((i) =>
                i.variantId === newItem.variantId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.variantId !== variantId),
            };
          }
          return {
            items: state.items.map((i) =>
              i.variantId === variantId ? { ...i, quantity } : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, item) => {
          const price = item.discountedPrice ?? item.unitPrice;
          return sum + price * item.quantity;
        }, 0),
    }),
    {
      name: "seen-hijabi-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

