"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight, FileText, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { getOrderByIdAction } from "@/app/actions/order";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        // Fallback to sessionStorage if navigated from legacy flow
        try {
          const raw = sessionStorage.getItem("kstc-order");
          if (raw) {
            setOrder(JSON.parse(raw));
            sessionStorage.removeItem("kstc-order");
          }
        } catch {
          // ignore
        }
        setLoading(false);
        return;
      }

      const res = await getOrderByIdAction(orderId);
      if (res.success && res.order) {
        setOrder(res.order);
      }
      setLoading(false);
    }

    loadOrder();

    // Auto-poll every 5 seconds to detect real bill upload without requiring manual page reload
    if (!orderId) return;
    const interval = setInterval(async () => {
      const res = await getOrderByIdAction(orderId);
      if (res.success && res.order) {
        setOrder((prev: any) => {
          // If real bill just arrived, update state
          if (!prev?.realBillUrl && res.order.realBillUrl) {
            return res.order;
          }
          return res.order;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center py-24 px-4">
        <div className="w-16 h-16 rounded-full border-4 border-[#0F8A63] border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-brand-text-muted font-bold">Verifying order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center py-24 px-4">
        <h2 className="text-2xl font-bold font-heading text-brand-dark mb-2">No Order Found</h2>
        <p className="text-brand-text/60 mb-8 text-center max-w-sm">
          It looks like you haven&apos;t placed an order recently or this confirmation link is expired.
        </p>
        <Link href="/category/all-products">
          <Button variant="solid" size="lg">Browse Store Catalog &rarr;</Button>
        </Link>
      </div>
    );
  }

  const itemsList = order.items || [];
  const totalAmount = order.totalAmount || order.total || 0;
  const orderRef = order.id || order.orderNumber || "KSTC-ORDER";
  const address = order.shippingAddress || order.deliveryDetails;
  const hasRealBill = !!order.realBillUrl;

  return (
    <div className="flex flex-col flex-1 items-center py-12 md:py-20 px-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#DCF5E9] border border-[#E5EEE8] flex items-center justify-center shadow-xs">
              <CheckCircle className="w-10 h-10 text-[#0F8A63]" />
            </div>
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 1.5, repeat: 2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-[#0F8A63]/60"
            />
          </div>
        </motion.div>

        {/* Success Heading */}
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-[#0F8A63] bg-[#DCF5E9] px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
            Order Confirmed &amp; In Fulfillment Queue
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading text-brand-dark mb-2 tracking-tight">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted max-w-md mx-auto">
            Order Reference: <strong className="text-brand-dark">{orderRef}</strong>. A dispatch notification has been scheduled for fulfillment.
          </p>
        </div>

        {/* BILLING DOWNLOAD & DISPATCH SECTION */}
        <div className="mb-6">
          {hasRealBill ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 sm:p-6 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white border-2 border-emerald-500/40 rounded-3xl shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="font-heading font-black text-sm text-emerald-900 uppercase tracking-wide">
                      Official Real Tax Invoice Ready
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-md">
                    Our accounts department has verified and uploaded your finalized GST Tax Invoice (
                    {order.realBillFilename || "Tax Invoice"}). A copy has also been emailed to you.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <a
                    href={order.realBillUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F8A63] hover:bg-[#0B7453] text-white rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4" /> Download Official Real Bill
                  </a>
                  <a
                    href={`/api/orders/${order.id}/temporary-bill`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[#E5EEE8] hover:border-brand-primary text-brand-text-muted hover:text-brand-dark rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Temp Bill
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-5 sm:p-6 bg-[#FFF9E6] border-2 border-amber-300/70 rounded-3xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                    <span className="font-heading font-black text-xs sm:text-sm text-amber-950 uppercase tracking-wide">
                      Temporary System-Generated Bill Ready
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-amber-900/90 leading-relaxed max-w-lg">
                    &ldquo;this bill is system generated and temporary, your real bill will be sent to your provided email-id or mobile number soon&rdquo;
                  </p>
                  <p className="text-[11px] text-amber-800/70 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Accounts team is finalizing your invoice. This page will update automatically once uploaded.
                  </p>
                </div>
                <div className="shrink-0">
                  <a
                    href={`/api/orders/${order.id}/temporary-bill`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-xs transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-950" /> Download Temporary Bill
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5EEE8] mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-dark">
              <Package className="w-4 h-4 text-brand-primary" />
              <span>Order Summary ({itemsList.length} Items)</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
              {order.status || "CONFIRMED"}
            </span>
          </div>

          {/* Items List */}
          <div className="divide-y divide-[#E5EEE8] mb-6">
            {itemsList.map((item: any, i: number) => {
              const title = item.product?.title || item.title || "Product Item";
              const brand = item.product?.brand || item.brand || "KSTC";
              const qty = item.quantity || 1;
              const price = item.unitPrice ? item.unitPrice * qty : 0;

              return (
                <div key={i} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-brand-dark block">{title}</span>
                    <span className="text-[10px] text-brand-text-muted">
                      Brand: {brand} &bull; Qty: {qty}
                    </span>
                  </div>
                  {price > 0 && <span className="font-heading font-bold text-brand-dark">{formatPrice(price)}</span>}
                </div>
              );
            })}
          </div>

          {/* Breakdown */}
          <div className="bg-[#FAF8F2] p-4 rounded-2xl border border-[#E5EEE8] space-y-2 text-xs mb-6">
            <div className="flex justify-between text-brand-text-muted">
              <span>Payment Method:</span>
              <span className="font-bold text-brand-dark">{order.paymentMethod || "CASHFREE"}</span>
            </div>
            <div className="flex justify-between text-brand-text-muted">
              <span>Delivery Type:</span>
              <span className="font-bold text-brand-dark">{order.deliveryType || "DELIVERY"}</span>
            </div>
            <div className="flex justify-between text-base font-black font-heading text-brand-dark pt-2 border-t border-[#E5EEE8]">
              <span>Total Paid / Payable:</span>
              <span className="text-brand-primary">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          {/* Delivery Address if present */}
          {address && (
            <div className="flex items-start gap-3 p-3.5 bg-white border border-[#E5EEE8] rounded-xl text-xs text-brand-text-muted">
              <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-brand-dark block">Destination / Contact:</span>
                <span>
                  {address.street || address.address}, {address.city || "Gwalior"}, {address.state || "MP"} {address.pincode}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Next Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/orders">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider">
              Track All My Orders
            </Button>
          </Link>
          <Link href="/category/all-products">
            <Button variant="solid" size="lg" className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider">
              Continue Shopping &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col flex-1 items-center justify-center py-24 px-4">
          <div className="w-16 h-16 rounded-full border-4 border-[#0F8A63] border-t-transparent animate-spin mb-4" />
          <p className="text-sm text-brand-text-muted font-bold">Loading order confirmation...</p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
