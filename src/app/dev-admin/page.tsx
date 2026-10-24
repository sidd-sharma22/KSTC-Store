"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  Cpu,
  Database,
  Activity,
  Server,
  RefreshCw,
  CreditCard,
  Mail,
  Users,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  Coins,
} from "lucide-react";
import { getSystemMetricsAction, SystemMetrics } from "@/app/actions/dev";

export default function DevAdminPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    const res = await getSystemMetricsAction();
    if (res.success && res.metrics) {
      setMetrics(res.metrics);
    } else {
      setError(res.error || "Failed to load developer telemetry.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 pb-6 md:px-8">
        <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-primary">Home</Link>
          <span>/</span>
          <span className="text-[#0F8A63] font-black">Developer &amp; Tech Team</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-dark text-white flex items-center justify-center shadow-sm">
              <Cpu className="w-6 h-6 text-[#34D399]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-dark font-heading tracking-tight">
                Developer &amp; Systems Dashboard
              </h1>
              <p className="text-xs text-brand-text-muted">
                KSTC Enterprise Engine &bull; Next.js 16 App Router &bull; Prisma 7.8 PostgreSQL &bull; Cashfree PG
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={loading}
            className="text-xs font-bold uppercase tracking-wider"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Run Diagnostic Scan
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs">
            {error}
          </div>
        )}

        {/* Status Highlights */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Card */}
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-[#E5EEE8] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
                  System Health
                </span>
                <span className="font-heading font-black text-lg text-emerald-700 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {metrics.status}
                </span>
              </div>
              <Activity className="w-8 h-8 text-emerald-500/40" />
            </div>

            {/* DB Latency */}
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-[#E5EEE8] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
                  PostgreSQL Latency
                </span>
                <span className="font-heading font-black text-lg text-brand-dark">
                  {metrics.dbLatencyMs} ms
                </span>
              </div>
              <Database className="w-8 h-8 text-[#0F8A63]/40" />
            </div>

            {/* Cashfree PG */}
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-[#E5EEE8] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
                  Cashfree Gateway
                </span>
                <span className="font-heading font-bold text-sm text-brand-dark block">
                  {metrics.integrations.cashfreeConfigured ? "Active (API Keys)" : "Simulation Mode"}
                </span>
                <span className="text-[10px] text-brand-primary font-bold uppercase">{metrics.integrations.cashfreeEnv} ENV</span>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500/40" />
            </div>

            {/* Transactional SMTP */}
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-[#E5EEE8] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
                  Email Dispatch (SMTP)
                </span>
                <span className="font-heading font-bold text-sm text-brand-dark block">
                  {metrics.integrations.smtpConfigured ? "Configured & Live" : "Terminal Fallback"}
                </span>
                <span className="text-[10px] text-brand-text-muted">Nodemailer Engine</span>
              </div>
              <Mail className="w-8 h-8 text-amber-500/40" />
            </div>
          </div>
        )}

        {/* Database Table Metrics Matrix */}
        {metrics && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-primary" /> Active PostgreSQL Entities &amp; Ledgers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8]">
                <span className="text-brand-text-muted font-bold block mb-1">Total Users</span>
                <span className="text-2xl font-black font-heading text-brand-dark">{metrics.tableCounts.users}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8]">
                <span className="text-brand-text-muted font-bold block mb-1">Authorized Dealers</span>
                <span className="text-2xl font-black font-heading text-[#0F8A63]">{metrics.tableCounts.dealers}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8]">
                <span className="text-brand-text-muted font-bold block mb-1">Certified Plumbers</span>
                <span className="text-2xl font-black font-heading text-amber-700">{metrics.tableCounts.plumbers}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8]">
                <span className="text-brand-text-muted font-bold block mb-1">Building Contractors</span>
                <span className="text-2xl font-black font-heading text-blue-700">{metrics.tableCounts.contractors}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8]">
                <span className="text-brand-text-muted font-bold block mb-1">Catalog SKUs</span>
                <span className="text-2xl font-black font-heading text-brand-dark">{metrics.tableCounts.products}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8]">
                <span className="text-brand-text-muted font-bold block mb-1">Total Orders</span>
                <span className="text-2xl font-black font-heading text-brand-dark">{metrics.tableCounts.orders}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8]">
                <span className="text-brand-text-muted font-bold block mb-1">B2B Quotations</span>
                <span className="text-2xl font-black font-heading text-brand-dark">{metrics.tableCounts.quotes}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8]">
                <span className="text-brand-text-muted font-bold block mb-1">Active Coupons</span>
                <span className="text-2xl font-black font-heading text-brand-dark">{metrics.tableCounts.coupons}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Navigation to other Dashboards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin"
            className="p-6 rounded-3xl bg-brand-tint/60 border border-brand-primary/20 hover:border-brand-primary transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider block mb-1">Business Management</span>
              <h4 className="font-heading font-black text-lg text-brand-dark group-hover:text-brand-primary transition-colors">
                Open Business Owner Dashboard &rarr;
              </h4>
              <p className="text-xs text-brand-text-muted mt-1">Review sales, approve dealers, verify plumber payouts</p>
            </div>
            <ArrowRight className="w-5 h-5 text-brand-primary group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          <Link
            href="/dealer"
            className="p-6 rounded-3xl bg-[#FAF8F2] border border-[#E5EEE8] hover:border-brand-primary transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-brand-text-muted uppercase tracking-wider block mb-1">Dealer Terminal</span>
              <h4 className="font-heading font-black text-lg text-brand-dark group-hover:text-brand-primary transition-colors">
                Open Shop Owner (Dealer) Portal &rarr;
              </h4>
              <p className="text-xs text-brand-text-muted mt-1">Wholesale stock reorder, credit balance, walk-in billing</p>
            </div>
            <ArrowRight className="w-5 h-5 text-brand-primary group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
