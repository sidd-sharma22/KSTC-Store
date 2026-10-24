"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Building,
  Coins,
  CheckCircle2,
  XCircle,
  Truck,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Search,
  Upload,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  getAdminOverviewAction,
  updateOrderStatusAction,
  approveDealerAction,
  processPlumberPayoutAction,
  uploadRealBillAction,
} from "@/app/actions/admin";
import { OrderStatus } from "@prisma/client";

export default function BusinessOwnerAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "dealers" | "payouts">("orders");

  // Action status message
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await getAdminOverviewAction();
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error || "Failed to load admin overview.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateOrder = async (orderId: string, status: OrderStatus) => {
    setActionLoading(true);
    const res = await updateOrderStatusAction(orderId, status);
    setActionLoading(false);
    if (res.success) {
      setActionMessage(res.message || "Order updated.");
      loadData();
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleApproveDealer = async (userId: string, approved: boolean, creditLimit = 200000) => {
    setActionLoading(true);
    const res = await approveDealerAction(userId, approved, creditLimit);
    setActionLoading(false);
    if (res.success) {
      setActionMessage(res.message || "Dealer status updated.");
      loadData();
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleProcessPayout = async (payoutId: string, status: "PAID" | "REJECTED") => {
    setActionLoading(true);
    const utr = prompt(
      status === "PAID" ? "Enter Bank UTR / IMPS Transfer Reference Number:" : "Confirm rejection reason:",
      status === "PAID" ? `IMPS-${Date.now().toString().slice(-8)}` : "Discrepancy"
    );
    if (utr === null) {
      setActionLoading(false);
      return;
    }
    const res = await processPlumberPayoutAction(payoutId, status, utr);
    setActionLoading(false);
    if (res.success) {
      setActionMessage(res.message || "Payout processed.");
      loadData();
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleUploadBill = async (orderId: string, file?: File | null) => {
    if (!file) return;
    setActionLoading(true);
    setActionMessage(`Uploading official tax invoice for order #${orderId.slice(-8)}...`);

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("billFile", file);

    const res = await uploadRealBillAction(formData);
    setActionLoading(false);
    if (res.success) {
      setActionMessage(res.message || "Official real bill uploaded and emailed to customer.");
      loadData();
      setTimeout(() => setActionMessage(null), 5000);
    } else {
      setError(res.error || "Failed to upload real bill.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 pb-6 md:px-8">
        <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-primary">Home</Link>
          <span>/</span>
          <span className="text-[#0F8A63] font-black">Business Administration</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F8A63] text-white flex items-center justify-center shadow-sm">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-dark font-heading tracking-tight">
                Business Owner (Admin) Dashboard
              </h1>
              <p className="text-xs text-brand-text-muted">
                Executive Control Desk &bull; Sales Fulfillment &bull; Dealer Sanctions &bull; Plumber Payouts
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="/api/tally/export" download>
              <Button variant="outline" size="sm" className="border-[#0F8A63] text-[#0F8A63] hover:bg-[#DCF5E9]/50 font-bold text-xs">
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Export Tally XML
              </Button>
            </a>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="text-xs">
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Link href="/dev-admin">
              <Button variant="solid" size="sm" className="bg-brand-dark hover:bg-black text-xs font-bold">
                Dev Diagnostics &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 space-y-6">
        {actionMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs">
            {error}
          </div>
        )}

        {/* Top 4 KPI Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-[#E5EEE8] shadow-xs">
              <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
                Total Realized Revenue
              </span>
              <span className="text-2xl sm:text-3xl font-black font-heading text-brand-primary">
                {formatPrice(data.totalRevenue)}
              </span>
              <span className="text-[10px] text-brand-text-muted block mt-2">Cashfree &amp; Counter Sales</span>
            </div>

            <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-[#E5EEE8] shadow-xs">
              <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
                Total Orders ({data.totalOrdersCount})
              </span>
              <span className="text-2xl sm:text-3xl font-black font-heading text-brand-dark">
                {data.pendingOrdersCount} <span className="text-xs font-bold text-amber-600 uppercase">Pending</span>
              </span>
              <span className="text-[10px] text-brand-text-muted block mt-2">Fulfillment queue active</span>
            </div>

            <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-[#E5EEE8] shadow-xs">
              <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
                Pending Dealer Approvals
              </span>
              <span className="text-2xl sm:text-3xl font-black font-heading text-blue-700">
                {data.pendingDealers.length}
              </span>
              <span className="text-[10px] text-brand-text-muted block mt-2">Shop verification requests</span>
            </div>

            <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-[#E5EEE8] shadow-xs">
              <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
                Plumber Payout Requests
              </span>
              <span className="text-2xl sm:text-3xl font-black font-heading text-amber-600">
                {data.pendingPayouts.length}
              </span>
              <span className="text-[10px] text-brand-text-muted block mt-2">Awaiting bank disbursal</span>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#E5EEE8] pb-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "orders" ? "bg-brand-primary text-white shadow-xs" : "bg-white text-brand-text hover:bg-[#FAF8F2]"
            }`}
          >
            Recent Orders &amp; Fulfillment ({data?.recentOrders?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("dealers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "dealers" ? "bg-brand-primary text-white shadow-xs" : "bg-white text-brand-text hover:bg-[#FAF8F2]"
            }`}
          >
            Dealer Applications ({data?.pendingDealers?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "payouts" ? "bg-brand-primary text-white shadow-xs" : "bg-white text-brand-text hover:bg-[#FAF8F2]"
            }`}
          >
            Plumber Payout Desk ({data?.pendingPayouts?.length || 0})
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === "orders" && data && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-sm uppercase tracking-wider mb-4">
              Wholesale &amp; Retail Order Dispatch Queue
            </h3>
            {data.recentOrders.length === 0 ? (
              <p className="text-xs text-brand-text-muted p-6 text-center">No recent orders recorded.</p>
            ) : (
              <div className="overflow-x-auto divide-y divide-[#E5EEE8]">
                {data.recentOrders.map((ord: any) => (
                  <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-black text-sm text-brand-dark">#{ord.id.slice(-8)}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-tint text-brand-primary uppercase">
                          {ord.paymentMethod}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            ord.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ord.status === "SHIPPED"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <span className="text-brand-text-muted text-[11px] block mt-1">
                        Customer: <strong className="text-brand-dark">{ord.user?.name || "Customer"}</strong> ({ord.user?.phone || ord.user?.email}) &bull; {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                      </span>
                      <span className="text-brand-text-muted text-[10px] block">
                        Items: {ord.items.map((i: any) => `${i.product.title} (x${i.quantity})`).join(", ")}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-black text-sm text-brand-dark mr-1">
                        {formatPrice(ord.totalAmount)}
                      </span>

                      {/* Temporary Bill Link */}
                      <a
                        href={`/api/orders/${ord.id}/temporary-bill`}
                        target="_blank"
                        className="px-2.5 py-1.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-[11px] font-bold text-brand-text-muted hover:text-[#0F8A63] flex items-center gap-1 cursor-pointer"
                        title="View System Generated Temporary Bill"
                      >
                        <FileText className="w-3 h-3 text-[#0F8A63]" /> Temp Bill
                      </a>

                      {/* Real Bill Upload / Download Desk */}
                      {ord.realBillUrl ? (
                        <div className="flex items-center gap-1">
                          <a
                            href={ord.realBillUrl}
                            target="_blank"
                            className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-100"
                            title={`Uploaded by ${ord.realBillUploadedBy || "Admin"}`}
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Real Bill Sent
                          </a>
                          <label className="p-1.5 bg-[#FAF8F2] border border-[#E5EEE8] text-brand-text-muted hover:text-brand-dark rounded-xl cursor-pointer" title="Re-upload real bill">
                            <Upload className="w-3 h-3" />
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              className="hidden"
                              onChange={(e) => handleUploadBill(ord.id, e.target.files?.[0])}
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="px-2.5 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-[11px] font-bold flex items-center gap-1 hover:bg-amber-100 cursor-pointer shadow-2xs">
                          <Upload className="w-3 h-3 text-amber-600" /> Upload Real Bill
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={(e) => handleUploadBill(ord.id, e.target.files?.[0])}
                          />
                        </label>
                      )}

                      {/* Status Selector */}
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrder(ord.id, e.target.value as OrderStatus)}
                        disabled={actionLoading}
                        className="px-2.5 py-1.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs font-bold text-brand-dark focus:outline-none cursor-pointer"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Dealer Approval Queue */}
        {activeTab === "dealers" && data && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-sm uppercase tracking-wider mb-4">
              Pending Authorized Dealer Applications
            </h3>
            {data.pendingDealers.length === 0 ? (
              <p className="text-xs text-brand-text-muted p-8 text-center">
                All shop owner trade applications have been processed.
              </p>
            ) : (
              <div className="space-y-4">
                {data.pendingDealers.map((dealer: any) => (
                  <div key={dealer.id} className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-brand-dark">{dealer.shopName || dealer.name}</h4>
                      <p className="text-brand-text-muted text-[11px] mt-0.5">
                        Applicant: {dealer.name} &bull; Email: {dealer.email} &bull; Phone: {dealer.phone || "Not provided"}
                      </p>
                      <span className="inline-block font-mono bg-white px-2 py-0.5 rounded border border-[#E5EEE8] text-[10px] text-brand-dark mt-2 font-bold">
                        GSTIN: {dealer.gstNumber || "Unregistered Retailer"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="solid"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                        onClick={() => handleApproveDealer(dealer.id, true, 200000)}
                        disabled={actionLoading}
                      >
                        Approve (₹2L Credit)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold text-red-600 hover:bg-red-50"
                        onClick={() => handleApproveDealer(dealer.id, false)}
                        disabled={actionLoading}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Plumber Cash Payout Desk */}
        {activeTab === "payouts" && data && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-sm uppercase tracking-wider mb-4">
              Plumber 5% Commission Payout Disbursals
            </h3>
            {data.pendingPayouts.length === 0 ? (
              <p className="text-xs text-brand-text-muted p-8 text-center">
                No pending plumber withdrawal requests. All referral commissions are up to date!
              </p>
            ) : (
              <div className="space-y-4">
                {data.pendingPayouts.map((payout: any) => (
                  <div key={payout.id} className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-brand-dark">{payout.plumberName}</span>
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                          {payout.plumberCode}
                        </span>
                      </div>
                      <p className="text-brand-text-muted text-[11px] mt-1">
                        Phone: {payout.plumberPhone || "N/A"} &bull; Requested: {new Date(payout.createdAt).toLocaleDateString("en-IN")}
                      </p>
                      <div className="mt-2 text-[11px] font-mono text-brand-dark">
                        {payout.upiId ? (
                          <span>UPI ID: <strong>{payout.upiId}</strong></span>
                        ) : (
                          <span>Bank A/C: <strong>{payout.bankAccount}</strong> (IFSC: {payout.bankIfsc})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-brand-text-muted block">Redeeming</span>
                        <span className="font-heading font-black text-base text-brand-primary">
                          {formatPrice(payout.cashAmount)}
                        </span>
                      </div>
                      <Button
                        variant="solid"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                        onClick={() => handleProcessPayout(payout.id, "PAID")}
                        disabled={actionLoading}
                      >
                        Mark Disbursed (Enter UTR)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold text-red-600 hover:bg-red-50"
                        onClick={() => handleProcessPayout(payout.id, "REJECTED")}
                        disabled={actionLoading}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
