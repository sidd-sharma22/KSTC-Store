"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Package, MapPin, Clock, CheckCircle2, ChevronRight, FileText, ArrowRight, Download } from "lucide-react";
import { getUserOrdersAction } from "@/app/actions/order";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders(silent = false) {
      if (!silent) setLoading(true);
      const res = await getUserOrdersAction();
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
      if (!silent) setLoading(false);
    }
    loadOrders();

    // Auto-poll every 8 seconds to reflect newly uploaded real bills without requiring full reload
    const interval = setInterval(() => {
      loadOrders(true);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 pb-6 md:px-8">
        <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#0F8A63]" />
          <span className="text-[#0F8A63] font-black">My Orders</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-dark font-heading tracking-tight">
          Orders &amp; GST Invoices
        </h1>
        <p className="text-xs sm:text-sm text-brand-text-muted mt-1 font-medium">
          Track wholesale dispatches, order statuses, and download official or temporary tax invoices.
        </p>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
        {loading ? (
          <div className="p-12 text-center text-xs text-brand-text-muted font-bold">
            <div className="w-10 h-10 rounded-full border-3 border-[#0F8A63] border-t-transparent animate-spin mx-auto mb-3" />
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-brand-tint flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-brand-primary" />
            </div>
            <h2 className="text-xl font-bold font-heading text-brand-dark mb-1">No Orders Found</h2>
            <p className="text-xs text-brand-text-muted mb-6 leading-relaxed">
              You haven&apos;t placed any orders yet. Browse our wholesale catalog to order pipes, fittings, or sanitaryware.
            </p>
            <Link href="/category/all-products">
              <Button variant="solid" size="md">Explore Catalog &rarr;</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const items = order.items || [];
              const address = order.shippingAddress;
              const hasRealBill = !!order.realBillUrl;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#E5EEE8] p-6 shadow-xs flex flex-col justify-between hover:border-brand-primary/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5EEE8] gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-black text-base text-brand-dark">#{order.id.slice(-8)}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-tint text-brand-primary uppercase">
                          {order.paymentMethod}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : order.status === "SHIPPED"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-brand-text-muted mt-1 block">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")} &bull; Fulfillment: {order.deliveryType}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-heading font-black text-lg text-brand-primary block">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <span className="text-[10px] text-brand-text-muted">Incl. 18% GST</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-[#E5EEE8] mb-4">
                    {items.map((i: any) => (
                      <div key={i.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-brand-dark">{i.product.title}</span>
                          <span className="text-[10px] text-brand-text-muted block">
                            Brand: {i.product.brand} &bull; Qty: {i.quantity}
                          </span>
                        </div>
                        <span className="font-heading font-bold text-brand-dark">{formatPrice(i.unitPrice * i.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* BILLING ACTIONS & NOTICE */}
                  <div className="mb-4 p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8]">
                    {hasRealBill ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Official Tax Invoice Uploaded
                          </span>
                          <p className="text-[11px] text-brand-text-muted mt-0.5">
                            Uploaded by accounts on {order.realBillUploadedAt ? new Date(order.realBillUploadedAt).toLocaleDateString("en-IN") : "recently"}.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={order.realBillUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F8A63] hover:bg-[#0B7453] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Real Bill
                          </a>
                          <a
                            href={`/api/orders/${order.id}/temporary-bill`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand-text-muted hover:text-brand-dark underline px-2"
                          >
                            Temp Bill
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Temporary Estimate Bill Available
                          </div>
                          <p className="text-[11px] font-semibold text-amber-950 mt-0.5 max-w-xl">
                            &ldquo;this bill is system generated and temporary, your real bill will be sent to your provided email-id or mobile number soon&rdquo;
                          </p>
                        </div>
                        <a
                          href={`/api/orders/${order.id}/temporary-bill`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-2xs transition-colors whitespace-nowrap self-start sm:self-auto"
                        >
                          <FileText className="w-3.5 h-3.5" /> Download Temp Bill
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Destination & Action */}
                  <div className="pt-3 border-t border-[#E5EEE8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {address && (
                      <div className="flex items-center gap-2 text-brand-text-muted">
                        <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                        <span className="truncate max-w-md">
                          {address.street}, {address.city}, {address.state} {address.pincode}
                        </span>
                      </div>
                    )}
                    <Link href={`/order-success?order_id=${order.id}`} className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                      View Order Confirmation <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
