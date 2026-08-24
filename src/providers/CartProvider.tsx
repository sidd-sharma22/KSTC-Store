"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface CartItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  imageUrl: string;
  unitPrice: number;
  bulkPrice?: number;
  bulkMinQty?: number;
  specs?: string;
  quantity: number;
  isTradeUser: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kstc-cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore parse errors
    }
    setIsHydrated(true);
  }, []);

  // Persist cart to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("kstc-cart", JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = items.reduce((sum, i) => {
    const price = i.isTradeUser && i.bulkPrice ? i.bulkPrice : i.unitPrice;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
