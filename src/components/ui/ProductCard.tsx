"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Check } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useState } from "react";

export interface ProductCardProps {
  id: string;
  title: string;
  brand: string;
  category: string;
  imageUrl: string;
  unitPrice: number;
  bulkPrice?: number;
  bulkMinQty?: number;
  inStock: boolean;
  specs?: string;
  isTradeUser?: boolean;
}

export default function ProductCard({
  id,
  title,
  brand,
  category,
  imageUrl,
  unitPrice,
  bulkPrice,
  bulkMinQty,
  inStock,
  specs,
  isTradeUser = false
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart({
      id,
      title,
      brand,
      category,
      imageUrl,
      unitPrice,
      bulkPrice,
      bulkMinQty,
      specs,
      isTradeUser,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-brand-border/80 hover:border-brand-teal/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group relative">
      
      {/* Brand Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-[#DCF5E9] text-[#0F8A63] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#0F8A63]/20 shadow-xs uppercase tracking-wider">
          {brand}
        </span>
      </div>
      
      {/* Favorite Action */}
      <button 
        type="button"
        aria-label="Add to favorites"
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-brand-text-muted hover:text-red-500 hover:bg-white transition-all border border-brand-border shadow-xs"
      >
        <Heart className="w-4 h-4" />
      </button>

      {/* Image Area */}
      <Link href={`/product/${id}`} className="relative h-44 sm:h-48 w-full bg-brand-cream/40 p-3 block overflow-hidden border-b border-brand-border/30">
        <div className="absolute inset-0 flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-500">
          <div className="relative w-full h-full bg-white/60 rounded-xl flex items-center justify-center text-brand-text-muted/40 overflow-hidden">
            {imageUrl ? (
              <Image src={imageUrl} alt={title} fill className="object-contain" sizes="(max-width: 768px) 100vw, 33vw" />
            ) : (
              <span className="font-heading text-xs uppercase tracking-wider">Product Image</span>
            )}
          </div>
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
        <div className="text-[10px] font-bold text-brand-teal uppercase tracking-widest mb-1">
          {category}
        </div>
        
        <Link href={`/product/${id}`}>
          <h3 className="font-heading font-bold text-brand-text line-clamp-1 leading-snug mb-1 group-hover:text-brand-primary transition-colors text-sm">
            {title}
          </h3>
        </Link>
        
        {specs && (
          <p className="text-xs text-brand-text-muted mb-2 truncate">
            {specs}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-end justify-between">
          <div className="flex flex-col">
            {isTradeUser && bulkPrice && bulkMinQty ? (
              <>
                <span className="text-[9.5px] text-[#0F8A63] font-bold bg-[#DCF5E9] border border-[#E5EEE8] px-2 py-0.5 rounded-md uppercase tracking-wider w-fit mb-1">
                  Bulk Trade Price
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-heading font-bold text-brand-primary">{formatPrice(bulkPrice)}</span>
                  <span className="text-xs text-brand-text-muted">/ unit</span>
                </div>
                <span className="text-[10px] text-brand-text-muted mt-0.5">
                  Min. qty: {bulkMinQty} (MRP: {formatPrice(unitPrice)})
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-brand-text-muted font-medium mb-0.5">MRP</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-heading font-bold text-brand-primary">{formatPrice(unitPrice)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3 pt-2.5 border-t border-brand-border/40 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!inStock || justAdded}
            className={`w-full inline-flex items-center justify-center font-bold rounded-xl py-2 px-3 text-xs tracking-wider uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
              justAdded
                ? "bg-brand-teal text-white focus:ring-brand-teal/50"
                : !inStock
                ? "bg-brand-border/60 text-brand-text-muted opacity-60"
                : "bg-brand-primary text-white hover:bg-brand-primary-hover active:scale-[0.98] focus:ring-brand-primary/50 shadow-sm hover:shadow-md"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 mr-1.5" /> Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1.5" />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
