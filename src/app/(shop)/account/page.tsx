"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Tag,
  Edit2,
  Check,
  AlertCircle,
  Copy,
  Sparkles,
  KeyRound,
  X,
} from "lucide-react";
import {
  getCurrentUserAction,
  updateProfileCredentialsAction,
  sendEmailChangeOtpAction,
} from "@/app/actions/auth";
import type { SessionPayload } from "@/lib/session-types";
import { getRoleDisplayName } from "@/lib/session-types";

export default function UserAccountPage() {
  const [currentUser, setCurrentUser] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Credentials State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const user = await getCurrentUserAction();
      setCurrentUser(user);
      if (user) {
        setEditName(user.name || "");
        setEditPhone(user.phone || "");
        setEditEmail(user.email || "");
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleStartEdit = () => {
    if (currentUser) {
      setEditName(currentUser.name || "");
      setEditPhone(currentUser.phone || "");
      setEditEmail(currentUser.email || "");
      setEmailOtp("");
      setOtpSent(false);
      setFeedback(null);
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEmailOtp("");
    setOtpSent(false);
    setFeedback(null);
  };

  const handleSendOtp = async () => {
    setFeedback(null);
    if (!editEmail.trim()) {
      setFeedback({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    if (editEmail.trim().toLowerCase() === currentUser?.email.toLowerCase()) {
      setFeedback({ type: "error", text: "New email is the same as your current email." });
      return;
    }

    setSendingOtp(true);
    const res = await sendEmailChangeOtpAction(editEmail.trim());
    setSendingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setFeedback({
        type: "success",
        text: `Verification OTP has been sent to ${editEmail.trim()}. Enter it below.`,
      });
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to send verification code." });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!editName.trim()) {
      setFeedback({ type: "error", text: "Please enter your full name." });
      return;
    }

    const cleanPhone = editPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setFeedback({ type: "error", text: "Please enter a valid 10-digit mobile number." });
      return;
    }

    const emailChanged = editEmail.trim().toLowerCase() !== currentUser?.email.toLowerCase();

    if (emailChanged && !emailOtp.trim()) {
      setFeedback({
        type: "error",
        text: "Email change requires OTP verification. Please click 'Send OTP' and enter the code.",
      });
      return;
    }

    setSaving(true);
    const res = await updateProfileCredentialsAction({
      name: editName.trim(),
      phone: cleanPhone,
      email: emailChanged ? editEmail.trim() : undefined,
      emailOtp: emailChanged ? emailOtp.trim() : undefined,
    });
    setSaving(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsEditing(false);
      setOtpSent(false);
      setEmailOtp("");
      setFeedback({ type: "success", text: "Profile credentials updated successfully!" });
    } else {
      setFeedback({ type: "error", text: res.error || "Failed to update profile." });
    }
  };

  const handleCopyPlumberCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto w-full px-4 py-20 text-center text-xs text-brand-text-muted">
        Loading account details...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto w-full px-4 py-20 text-center">
        <h2 className="text-xl font-bold font-heading text-brand-dark mb-2">Sign In Required</h2>
        <p className="text-xs text-brand-text-muted mb-6">Please sign in to view your account profile.</p>
        <Link href="/login">
          <Button variant="solid" size="md">
            Go to Login &rarr;
          </Button>
        </Link>
      </div>
    );
  }

  const isPlumber = currentUser.role === "PLUMBER" || !!currentUser.plumberCode;

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 pb-6 md:px-8">
        <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-primary">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#0F8A63]" />
          <span className="text-[#0F8A63] font-black">My Account</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-brand-dark font-heading tracking-tight">
              Account Profile &amp; Preferences
            </h1>
            <p className="text-xs sm:text-sm text-brand-text-muted mt-1 font-medium">
              Manage your credentials, mobile number, email, and partner rewards.
            </p>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 font-bold text-xs"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Credentials
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Profile / Edit Area */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 sm:p-7 shadow-xs md:col-span-2 space-y-6">
          {feedback && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {feedback.type === "success" ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Profile Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-[#E5EEE8]">
            <div className="w-16 h-16 rounded-full bg-brand-primary text-white font-heading font-black text-xl flex items-center justify-center shadow-xs">
              {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <h2 className="text-xl font-black font-heading text-brand-dark">{currentUser.name || "Customer"}</h2>
              <span className="inline-block mt-1 bg-brand-tint text-brand-primary text-xs font-bold px-3 py-0.5 rounded-full border border-brand-primary/20">
                {getRoleDisplayName(currentUser.role)}
              </span>
            </div>
          </div>

          {/* Edit Form OR View Mode */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-black text-sm text-brand-dark uppercase tracking-wide">
                  Edit Account Credentials
                </h3>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-brand-text-muted hover:text-brand-dark flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">
                  Mobile Number * (10 Digits)
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30"
                  required
                />
              </div>

              {/* Email Address with OTP requirement */}
              <div className="p-4 bg-[#FAF8F2] rounded-2xl border border-[#E5EEE8] space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                      Email Address *
                    </label>
                    {editEmail.trim().toLowerCase() !== currentUser.email.toLowerCase() && (
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Verification Required
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => {
                        setEditEmail(e.target.value);
                        setOtpSent(false);
                        setEmailOtp("");
                      }}
                      placeholder="Enter your email address"
                      className="flex-1 px-3.5 py-2 bg-white border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30"
                      required
                    />
                    {editEmail.trim().toLowerCase() !== currentUser.email.toLowerCase() && (
                      <Button
                        type="button"
                        variant="solid"
                        size="sm"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="text-xs shrink-0"
                      >
                        {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* OTP input if email is modified and OTP requested */}
                {editEmail.trim().toLowerCase() !== currentUser.email.toLowerCase() && (
                  <div>
                    <label className="text-[11px] font-bold text-brand-dark uppercase tracking-wider block mb-1">
                      Enter 6-Digit Email OTP *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit verification code"
                      className="w-full sm:w-48 px-3.5 py-2 bg-white border border-[#E5EEE8] rounded-xl text-xs tracking-widest font-mono text-center text-brand-dark focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30"
                    />
                    <p className="text-[10px] text-brand-text-muted mt-1">
                      Check your new email inbox for the 6-digit confirmation code.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" variant="solid" size="md" disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Credentials"}
                </Button>
                <Button type="button" variant="outline" size="md" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8]">
                <span className="text-brand-text-muted font-bold block mb-1">Email Address</span>
                <span className="font-heading font-bold text-brand-dark text-sm">{currentUser.email}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8]">
                <span className="text-brand-text-muted font-bold block mb-1">Contact Phone</span>
                <span className="font-heading font-bold text-brand-dark text-sm">
                  {currentUser.phone || "Not configured"}
                </span>
              </div>

              {currentUser.shopName && (
                <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5EEE8]">
                  <span className="text-brand-text-muted font-bold block mb-1">Shop / Business Name</span>
                  <span className="font-heading font-bold text-brand-dark text-sm">{currentUser.shopName}</span>
                </div>
              )}

              {currentUser.plumberCode && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-blue-700 font-bold block mb-1">Plumber Referral ID</span>
                  <span className="font-heading font-bold text-blue-900 text-sm">{currentUser.plumberCode}</span>
                </div>
              )}
            </div>
          )}

          {/* Plumber 5% Referral Scheme Card (Point 4) */}
          {isPlumber && (
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-[#DCF5E9]/80 to-[#FAF8F2] border-2 border-[#0F8A63]/30 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#0F8A63] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-heading font-black text-sm text-brand-dark uppercase tracking-wide">
                      5% Plumber Referral Scheme
                    </h3>
                    <span className="bg-[#0F8A63] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Active Beneficiary
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-muted mt-2 leading-relaxed">
                    You will immediately receive a unique referral code ({currentUser.plumberCode || "PLUM-XXXX"}).
                    Refer homeowners or contractors to earn 5% cash-convertible points (1 Pt = ₹1) on every fulfilled order.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-[#0F8A63]/20">
                    <div className="px-3.5 py-1.5 bg-white border border-[#0F8A63]/30 rounded-xl text-xs font-mono font-black text-brand-dark tracking-wider">
                      {currentUser.plumberCode || "PLUM-7721"}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyPlumberCode(currentUser.plumberCode || "PLUM-7721")}
                      className="text-xs flex items-center gap-1.5"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode ? "Copied!" : "Copy Referral Code"}
                    </Button>
                    <Link href="/plumber/rewards">
                      <Button variant="solid" size="sm" className="text-xs">
                        View Reward Wallet &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links Sidebar */}
        <div className="space-y-4">
          <Link
            href="/orders"
            className="p-5 rounded-2xl bg-white border border-[#E5EEE8] hover:border-brand-primary shadow-xs transition-all block group"
          >
            <h4 className="font-heading font-bold text-sm text-brand-dark group-hover:text-brand-primary transition-colors">
              My Orders &rarr;
            </h4>
            <p className="text-xs text-brand-text-muted mt-1">View past orders and download GST invoices</p>
          </Link>

          <Link
            href="/wishlist"
            className="p-5 rounded-2xl bg-white border border-[#E5EEE8] hover:border-brand-primary shadow-xs transition-all block group"
          >
            <h4 className="font-heading font-bold text-sm text-brand-dark group-hover:text-brand-primary transition-colors">
              Saved Wishlist &rarr;
            </h4>
            <p className="text-xs text-brand-text-muted mt-1">Review saved items and favorite fixtures</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
