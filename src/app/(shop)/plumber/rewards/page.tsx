"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  Coins,
  ArrowUpRight,
  Share2,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  QrCode,
  Wallet,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { getPlumberDashboardAction, requestPlumberPayoutAction, PlumberDashboardData } from "@/app/actions/plumber";

export default function PlumberRewardsPage() {
  const [data, setData] = useState<PlumberDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await getPlumberDashboardAction();
    if (res.success && res.data) {
      setData(res.data);
      setPointsToRedeem(res.data.activePoints);
      if (res.data.upiId) setUpiId(res.data.upiId);
      if (res.data.bankAccountNumber) setBankAccount(res.data.bankAccountNumber);
      if (res.data.bankIfsc) setBankIfsc(res.data.bankIfsc);
    } else {
      setError(res.error || "Failed to load rewards dashboard.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyCode = () => {
    if (data?.plumberCode) {
      navigator.clipboard.writeText(data.plumberCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutLoading(true);
    setPayoutError(null);
    setPayoutMessage(null);

    const res = await requestPlumberPayoutAction({
      pointsToRedeem,
      upiId: upiId.trim() || undefined,
      bankAccountNumber: bankAccount.trim() || undefined,
      bankIfsc: bankIfsc.trim() || undefined,
    });

    setPayoutLoading(false);
    if (res.success) {
      setPayoutMessage(res.message || "Withdrawal requested successfully!");
      setTimeout(() => {
        setShowPayoutModal(false);
        loadData();
      }, 1500);
    } else {
      setPayoutError(res.error || "Failed to process withdrawal request.");
    }
  };

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#0F8A63] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs text-brand-text-muted font-bold">Loading plumber rewards wallet...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto w-full px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Coins className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black font-heading text-brand-dark mb-2">Plumber Partner Portal</h2>
        <p className="text-xs text-brand-text-muted mb-6 leading-relaxed">
          {error || "To access plumber commission rewards, you must be signed in with a certified plumber partner account."}
        </p>
        <Link href="/login">
          <Button variant="solid" size="md">
            Sign In or Register as Plumber &rarr;
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 pb-6 md:px-8">
        <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-primary">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#0F8A63] font-black">Plumber Partner Scheme</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-brand-dark font-heading tracking-tight">
              Plumber Rewards Wallet
            </h1>
            <p className="text-xs sm:text-sm text-brand-text-muted mt-1 font-medium">
              Welcome, <strong className="text-brand-dark">{data.name}</strong>. Earn 5% instant points on every customer sale referred to KSTC or authorized dealers.
            </p>
          </div>
          <Button
            variant="solid"
            size="md"
            onClick={() => setShowPayoutModal(true)}
            disabled={data.activePoints <= 0}
            className="font-bold text-xs uppercase tracking-wider shadow-sm"
          >
            <Wallet className="w-4 h-4 mr-1.5" /> Convert Points to Cash
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 space-y-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Points (Redeemable) */}
          <div className="bg-gradient-to-br from-[#0F8A63] to-[#0A6347] text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 block mb-1">
                Active Redeemable Balance
              </span>
              <div className="text-3xl sm:text-4xl font-black font-heading tracking-tight">
                {data.activePoints.toLocaleString()} <span className="text-sm font-normal text-emerald-200">Points</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/20 mt-4 flex items-center justify-between text-xs">
              <span>Cash Value:</span>
              <span className="font-heading font-black text-base">{formatPrice(data.activePoints)}</span>
            </div>
          </div>

          {/* Plumber Code Card */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#E5EEE8] shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted block mb-1">
                Your Referral ID / Code
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-heading font-black text-2xl text-brand-dark bg-[#FAF8F2] px-3.5 py-1.5 rounded-xl border border-[#E5EEE8]">
                  {data.plumberCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2.5 rounded-xl bg-brand-tint text-brand-primary hover:bg-brand-primary hover:text-white transition-all cursor-pointer"
                  title="Copy Referral Code"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-brand-text-muted mt-4">
              Ask your customers to enter this ID or your registered mobile (<strong>{data.phone || "phone"}</strong>) at checkout for an instant discount!
            </p>
          </div>

          {/* Total Lifetime Points */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#E5EEE8] shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted block mb-1">
                Lifetime Points Earned
              </span>
              <div className="text-2xl sm:text-3xl font-black font-heading text-brand-dark">
                {data.totalPoints.toLocaleString()}
              </div>
            </div>
            <div className="pt-3 border-t border-[#E5EEE8] mt-4 flex items-center gap-2 text-xs text-brand-primary font-bold">
              <TrendingUp className="w-4 h-4" /> 5% Commission on all referred sales
            </div>
          </div>

          {/* Redeemed Points */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#E5EEE8] shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted block mb-1">
                Total Cash Redeemed
              </span>
              <div className="text-2xl sm:text-3xl font-black font-heading text-brand-dark">
                {formatPrice(data.redeemedPoints)}
              </div>
            </div>
            <div className="pt-3 border-t border-[#E5EEE8] mt-4 text-xs text-brand-text-muted">
              Disbursed directly via UPI / Bank Transfer
            </div>
          </div>
        </div>

        {/* Two Columns: Recent Referral Sales & Cash Payout Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Referral Transactions */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-base tracking-tight mb-4 flex items-center justify-between">
              <span>Referral Sales Ledger</span>
              <span className="text-xs font-bold text-brand-text-muted">{data.referrals.length} Transactions</span>
            </h3>

            {data.referrals.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-text-muted">
                No customer orders tagged with your referral ID yet. Share your code with customers to start earning 5% rewards!
              </div>
            ) : (
              <div className="divide-y divide-[#E5EEE8] overflow-x-auto">
                {data.referrals.map((ref) => (
                  <div key={ref.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-brand-dark block">Order #{ref.orderId.slice(-8)}</span>
                      <span className="text-[10px] text-brand-text-muted">
                        Sale: {formatPrice(ref.orderAmount)} &bull; {new Date(ref.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-heading font-black text-brand-primary block">
                        +{ref.pointsEarned} Pts ({formatPrice(ref.pointsEarned)})
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ref.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {ref.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Cash Payout Requests */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-base tracking-tight mb-4 flex items-center justify-between">
              <span>Cash Payout Ledger</span>
              <span className="text-xs font-bold text-brand-text-muted">{data.payoutRequests.length} Withdrawals</span>
            </h3>

            {data.payoutRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-text-muted">
                No cash withdrawals requested yet. Click &quot;Convert Points to Cash&quot; above once you accumulate points!
              </div>
            ) : (
              <div className="divide-y divide-[#E5EEE8] overflow-x-auto">
                {data.payoutRequests.map((req) => (
                  <div key={req.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-heading font-black text-brand-dark block">{formatPrice(req.cashAmount)}</span>
                      <span className="text-[10px] text-brand-text-muted">
                        {req.pointsRedeemed} Points &bull; {new Date(req.createdAt).toLocaleDateString("en-IN")}
                      </span>
                      {req.utrNumber && (
                        <span className="text-[9px] text-brand-primary block font-mono">UTR: {req.utrNumber}</span>
                      )}
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                          req.payoutStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : req.payoutStatus === "PROCESSING"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {req.payoutStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowPayoutModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-10 border border-[#E5EEE8]">
            <h3 className="text-lg font-black font-heading text-brand-dark mb-1">Convert Points to Direct Cash</h3>
            <p className="text-xs text-brand-text-muted mb-4">
              1 Point = ₹1.00 INR. Funds will be transferred directly to your bank account or UPI ID.
            </p>

            {payoutMessage && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{payoutMessage}</span>
              </div>
            )}

            {payoutError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{payoutError}</span>
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">
                  Points to Redeem (Max: {data.activePoints})
                </label>
                <input
                  type="number"
                  min={1}
                  max={data.activePoints}
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-sm font-heading font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  required
                />
                <span className="text-[11px] text-[#0F8A63] font-bold mt-1 block">
                  You will receive: {formatPrice(pointsToRedeem)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">
                  UPI ID
                </label>
                <input
                  type="text"
                  placeholder="Enter your UPI ID"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              <div className="text-center text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">— OR BANK DETAILS —</div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">Account No.</label>
                  <input
                    type="text"
                    placeholder="Enter bank account number"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="Enter 11-digit IFSC code"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5EEE8] flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowPayoutModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="solid" disabled={payoutLoading || pointsToRedeem <= 0}>
                  {payoutLoading ? "Submitting..." : `Withdraw ${formatPrice(pointsToRedeem)}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
