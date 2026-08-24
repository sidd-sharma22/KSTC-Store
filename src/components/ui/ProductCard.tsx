"use client";

import Link from "next/link";
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
    <div className="bg-white rounded-2xl border border-brand-border/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group relative">
      
      {/* Brand Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-white/90 backdrop-blur-sm text-brand-primary text-[10px] font-bold px-2.5 py-1 rounded-lg border border-brand-border shadow-sm uppercase tracking-wider">
          {brand}
        </span>
      </div>
      
      {/* Favorite Action */}
      <button className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-brand-text/40 hover:text-red-500 hover:bg-white transition-colors border border-brand-border shadow-sm">
        <Heart className="w-4 h-4" />
      </button>

      {/* Image Area */}
      <Link href={`/product/${id}`} className="relative aspect-square w-full bg-brand-background/50 p-4 block overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-6 group-hover:scale-105 transition-transform duration-500">
          <div className="w-full h-full bg-brand-border/20 rounded-xl flex items-center justify-center text-brand-text/30">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
            ) : (
              <span className="font-heading text-sm">Product Image</span>
            )}
          </div>
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-[10px] font-medium text-brand-text/50 uppercase tracking-widest mb-1">
          {category}
        </div>
        
        <Link href={`/product/${id}`}>
          <h3 className="font-heading font-semibold text-brand-primary line-clamp-2 leading-snug mb-1 group-hover:text-brand-accent transition-colors">
            {title}
          </h3>
        </Link>
        
        {specs && (
          <p className="text-xs text-brand-text/60 mb-3 truncate">
            {specs}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-end justify-between">
          <div className="flex flex-col">
            {isTradeUser && bulkPrice && bulkMinQty ? (
              <>
                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded uppercase tracking-wider w-fit mb-1">
                  Trade Price
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-brand-primary">{formatPrice(bulkPrice)}</span>
                  <span className="text-xs text-brand-text/50">/ unit</span>
                </div>
                <span className="text-[10px] text-brand-text/50 mt-0.5">
                  Min. qty: {bulkMinQty} (Retail: {formatPrice(unitPrice)})
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-brand-text/50 font-medium mb-0.5">MRP</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-brand-primary">{formatPrice(unitPrice)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-brand-border/40 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!inStock || justAdded}
            className={`w-full inline-flex items-center justify-center font-medium rounded-xl py-2.5 px-5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
              justAdded
                ? "bg-green-500 text-white focus:ring-green-500/50"
                : !inStock
                ? "bg-gray-200 text-gray-500 opacity-50"
                : "bg-brand-primary text-white hover:bg-brand-primary/90 focus:ring-brand-primary/50 shadow-sm"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 mr-2" /> Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
