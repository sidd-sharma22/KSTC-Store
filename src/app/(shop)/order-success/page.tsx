"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface OrderData {
  orderNumber: string;
  items: { title: string; quantity: number; brand: string }[];
  totalItems: number;
  subtotal: number;
  gst: number;
  total: number;
  deliveryDetails: {
    firstName: string; lastName: string; email: string; phone: string;
    address: string; city: string; state: string; pincode: string;
  };
  paymentMethod: string;
  date: string;
}

const PAYMENT_LABELS: Record<string, string> = {
  "pay-later": "Pay Later (Credit Account)",
  "bank-transfer": "Bank Transfer (NEFT/RTGS/IMPS)",
  "razorpay": "Online Payment (Razorpay)",
  "cod": "Cash on Delivery / Pickup",
};

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem("kstc-order");
        if (raw) {
          setOrder(JSON.parse(raw));
          // Clear after reading so refreshing won't show stale data
          sessionStorage.removeItem("kstc-order");
        }
      } catch {
        // ignore
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  // No order data — user navigated here directly
  if (!order) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center py-24 px-4">
        <h2 className="text-2xl font-bold font-heading text-brand-dark mb-2">No Order Found</h2>
        <p className="text-brand-text/60 mb-8 text-center max-w-sm">
          It looks like you haven&apos;t placed an order yet, or this page has already been viewed.
        </p>
        <Link href="/category/all-products">
          <Button variant="solid" size="lg">Browse Shop &rarr;</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center py-12 md:py-20 px-4">
      <div className="max-w-2xl w-full">

        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#DCF5E9] border border-[#E5EEE8] flex items-center justify-center shadow-xs">
              <CheckCircle className="w-12 h-12 text-[#0F8A63]" />
            </div>
            {/* Pulse ring */}
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 1.5, repeat: 2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-[#0F8A63]/60"
            />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-brand-dark mb-3 tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-brand-text-muted text-base sm:text-lg font-medium">
            Thank you for choosing KSTC. Our dispatch team will process your order promptly.
          </p>
        </motion.div>

        {/* Order Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] shadow-xs overflow-hidden"
        >
          {/* Order Number Bar */}
          <div className="bg-[#0F8A63] px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#FAF8F2] uppercase tracking-widest font-bold">Order Reference</div>
              <div className="text-base sm:text-lg font-black text-white font-heading">{order.orderNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#FAF8F2] uppercase tracking-widest font-bold">Booking Date</div>
              <div className="text-xs sm:text-sm font-semibold text-white">
                {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Items */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F8A63] uppercase tracking-widest mb-3">
                <Package className="w-4 h-4" /> Items Ordered
              </div>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs sm:text-sm py-2 border-b border-[#E5EEE8] last:border-0">
                    <div>
                      <span className="font-bold text-brand-dark">{item.title}</span>
                      <span className="text-brand-text-muted ml-2 text-xs">({item.brand})</span>
                    </div>
                    <span className="text-brand-text font-bold">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mb-6 p-5 bg-[#FAF8F2] rounded-2xl border border-[#E5EEE8]">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-brand-text font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-brand-dark">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-text font-medium">
                  <span>GST (18%)</span>
                  <span className="font-bold text-brand-dark">{formatPrice(order.gst)}</span>
                </div>
                <div className="flex justify-between text-brand-text font-medium">
                  <span>Local Gwalior Delivery</span>
                  <span className="font-bold text-[#0F8A63] uppercase text-xs">Free</span>
                </div>
                <div className="flex justify-between pt-3 mt-3 border-t border-[#E5EEE8]">
                  <span className="font-heading font-black text-sm uppercase tracking-wider text-brand-dark">Total Amount</span>
                  <span className="font-heading font-black text-xl text-[#0F8A63]">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F8A63] uppercase tracking-widest mb-2.5">
                  <MapPin className="w-4 h-4" /> Delivery Address
                </div>
                <div className="text-xs sm:text-sm text-brand-text-muted space-y-1">
                  <div className="font-bold text-brand-dark">
                    {order.deliveryDetails.firstName} {order.deliveryDetails.lastName}
                  </div>
                  <div>{order.deliveryDetails.address}</div>
                  <div>{order.deliveryDetails.city}, {order.deliveryDetails.state} - {order.deliveryDetails.pincode}</div>
                  <div className="font-medium text-[#0F8A63]">{order.deliveryDetails.phone}</div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F8A63] uppercase tracking-widest mb-2.5">
                  <CreditCard className="w-4 h-4" /> Payment Method
                </div>
                <div className="text-xs sm:text-sm font-bold text-brand-dark">
                  {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                </div>
                <div className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                  Tax invoice copy dispatched to <strong className="text-[#0F8A63]">{order.deliveryDetails.email}</strong>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <Link href="/category/all-products" className="flex-1">
            <Button variant="solid" size="lg" className="w-full font-heading font-black text-xs uppercase tracking-wider py-3.5 group shadow-sm">
              Continue Shopping <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform inline-block" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full font-heading font-black text-xs uppercase tracking-wider py-3.5">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
