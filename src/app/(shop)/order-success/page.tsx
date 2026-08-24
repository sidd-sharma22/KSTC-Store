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
  }, []);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  // No order data — user navigated here directly
  if (!order) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center py-24 px-4">
        <h2 className="text-2xl font-bold font-heading text-brand-primary mb-2">No Order Found</h2>
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
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>
            {/* Pulse ring */}
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: 2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-green-400"
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
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-brand-primary mb-3">
            Order Placed Successfully!
          </h1>
          <p className="text-brand-text/70 text-lg">
            Thank you for your order. We&apos;ll process it shortly.
          </p>
        </motion.div>

        {/* Order Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-brand-border/50 shadow-sm overflow-hidden"
        >
          {/* Order Number Bar */}
          <div className="bg-brand-primary px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">Order Number</div>
              <div className="text-lg font-bold text-white font-heading">{order.orderNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">Date</div>
              <div className="text-sm font-semibold text-white">
                {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Items */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-text/50 uppercase tracking-widest mb-3">
                <Package className="w-4 h-4" /> Items Ordered
              </div>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-2 border-b border-brand-border/30 last:border-0">
                    <div>
                      <span className="font-medium text-brand-primary">{item.title}</span>
                      <span className="text-brand-text/50 ml-2 text-xs">({item.brand})</span>
                    </div>
                    <span className="text-brand-text/70 font-medium">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mb-6 p-4 bg-brand-background/50 rounded-xl border border-brand-border/50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-brand-text/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-primary">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-text/70">
                  <span>GST (18%)</span>
                  <span className="font-semibold text-brand-primary">{formatPrice(order.gst)}</span>
                </div>
                <div className="flex justify-between text-brand-text/70">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between pt-3 mt-3 border-t border-brand-border/50">
                  <span className="font-bold text-brand-primary">Total</span>
                  <span className="font-bold text-xl text-brand-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-brand-text/50 uppercase tracking-widest mb-3">
                  <MapPin className="w-4 h-4" /> Delivery Address
                </div>
                <div className="text-sm text-brand-text/80 space-y-1">
                  <div className="font-semibold text-brand-primary">
                    {order.deliveryDetails.firstName} {order.deliveryDetails.lastName}
                  </div>
                  <div>{order.deliveryDetails.address}</div>
                  <div>{order.deliveryDetails.city}, {order.deliveryDetails.state} - {order.deliveryDetails.pincode}</div>
                  <div>{order.deliveryDetails.phone}</div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-brand-text/50 uppercase tracking-widest mb-3">
                  <CreditCard className="w-4 h-4" /> Payment Method
                </div>
                <div className="text-sm font-semibold text-brand-primary">
                  {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                </div>
                <div className="text-xs text-brand-text/50 mt-1">
                  A confirmation email has been sent to {order.deliveryDetails.email}
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
            <Button variant="solid" size="lg" className="w-full font-bold group">
              Continue Shopping <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform inline-block" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
