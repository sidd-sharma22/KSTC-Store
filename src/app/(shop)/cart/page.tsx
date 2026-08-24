"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { Trash2, ChevronRight, Lock, CheckCircle2, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "@/providers/CartProvider";

export default function CartCheckoutPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, subtotal } = useCart();

  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center py-24 px-4">
        <div className="w-24 h-24 rounded-full bg-brand-background flex items-center justify-center mb-6 border-2 border-brand-border">
          <ShoppingCart className="w-10 h-10 text-brand-text/30" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-brand-primary mb-2">Your Cart is Empty</h2>
        <p className="text-brand-text/60 mb-8 text-center max-w-sm">
          Looks like you haven&apos;t added anything yet. Browse our catalog and find the products you need.
        </p>
        <Link href="/category/all-products">
          <Button variant="solid" size="lg">
            Start Shopping &rarr;
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-brand-background">
      
      {/* Checkout Header / Progress */}
      <div className="bg-white border-b border-brand-border/50 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-heading font-bold text-brand-primary">
            KSTC Checkout
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2 text-brand-primary">
              <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs">1</span>
              Cart
            </div>
            <div className="w-10 h-px bg-brand-border"></div>
            <div className="flex items-center gap-2 text-brand-text/40">
              <span className="w-6 h-6 rounded-full border-2 border-brand-border flex items-center justify-center text-xs">2</span>
              Details
            </div>
            <div className="w-10 h-px bg-brand-border"></div>
            <div className="flex items-center gap-2 text-brand-text/40">
              <span className="w-6 h-6 rounded-full border-2 border-brand-border flex items-center justify-center text-xs">3</span>
              Payment
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <Lock className="w-4 h-4" /> Secure
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-12">
        
        {/* Left: Cart Items */}
        <div className="flex-1 flex flex-col gap-4">
          
          <div className="bg-white rounded-2xl border border-brand-border/50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-heading text-brand-primary">Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h2>
              <button 
                onClick={clearCart} 
                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>
            
            {/* Cart Items */}
            <div className="divide-y divide-brand-border/50">
              {items.map((item) => {
                const itemPrice = item.isTradeUser && item.bulkPrice ? item.bulkPrice : item.unitPrice;
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-5">
                    <Link href={`/product/${item.id}`} className="w-24 h-24 bg-brand-background rounded-xl flex items-center justify-center border border-brand-border shrink-0 hover:border-brand-accent transition-colors">
                      <span className="text-[10px] text-brand-text/40">Image</span>
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] text-brand-text/50 uppercase tracking-wider mb-1">{item.brand}</div>
                          <Link href={`/product/${item.id}`}>
                            <h3 className="font-semibold text-brand-primary hover:text-brand-accent transition-colors">{item.title}</h3>
                          </Link>
                          {item.specs && <div className="text-xs text-brand-text/60 mt-1">{item.specs}</div>}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-brand-primary">{formatPrice(itemPrice * item.quantity)}</div>
                          {item.isTradeUser && item.bulkPrice && (
                            <div className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded uppercase mt-1 inline-block">Trade Price</div>
                          )}
                          <div className="text-[10px] text-brand-text/50 mt-0.5">{formatPrice(itemPrice)} × {item.quantity}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center border border-brand-border rounded-lg overflow-hidden h-9">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="px-3 text-brand-text/50 hover:bg-brand-background hover:text-brand-primary h-full font-bold transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-12 text-center font-bold text-sm text-brand-primary">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="px-3 text-brand-text/50 hover:bg-brand-background hover:text-brand-primary h-full font-bold transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="text-brand-text/40 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Continue Shopping */}
          <Link href="/category/all-products" className="text-sm font-semibold text-brand-accent hover:underline self-start">
            &larr; Continue Shopping
          </Link>
          
        </div>

        {/* Right: Order Summary (Glass) */}
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <div className="glass-panel rounded-2xl p-6 sticky top-24 border border-white/60 shadow-lg">
            <h3 className="font-heading font-bold text-brand-primary text-lg mb-6">Order Summary</h3>
            
            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-brand-border/40">
              <div className="flex justify-between text-brand-text/80">
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                <span className="font-semibold text-brand-primary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-text/80">
                <span>GST (18%)</span>
                <span className="font-semibold text-brand-primary">{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between text-brand-text/80">
                <span>Local Delivery</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-brand-primary">Total</span>
              <span className="font-bold text-2xl text-brand-primary">{formatPrice(total)}</span>
            </div>

            <Link href="/checkout">
              <Button variant="solid" size="lg" className="w-full font-bold text-base shadow-md group">
                Proceed to Details <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform inline-block" />
              </Button>
            </Link>
            
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-brand-text/60">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Authorized Distributor Guarantee
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-text/60">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Easy Returns within 7 days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
