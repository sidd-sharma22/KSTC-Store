"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  Building,
  CreditCard,
  ShoppingCart,
  Package,
  TrendingUp,
  Receipt,
  Plus,
  Check,
  Search,
  Warehouse,
  Coins,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { getDealerDashboardAction } from "@/app/actions/dealer";
import { useCart } from "@/providers/CartProvider";

export default function ShopOwnerDealerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"restock" | "orders" | "counter">("restock");

  // Counter billing calculator state
  const [counterCustomerName, setCounterCustomerName] = useState("");
  const [counterPlumberCode, setCounterPlumberCode] = useState("");
  const [counterTotal, setCounterTotal] = useState<number>(5000);
  const [counterPlumberCommission, setCounterPlumberCommission] = useState(250);

  const { addToCart } = useCart();
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadDealerData() {
      setLoading(true);
      const res = await getDealerDashboardAction();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load dealer portal.");
      }
      setLoading(false);
    }
    loadDealerData();
  }, []);

  const handleAddRestockItem = async (product: any, qty = 10) => {
    const added = await addToCart({
      id: product.id,
      title: product.title,
      brand: product.brand || "KSTC",
      category: product.category.name,
      imageUrl: "",
      unitPrice: product.dealerPrice || product.basePrice,
      isTradeUser: true,
    }, qty);

    if (added) {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
      }, 1500);
    }
  };

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#0F8A63] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs text-brand-text-muted font-bold">Connecting to Authorized Dealer Terminal...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto w-full px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black font-heading text-brand-dark mb-2">Shop Owner Trade Portal</h2>
        <p className="text-xs text-brand-text-muted mb-6 leading-relaxed">
          {error || "Access restricted to authorized plumbing & hardware shop dealers. Please log in with your verified trade account."}
        </p>
        <Link href="/login">
          <Button variant="solid" size="md">Sign In as Dealer &rarr;</Button>
        </Link>
      </div>
    );
  }

  const { dealer, wholesaleProducts, recentOrders } = data;

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 pb-6 md:px-8">
        <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-primary">Home</Link>
          <span>/</span>
          <span className="text-[#0F8A63] font-black">Authorized Dealer Portal</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-dark font-heading tracking-tight">
                {dealer.shopName || dealer.name}
              </h1>
              <span className="bg-[#DCF5E9] text-[#0F8A63] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-brand-primary/20 uppercase">
                Authorized Dealer
              </span>
            </div>
            <p className="text-xs text-brand-text-muted mt-1">
              GSTIN: <strong className="font-mono text-brand-dark">{dealer.gstNumber || "Registered Partner"}</strong> &bull; Warehouse Wholesale Depot
            </p>
          </div>
          <Link href="/cart">
            <Button variant="solid" size="sm" className="font-bold text-xs uppercase tracking-wider shadow-sm">
              <ShoppingCart className="w-4 h-4 mr-1.5" /> View Restock Cart
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 space-y-6">
        {/* Credit Line Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#E5EEE8] shadow-xs">
            <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
              Sanctioned Trade Credit Line
            </span>
            <span className="text-2xl sm:text-3xl font-black font-heading text-brand-dark">
              {formatPrice(dealer.creditLimit || 0)}
            </span>
            <span className="text-[10px] text-brand-text-muted block mt-2">KSTC Distributor Credit Line</span>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#E5EEE8] shadow-xs">
            <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
              Available Buying Power
            </span>
            <span className="text-2xl sm:text-3xl font-black font-heading text-brand-primary">
              {formatPrice(dealer.availableCredit || 0)}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold block mt-2">Ready for immediate restocking</span>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#E5EEE8] shadow-xs">
            <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
              Utilized Credit Balance
            </span>
            <span className="text-2xl sm:text-3xl font-black font-heading text-amber-600">
              {formatPrice(dealer.usedCredit || 0)}
            </span>
            <span className="text-[10px] text-brand-text-muted block mt-2">Pay Later 30-Day Cycle</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#E5EEE8] pb-2">
          <button
            onClick={() => setActiveTab("restock")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "restock" ? "bg-brand-primary text-white shadow-xs" : "bg-white text-brand-text hover:bg-[#FAF8F2]"
            }`}
          >
            Quick Wholesale Restock ({wholesaleProducts.length} SKUs)
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "orders" ? "bg-brand-primary text-white shadow-xs" : "bg-white text-brand-text hover:bg-[#FAF8F2]"
            }`}
          >
            Stock Invoices &amp; Shipments ({recentOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("counter")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "counter" ? "bg-brand-primary text-white shadow-xs" : "bg-white text-brand-text hover:bg-[#FAF8F2]"
            }`}
          >
            Local Counter Bill &amp; Plumber Tagging
          </button>
        </div>

        {/* Tab 1: Quick Wholesale Restock Table */}
        {activeTab === "restock" && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-black text-brand-dark text-sm uppercase tracking-wider">
                Factory-Direct Wholesale Stock Desk
              </h3>
              <span className="text-xs text-brand-text-muted">Wholesale pricing active for {dealer.shopName}</span>
            </div>

            <div className="divide-y divide-[#E5EEE8] overflow-x-auto">
              {wholesaleProducts.map((p: any) => {
                const wholesaleRate = p.dealerPrice || p.basePrice * 0.8;
                const margin = Math.round(p.basePrice - wholesaleRate);
                const isAdded = addedItemIds[p.id];

                return (
                  <div key={p.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-brand-dark">{p.title}</span>
                        <span className="text-[10px] font-bold text-brand-primary bg-brand-tint px-2 py-0.5 rounded">
                          {p.brand}
                        </span>
                      </div>
                      <span className="text-[11px] text-brand-text-muted block mt-0.5">
                        SKU: {p.sku} &bull; Warehouse Available: {p.stockCount} {p.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="text-right">
                        <span className="text-[10px] text-brand-text-muted block">MRP: {formatPrice(p.basePrice)}</span>
                        <span className="font-heading font-black text-sm text-brand-primary">
                          {formatPrice(wholesaleRate)}
                        </span>
                        <span className="text-[9px] text-emerald-700 font-bold block">Margin: +{formatPrice(margin)}/{p.unit}</span>
                      </div>

                      <Button
                        variant="solid"
                        size="sm"
                        className="text-xs font-bold whitespace-nowrap"
                        onClick={() => handleAddRestockItem(p, 10)}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" /> Added 10!
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 mr-1" /> Restock 10 {p.unit}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Recent Orders */}
        {activeTab === "orders" && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-sm uppercase tracking-wider mb-4">
              Restocking Orders &amp; GST Invoices
            </h3>
            {recentOrders.length === 0 ? (
              <p className="text-xs text-brand-text-muted p-8 text-center">
                No past wholesale replenishment orders found. Use the Quick Wholesale Restock desk above to order stock.
              </p>
            ) : (
              <div className="divide-y divide-[#E5EEE8] overflow-x-auto">
                {recentOrders.map((ord: any) => (
                  <div key={ord.id} className="py-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-black text-sm text-brand-dark">#{ord.id.slice(-8)}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-tint text-brand-primary uppercase">
                          {ord.paymentMethod}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          {ord.status}
                        </span>
                      </div>
                      <span className="text-brand-text-muted text-[11px] block mt-1">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN")} &bull; Items: {ord.items.length} SKUs
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-heading font-black text-sm text-brand-dark block">
                        {formatPrice(ord.totalAmount)}
                      </span>
                      <Link href={`/order-success?order_id=${ord.id}`} className="text-[11px] text-brand-primary hover:underline font-bold">
                        View GST Invoice &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Local Counter Bill & Plumber Tagging */}
        {activeTab === "counter" && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 sm:p-8 shadow-xs max-w-2xl">
            <h3 className="font-heading font-black text-brand-dark text-base uppercase tracking-wider mb-1 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-brand-primary" /> Walk-In Counter Sale with Plumber Referral
            </h3>
            <p className="text-xs text-brand-text-muted mb-6">
              When a local plumber brings a customer to your shop, calculate the sale here to credit 5% reward points directly to the plumber&apos;s KSTC wallet.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="Enter customer's full name"
                  value={counterCustomerName}
                  onChange={(e) => setCounterCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">
                  Referring Plumber ID or Mobile Number *
                </label>
                <input
                  type="text"
                  placeholder="Enter plumber referral code or phone number"
                  value={counterPlumberCode}
                  onChange={(e) => setCounterPlumberCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">Total Bill Amount (₹)</label>
                <input
                  type="number"
                  value={counterTotal}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCounterTotal(val);
                    setCounterPlumberCommission(Math.round(val * 0.05));
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-sm font-heading font-bold text-brand-dark focus:outline-none"
                />
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-800 block">Plumber Reward Points (5%)</span>
                  <span className="text-[11px] text-emerald-600">Convertible to direct cash transfer by plumber</span>
                </div>
                <span className="font-heading font-black text-lg text-emerald-700">
                  +{counterPlumberCommission} Points (₹{counterPlumberCommission})
                </span>
              </div>

              <Button
                variant="solid"
                className="w-full font-heading font-black text-xs uppercase tracking-wider py-3 shadow-sm"
                onClick={() => alert(`Plumber commission of ${counterPlumberCommission} points recorded for referral code ${counterPlumberCode || 'PLUM-1001'}!`)}
              >
                Record Plumber Tagged Counter Sale
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
