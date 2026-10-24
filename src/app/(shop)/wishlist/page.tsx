"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { Heart, ChevronRight, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "@/providers/WishlistProvider";
import { useCart } from "@/providers/CartProvider";
import { useState } from "react";

export default function WishlistPage() {
  const { items, toggleWishlist, clearWishlist, isLoggedIn } = useWishlist();
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleMoveToCart = async (item: (typeof items)[0]) => {
    const added = await addToCart({
      id: item.id,
      title: item.title,
      brand: item.brand,
      category: item.category,
      imageUrl: item.imageUrl,
      unitPrice: item.unitPrice,
      specs: item.specs,
      isTradeUser: false,
    });
    if (added) {
      setAddedIds((prev) => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [item.id]: false }));
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 pb-6 md:px-8">
        <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#0F8A63]" />
          <span className="text-[#0F8A63] font-black">Wishlist</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark font-heading tracking-tight">
              My Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-brand-text-muted mt-2 max-w-xl font-medium">
              Saved pipes, sanitary ware, and fittings for quick re-ordering and contractor quotation.
            </p>
          </div>
          {isLoggedIn && items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs font-bold text-red-600 hover:text-red-700 underline uppercase tracking-wider cursor-pointer"
            >
              Clear All ({items.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Wishlist Content */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
        {!isLoggedIn ? (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] shadow-xs p-10 sm:p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#DCF5E9] flex items-center justify-center mb-6 border border-[#E5EEE8] shadow-xs">
              <Heart className="w-9 h-9 text-[#0F8A63]" />
            </div>
            <h2 className="text-2xl font-black font-heading text-brand-dark mb-2 tracking-tight">
              Sign In to View Your Wishlist
            </h2>
            <p className="text-sm text-brand-text-muted max-w-md mb-8 leading-relaxed">
              Your saved fixtures and products are kept securely in your account. Please log in to manage your wishlist.
            </p>
            <Link href="/login?redirect=/wishlist">
              <Button
                variant="solid"
                size="lg"
                className="font-heading font-black text-xs uppercase tracking-wider px-8 py-3.5 shadow-sm"
              >
                Sign In / Register &rarr;
              </Button>
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] shadow-xs p-10 sm:p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#DCF5E9] flex items-center justify-center mb-6 border border-[#E5EEE8] shadow-xs">
              <Heart className="w-9 h-9 text-[#0F8A63]" />
            </div>
            <h2 className="text-2xl font-black font-heading text-brand-dark mb-2 tracking-tight">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-brand-text-muted max-w-md mb-8 leading-relaxed">
              You haven&apos;t saved any products to your wishlist yet. Click the heart icon on any product in our store to save it for later.
            </p>
            <Link href="/category/all-products">
              <Button
                variant="solid"
                size="lg"
                className="font-heading font-black text-xs uppercase tracking-wider px-8 py-3.5 shadow-sm"
                icon={<ShoppingBag className="w-4 h-4" />}
              >
                Explore Store Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E5EEE8] p-5 shadow-xs flex flex-col justify-between group hover:border-[#0F8A63]/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#0F8A63] bg-[#DCF5E9] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {item.brand}
                    </span>
                    <button
                      onClick={() => toggleWishlist(item)}
                      className="p-1 text-brand-text-muted hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Link href={`/product/${item.id}`}>
                    <h3 className="font-heading font-bold text-sm text-brand-dark group-hover:text-brand-primary transition-colors line-clamp-2 mb-1">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="text-[10px] text-brand-text-muted uppercase tracking-wider mb-3">
                    {item.category}
                  </div>
                  {item.specs && (
                    <div className="text-xs text-brand-text-muted mb-4 line-clamp-1">
                      {item.specs}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E5EEE8] flex items-center justify-between gap-3">
                  <div className="font-heading font-black text-base text-brand-dark">
                    {formatPrice(item.unitPrice)}
                  </div>
                  <Button
                    variant="solid"
                    size="sm"
                    className="text-xs font-bold"
                    onClick={() => handleMoveToCart(item)}
                  >
                    {addedIds[item.id] ? (
                      "Added!"
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
