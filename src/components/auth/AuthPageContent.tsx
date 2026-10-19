"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  User,
  Briefcase,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  KeyRound,
  FileText,
  ShieldCheck,
  Check,
  Building2,
  Truck,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth";

interface AuthPageContentProps {
  initialMode: "login" | "register";
}

export default function AuthPageContent({ initialMode }: AuthPageContentProps) {
  const router = useRouter();

  // Mode: Sign In (false) vs Sign Up / Register (true)
  const [isSignUp, setIsSignUp] = useState(initialMode === "register");
  // Step 1: Enter details, Step 2: Verify OTP
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"RETAIL" | "TRADE">("RETAIL");
  const [shopName, setShopName] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  // OTP State (6 digits)
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // UI / Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Countdown timer for resend (60s)
  const [timer, setTimer] = useState(60);
  const canResend = timer === 0;

  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  // Mode change handler
  const handleModeSwitch = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    setStep(1);
    setErrorMessage(null);
    setSuccessMessage(null);
    setDevOtp(null);
  };

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setDevOtp(null);

    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (isSignUp && !name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (isSignUp && role === "TRADE" && !shopName.trim()) {
      setErrorMessage("Please enter your shop or business name.");
      return;
    }

    setLoading(true);
    try {
      const result = await sendOtpAction({
        email,
        name,
        role,
        shopName,
        gstNumber,
        isSignUp,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to send verification code.");
      } else {
        setSuccessMessage(result.message || "Verification code sent!");
        if (result.devOtp) {
          setDevOtp(result.devOtp);
        }
        setStep(2);
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 100);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle paste OTP
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtp = [...otp];
      digits.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtpAction({
        email,
        otp: otpCode,
        name,
        role,
        shopName,
        gstNumber,
        isSignUp,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Invalid verification code.");
      } else {
        setSuccessMessage(result.message || "Authenticated successfully!");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 600);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const result = await sendOtpAction({
        email,
        name,
        role,
        shopName,
        gstNumber,
        isSignUp,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to resend code.");
      } else {
        setSuccessMessage("New verification code sent!");
        if (result.devOtp) {
          setDevOtp(result.devOtp);
        }
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
        otpInputsRef.current[0]?.focus();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend code.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-2">

      {/* LEFT VERTICAL SECTION: Full Page Vertical Section with Aesthetic Bathroom Image + Inspiring Text */}
      <div
        className="relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 text-white bg-cover bg-[position:center_center] bg-no-repeat min-h-[480px] lg:min-h-full overflow-hidden"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        {/* Dark Emerald / Slate Translucent Scrim for 100% legibility while showcasing the bathroom */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#111916]/92 via-[#111916]/82 to-[#0F8A63]/78 backdrop-blur-[1px]" />

        {/* Top Branding */}
        <div className="relative z-10 flex flex-col gap-5">
          <Link href="/" className="inline-flex items-center gap-3 group w-fit">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md p-2 border border-[#E5EEE8] group-hover:scale-105 transition-transform">
              <Image src="/kstc-logo.png" alt="KSTC Logo" width={38} height={38} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-white text-base sm:text-lg tracking-tight leading-tight">
                Khatu Shyam Trading Co.
              </span>
              <span className="text-[10px] text-[#34D399] uppercase tracking-widest font-bold">
                Authorized Wholesale Distributor
              </span>
            </div>
          </Link>

          {/* Inspiring Headline & Tagline */}
          <div className="mt-4 sm:mt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-[#34D399] uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isSignUp ? "Trade & Retail Onboarding" : "Distributor Portal"}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black leading-[1.12] tracking-tight text-white mb-4">
              {isSignUp
                ? "Elevate Your Projects with Factory-Direct Quality"
                : "Welcome Back to KSTC Trade & Retail"}
            </h2>

            <p className="text-base text-[#E5EEE8] leading-relaxed font-normal max-w-lg">
              {isSignUp
                ? "Join leading plumbers, contractors, and homeowners across Gwalior & Chambal who source genuine sanitaryware and plumbing materials with verified distributor rates."
                : "Sign in with your verified email to access discounted wholesale contractor pricing, past orders, and fast-track regional delivery."}
            </p>
          </div>

          {/* Feature Value Pillars */}
          <div className="flex flex-col gap-3.5 mt-6 pt-6 border-t border-white/15 max-w-lg">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center text-[#34D399] shrink-0 mt-0.5">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">100% Genuine Factory Direct</h4>
                <p className="text-xs text-[#E5EEE8]/80 leading-snug">Sentini Flopipes, Polyworld Tanks &amp; Johnson Pedders</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center text-[#34D399] shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">Contractor Trade Margins</h4>
                <p className="text-xs text-[#E5EEE8]/80 leading-snug">Wholesale bulk rates, tax invoicing &amp; credit options</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center text-[#34D399] shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">Priority Regional Logistics</h4>
                <p className="text-xs text-[#E5EEE8]/80 leading-snug">Fast dispatch across Gwalior, Morena, Bhind &amp; Chambal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Factory Network Ribbon */}
        <div className="relative z-10 pt-6 mt-8 border-t border-white/15">
          <span className="text-[10px] uppercase tracking-widest text-[#34D399] font-bold block mb-1.5">
            Authorized Regional Network
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/90">
            <span className="font-semibold text-white">Sentini Flopipes</span>
            <span className="text-[#34D399]">•</span>
            <span className="font-semibold text-white">Johnson Pedders</span>
            <span className="text-[#34D399]">•</span>
            <span className="font-semibold text-white">Polyworld Tanks</span>
          </div>
        </div>
      </div>

      {/* RIGHT VERTICAL SECTION: Full Page Vertical Section with Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-white min-h-full">
        <div className="w-full max-w-md">

          {/* Mode Tabs (Sign In vs Register / Sign Up) */}
          <div className="flex items-center gap-2 p-1 bg-[#FAF8F2] border border-[#E5EEE8] rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => handleModeSwitch(false)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${!isSignUp
                  ? "bg-[#0F8A63] text-white shadow-xs"
                  : "text-brand-text-muted hover:text-[#0F8A63]"
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch(true)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${isSignUp
                  ? "bg-[#0F8A63] text-white shadow-xs"
                  : "text-brand-text-muted hover:text-[#0F8A63]"
                }`}
            >
              Register / Sign Up
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            {step === 2 && (
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F8A63] hover:text-[#0B7453] mb-4 transition-colors uppercase tracking-wider cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to details
              </button>
            )}

            <h1 className="text-2xl sm:text-3xl font-heading font-black text-brand-dark mb-2 tracking-tight">
              {step === 1
                ? (isSignUp ? "Create Your KSTC Account" : "Sign In to Your Account")
                : "Enter 6-Digit Verification Code"}
            </h1>

            <p className="text-brand-text-muted text-xs sm:text-sm font-medium">
              {step === 1 ? (
                <>
                  {isSignUp ? (
                    <>
                      Already registered with KSTC?{" "}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch(false)}
                        className="text-[#0F8A63] font-bold hover:underline focus:outline-none transition-all cursor-pointer"
                      >
                        Sign in here
                      </button>
                    </>
                  ) : (
                    <>
                      New customer or contractor?{" "}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch(true)}
                        className="text-[#0F8A63] font-bold hover:underline focus:outline-none transition-all cursor-pointer"
                      >
                        Register for free
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>We sent a 6-digit one-time code to <strong className="text-[#0F8A63] font-bold">{email}</strong></>
              )}
            </p>
          </div>

          {/* Feedback & Error Alerts */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs sm:text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-[#DCF5E9] border border-[#E5EEE8] rounded-2xl flex items-start gap-3 text-[#0F8A63] text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#0F8A63] shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Dev Mode OTP Banner (for instant testing) */}
          {devOtp && (
            <div className="mb-6 p-4 bg-[#FAF8F2] border border-[#E5EEE8] rounded-2xl flex items-center justify-between text-brand-dark text-xs sm:text-sm shadow-xs">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#0F8A63]" />
                <span>Dev Test OTP: <strong className="font-mono text-base tracking-wider text-[#0F8A63]">{devOtp}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const digits = devOtp.split("");
                  setOtp(digits);
                }}
                className="text-xs font-bold text-[#0F8A63] hover:text-[#0B7453] underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* STEP 1 FORM: Details */}
          {step === 1 && (
            <form className="flex flex-col gap-4" onSubmit={handleSendOtp}>

              {isSignUp && (
                <>
                  {/* Account Type Toggle */}
                  <div>
                    <label className="block text-xs font-bold text-[#18231F] uppercase tracking-wider mb-2">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF8F2] rounded-2xl border border-[#E5EEE8]">
                      <button
                        type="button"
                        onClick={() => setRole("RETAIL")}
                        className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${role === "RETAIL"
                            ? "bg-[#0F8A63] text-white shadow-xs"
                            : "text-brand-text-muted hover:text-[#0F8A63]"
                          }`}
                      >
                        Retail Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("TRADE")}
                        className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${role === "TRADE"
                            ? "bg-[#0F8A63] text-white shadow-xs"
                            : "text-brand-text-muted hover:text-[#0F8A63]"
                          }`}
                      >
                        Trade / Contractor
                      </button>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#18231F] uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-[#0F8A63] transition-colors" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5EEE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 focus:border-[#0F8A63] transition-all text-sm text-brand-text placeholder:text-brand-text-muted shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Trade Specific Fields */}
                  {role === "TRADE" && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#18231F] uppercase tracking-wider mb-1.5">
                          Shop / Business Name *
                        </label>
                        <div className="relative group">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-[#0F8A63] transition-colors" />
                          <input
                            type="text"
                            placeholder="e.g. Shyam Sanitary & Plumbing Works"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5EEE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 focus:border-[#0F8A63] transition-all text-sm text-brand-text placeholder:text-brand-text-muted shadow-2xs"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#18231F] uppercase tracking-wider mb-1.5">
                          GSTIN Number <span className="text-brand-text-muted font-normal">(Optional)</span>
                        </label>
                        <div className="relative group">
                          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-[#0F8A63] transition-colors" />
                          <input
                            type="text"
                            placeholder="e.g. 23AAAAA0000A1Z5"
                            value={gstNumber}
                            onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5EEE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 focus:border-[#0F8A63] transition-all text-sm text-brand-text placeholder:text-brand-text-muted shadow-2xs uppercase"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[#18231F] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-[#0F8A63] transition-colors" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5EEE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 focus:border-[#0F8A63] transition-all text-sm text-brand-text placeholder:text-brand-text-muted shadow-2xs"
                    required
                  />
                </div>
              </div>

              {isSignUp && role === "TRADE" && (
                <div className="flex items-start gap-3 p-3.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl">
                  <AlertCircle className="w-4 h-4 text-[#0F8A63] shrink-0 mt-0.5" />
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    Trade accounts are verified by our distributor desk to activate contractor credit terms and bulk wholesale margins.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="solid"
                size="lg"
                disabled={loading}
                className="w-full mt-3 font-heading font-black text-xs uppercase tracking-wider py-3.5 shadow-sm group flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* STEP 2 FORM: 6-Digit OTP Verification */}
          {step === 2 && (
            <form className="flex flex-col gap-6" onSubmit={handleVerifyOtp}>

              {/* 6 Digit Input Boxes */}
              <div className="flex justify-between gap-2 sm:gap-3 my-2" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black font-heading bg-white border-2 border-[#E5EEE8] rounded-xl focus:outline-none focus:border-[#0F8A63] focus:ring-2 focus:ring-[#0F8A63]/20 transition-all shadow-xs text-[#0F8A63]"
                  />
                ))}
              </div>

              {/* Resend & Change Email Info */}
              <div className="flex items-center justify-between text-xs text-brand-text-muted px-1 font-medium">
                <span>
                  Didn&apos;t receive code?{" "}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-[#0F8A63] font-bold hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-brand-text-muted font-medium">Resend in {timer}s</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#0F8A63] hover:text-[#0B7453] font-bold underline cursor-pointer"
                >
                  Change Email
                </button>
              </div>

              <Button
                type="submit"
                variant="solid"
                size="lg"
                disabled={loading || otp.join("").length !== 6}
                className="w-full mt-2 font-heading font-black text-xs uppercase tracking-wider py-3.5 shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify &amp; Continue
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Trust & Encryption Guarantee */}
          <div className="mt-8 pt-6 border-t border-[#E5EEE8] flex items-center gap-2 text-xs text-brand-text-muted font-medium">
            <ShieldCheck className="w-4 h-4 text-[#0F8A63] shrink-0" />
            <span>256-Bit Encrypted One-Time Password Authentication • No Password Needed</span>
          </div>

        </div>
      </div>

    </div>
  );
}
