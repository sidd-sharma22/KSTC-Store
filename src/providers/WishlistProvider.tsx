"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/auth";

export interface WishlistItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  imageUrl: string;
  unitPrice: number;
  specs?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => Promise<boolean>;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  totalWishlistItems: number;
  isLoggedIn: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load and synchronize user-specific wishlist based on the authenticated session
  const syncWishlistWithUser = useCallback(async () => {
    try {
      const user = await getCurrentUserAction();
      const currentUid = user?.userId || null;
      setUserId(currentUid);
      setIsLoggedIn(!!currentUid);

      if (currentUid) {
        // User is logged in: read user-specific wishlist storage
        try {
          const userKey = `kstc-wishlist-${currentUid}`;
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
        // Logged out: strictly empty wishlist. Never show previous user's wishlist
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
    syncWishlistWithUser();

    // Listen for custom auth events (login/logout)
    const handleAuthChange = () => {
      syncWishlistWithUser();
    };
    window.addEventListener("kstc:auth-change", handleAuthChange);
    return () => window.removeEventListener("kstc:auth-change", handleAuthChange);
  }, [pathname, syncWishlistWithUser]);

  // Persist items whenever items change AND user is logged in
  useEffect(() => {
    if (isHydrated && userId) {
      try {
        localStorage.setItem(`kstc-wishlist-${userId}`, JSON.stringify(items));
      } catch {
        // ignore storage errors
      }
    }
  }, [items, isHydrated, userId]);

  const toggleWishlist = useCallback(
    async (item: WishlistItem): Promise<boolean> => {
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
        const exists = prev.some((i) => i.id === item.id);
        if (exists) {
          return prev.filter((i) => i.id !== item.id);
        }
        return [...prev, item];
      });
      return true;
    },
    [userId, router]
  );

  const isInWishlist = useCallback(
    (id: string) => {
      return items.some((i) => i.id === id);
    },
    [items]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
    if (userId) {
      try {
        localStorage.removeItem(`kstc-wishlist-${userId}`);
      } catch {
        // ignore
      }
    }
  }, [userId]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        totalWishlistItems: items.length,
        isLoggedIn,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
