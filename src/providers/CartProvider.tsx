"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/auth";

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
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<boolean>;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isLoggedIn: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load and synchronize user-specific cart based on the authenticated session
  const syncCartWithUser = useCallback(async () => {
    try {
      const user = await getCurrentUserAction();
      const currentUid = user?.userId || null;
      setUserId(currentUid);
      setIsLoggedIn(!!currentUid);

      if (currentUid) {
        // User is logged in: read user-specific cart storage
        try {
          const userKey = `kstc-cart-${currentUid}`;
          const saved = localStorage.getItem(userKey);
          if (saved) {
            setItems(JSON.parse(saved));
          } else {
            setItems([]);
          }
        } catch {
          setItems([]);
        }
      } else {
        // Logged out: strictly empty cart. Never show previous user's cart
        setItems([]);
      }
    } catch {
      setUserId(null);
      setIsLoggedIn(false);
      setItems([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync on route changes and mount
  useEffect(() => {
    syncCartWithUser();

    // Listen for custom auth events (login/logout)
    const handleAuthChange = () => {
      syncCartWithUser();
    };
    window.addEventListener("kstc:auth-change", handleAuthChange);
    return () => window.removeEventListener("kstc:auth-change", handleAuthChange);
  }, [pathname, syncCartWithUser]);

  // Persist items whenever items change AND user is logged in
  useEffect(() => {
    if (isHydrated && userId) {
      try {
        localStorage.setItem(`kstc-cart-${userId}`, JSON.stringify(items));
      } catch {
        // ignore storage errors
      }
    }
  }, [items, isHydrated, userId]);

  const addToCart = useCallback(
    async (item: Omit<CartItem, "quantity">, quantity = 1): Promise<boolean> => {
      // Check if user is authenticated
      let activeUid = userId;
      if (!activeUid) {
        const user = await getCurrentUserAction();
        if (!user?.userId) {
          const returnUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
          router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
          return false;
        }
        activeUid = user.userId;
        setUserId(activeUid);
        setIsLoggedIn(true);
      }

      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
      return true;
    },
    [userId, router]
  );

  const removeFromCart = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    []
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
    if (userId) {
      try {
        localStorage.removeItem(`kstc-cart-${userId}`);
      } catch {
        // ignore
      }
    }
  }, [userId]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = items.reduce((sum, i) => {
    const price = i.isTradeUser && i.bulkPrice ? i.bulkPrice : i.unitPrice;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isLoggedIn,
      }}
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
