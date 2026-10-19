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
        <div className="w-24 h-24 rounded-full bg-[#DCF5E9] flex items-center justify-center mb-6 border border-[#E5EEE8]">
          <ShoppingCart className="w-10 h-10 text-[#0F8A63]" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-brand-dark mb-2">Your Cart is Empty</h2>
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
    <div className="flex flex-col flex-1">
      
      {/* Checkout Header / Progress */}
      <div className="bg-white/90 backdrop-blur-md border-b border-[#E5EEE8] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="font-heading font-black text-brand-dark text-sm sm:text-base tracking-tight">
            KSTC Checkout
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2 text-[#0F8A63]">
              <span className="w-5 h-5 rounded-full bg-[#0F8A63] text-white flex items-center justify-center text-[10px] font-black">1</span>
              Cart
            </div>
            <div className="w-8 h-px bg-[#E5EEE8]"></div>
            <div className="flex items-center gap-2 text-brand-text-muted">
              <span className="w-5 h-5 rounded-full border border-[#E5EEE8] flex items-center justify-center text-[10px]">2</span>
              Details
            </div>
            <div className="w-8 h-px bg-[#E5EEE8]"></div>
            <div className="flex items-center gap-2 text-brand-text-muted">
              <span className="w-5 h-5 rounded-full border border-[#E5EEE8] flex items-center justify-center text-[10px]">3</span>
              Payment
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#0F8A63] text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> 256-Bit Secure
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-10">
        
        {/* Left: Cart Items */}
        <div className="flex-1 flex flex-col gap-4">
          
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E5EEE8]">
              <h2 className="text-lg sm:text-xl font-black font-heading text-brand-dark tracking-tight">Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h2>
              <button 
                type="button"
                onClick={clearCart} 
                className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Clear All
              </button>
            </div>
            
            {/* Cart Items */}
            <div className="divide-y divide-[#E5EEE8]">
              {items.map((item) => {
                const itemPrice = item.isTradeUser && item.bulkPrice ? item.bulkPrice : item.unitPrice;
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-5">
                    <Link href={`/product/${item.id}`} className="w-20 h-20 bg-[#FAF8F2] rounded-2xl flex items-center justify-center border border-[#E5EEE8] shrink-0 hover:border-[#0F8A63] transition-colors">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Item</span>
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="text-[10px] font-bold text-[#0F8A63] uppercase tracking-widest mb-0.5">{item.brand}</div>
                          <Link href={`/product/${item.id}`}>
                            <h3 className="font-heading font-bold text-brand-dark hover:text-[#0F8A63] transition-colors text-sm">{item.title}</h3>
                          </Link>
                          {item.specs && <div className="text-xs text-brand-text-muted mt-0.5">{item.specs}</div>}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-heading font-black text-base sm:text-lg text-brand-dark">{formatPrice(itemPrice * item.quantity)}</div>
                          {item.isTradeUser && item.bulkPrice && (
                            <div className="text-[9px] text-[#0F8A63] font-bold bg-[#DCF5E9] border border-[#E5EEE8] px-2 py-0.5 rounded-md uppercase tracking-wider mt-1 inline-block">Bulk Trade Price</div>
                          )}
                          <div className="text-[10px] text-brand-text-muted mt-0.5">{formatPrice(itemPrice)} × {item.quantity}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center border border-[#E5EEE8] rounded-xl overflow-hidden h-8 bg-white shadow-xs">
                          <button 
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="px-2.5 text-brand-text-muted hover:bg-[#DCF5E9] hover:text-[#0F8A63] h-full font-bold transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center font-heading font-bold text-xs text-brand-dark">{item.quantity}</span>
                          <button 
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="px-2.5 text-brand-text-muted hover:bg-[#DCF5E9] hover:text-[#0F8A63] h-full font-bold transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFromCart(item.id)} 
                          className="text-brand-text-muted hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider cursor-pointer"
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
          <Link href="/category/all-products" className="inline-flex items-center gap-1 text-xs font-bold text-[#0F8A63] hover:text-[#0B7453] uppercase tracking-wider self-start mt-2">
            &larr; Continue Shopping
          </Link>
          
        </div>

        {/* Right: Order Summary (Glass) */}
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 sticky top-20 border border-[#E5EEE8] shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-base uppercase tracking-wider mb-5">Order Summary</h3>
            
            <div className="space-y-3 text-xs sm:text-sm mb-5 pb-5 border-b border-[#E5EEE8]">
              <div className="flex justify-between text-brand-text font-medium">
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                <span className="font-bold text-brand-dark">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-text font-medium">
                <span>GST (18%)</span>
                <span className="font-bold text-brand-dark">{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between text-brand-text font-medium">
                <span>Local Gwalior Delivery</span>
                <span className="font-bold text-[#0F8A63] uppercase text-xs">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-heading font-black text-sm uppercase tracking-wider text-brand-dark">Estimated Total</span>
              <span className="font-heading font-black text-2xl text-[#0F8A63]">{formatPrice(total)}</span>
            </div>

            <Link href="/checkout">
              <Button variant="solid" size="lg" className="w-full font-heading font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md group py-3.5">
                Proceed to Checkout <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform inline-block" />
              </Button>
            </Link>
            
            <div className="mt-5 pt-5 border-t border-[#E5EEE8] flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs text-brand-text-muted font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#0F8A63] shrink-0" /> Authorized Factory Distributor Guarantee
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-text-muted font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#0F8A63] shrink-0" /> Fast Local Fulfillment in 24 Hours
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
