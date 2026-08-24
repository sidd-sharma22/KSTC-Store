"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, User, Briefcase, ChevronRight, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw, KeyRound, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();

  // State: Mode (Sign In vs Sign Up)
  const [isSignUp, setIsSignUp] = useState(false);
  // State: Step 1 (Enter Details) vs Step 2 (Verify OTP)
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
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

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
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        // Focus first OTP box
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 100);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last character entered
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
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
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
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        otpInputsRef.current[0]?.focus();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 relative w-full overflow-hidden">

      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white/70 backdrop-blur-md rounded-3xl border border-white/60 shadow-2xl overflow-hidden relative z-10">

        {/* Left Side: Branding & Trust Panel */}
        <div className="hidden md:flex flex-col md:w-5/12 bg-gray-900 p-10 text-white justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          <div className="relative z-10 flex flex-col gap-6 mt-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg p-2 mb-4">
              <Image src="/kstc-logo.png" alt="KSTC Logo" width={50} height={50} className="object-contain" />
            </div>
            <h2 className="text-3xl font-heading font-bold leading-tight">
              {isSignUp ? "Join Khatu Shyam Trading Co." : "Welcome Back to KSTC"}
            </h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              {isSignUp
                ? "Experience seamless order tracking, saved addresses, and wholesale B2B pricing for trade partners."
                : "Sign in with your email to access your saved carts, active orders, and exclusive distributor rates."}
            </p>
          </div>

          <div className="relative z-10 mb-8">
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <div className="w-10 h-[1px] bg-white/30" />
              <span>Authorized Distributor</span>
            </div>
            <div className="flex gap-4 mt-3 text-sm font-semibold">
              <span>Sentini Flopipes</span>
              <span className="text-white/20">•</span>
              <span>Johnson's Pedders</span>
              <span className="text-white/20">•</span>
              <span>Poly World</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Panel */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">

          {/* Header */}
          <div className="mb-6">
            {step === 2 && (
              <button
                onClick={() => {
                  setStep(1);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text/60 hover:text-brand-primary mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to details
              </button>
            )}

            <h1 className="text-2xl md:text-3xl font-heading font-bold text-brand-primary mb-2">
              {step === 1
                ? (isSignUp ? "Create Your Account" : "Sign In with Email")
                : "Enter Verification Code"}
            </h1>

            <p className="text-brand-text/60 text-sm">
              {step === 1 ? (
                <>
                  {isSignUp ? "Already have an account?" : "New to KSTC?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-brand-accent font-semibold hover:underline focus:outline-none transition-all"
                  >
                    {isSignUp ? "Sign in here" : "Sign up here"}
                  </button>
                </>
              ) : (
                <>We sent a 6-digit code to <strong className="text-brand-primary">{email}</strong></>
              )}
            </p>
          </div>

          {/* Feedback & Error Alerts */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-700 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Dev Mode OTP Banner (for instant testing without SMTP) */}
          {devOtp && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-amber-900 text-sm shadow-sm">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Dev Mode Test OTP: <strong className="font-mono text-base text-amber-800 tracking-wider">{devOtp}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const digits = devOtp.split("");
                  setOtp(digits);
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* Step 1 Form: Details */}
          {step === 1 && (
            <form className="flex flex-col gap-4" onSubmit={handleSendOtp}>

              {isSignUp && (
                <>
                  {/* Account Type Toggle */}
                  <div className="flex p-1 bg-gray-100 rounded-xl mb-1">
                    <button
                      type="button"
                      onClick={() => setRole("RETAIL")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === "RETAIL"
                        ? "bg-white text-brand-primary shadow-sm"
                        : "text-brand-text/60 hover:text-brand-text"
                        }`}
                    >
                      Retail Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("TRADE")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === "TRADE"
                        ? "bg-white text-brand-primary shadow-sm"
                        : "text-brand-text/60 hover:text-brand-text"
                        }`}
                    >
                      Trade / Shop Owner
                    </button>
                  </div>

                  {/* Full Name */}
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text/40 group-focus-within:text-brand-accent transition-colors" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:bg-white transition-all text-sm shadow-sm"
                      required
                    />
                  </div>

                  {/* Trade Specific: Shop Name & GST */}
                  {role === "TRADE" && (
                    <>
                      <div className="relative group">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text/40 group-focus-within:text-brand-accent transition-colors" />
                        <input
                          type="text"
                          placeholder="Shop / Business Name *"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:bg-white transition-all text-sm shadow-sm"
                          required
                        />
                      </div>

                      <div className="relative group">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text/40 group-focus-within:text-brand-accent transition-colors" />
                        <input
                          type="text"
                          placeholder="GST Number (Optional)"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:bg-white transition-all text-sm shadow-sm"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Email Address */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text/40 group-focus-within:text-brand-accent transition-colors" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:bg-white transition-all text-sm shadow-sm"
                  required
                />
              </div>

              {isSignUp && role === "TRADE" && (
                <div className="flex items-start gap-3 p-3.5 bg-brand-primary/5 border border-brand-primary/10 rounded-xl mt-1">
                  <AlertCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-brand-text/70 leading-relaxed">
                    Trade accounts undergo brief verification. Once approved, you gain access to wholesale tier pricing, bulk orders, and Pay Later options.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="accent"
                size="lg"
                disabled={loading}
                className="w-full mt-3 font-semibold group flex items-center justify-center gap-2"
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

          {/* Step 2 Form: 6-Digit OTP Verification */}
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
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono bg-gray-50 border-2 border-brand-border rounded-xl focus:outline-none focus:border-brand-accent focus:bg-white transition-all shadow-sm"
                  />
                ))}
              </div>

              {/* Resend & Change Email Info */}
              <div className="flex items-center justify-between text-xs text-brand-text/70 px-1">
                <span>
                  Didn&apos;t receive code?{" "}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-brand-accent font-bold hover:underline"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-brand-text/50 font-medium">Resend in {timer}s</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-brand-text/60 hover:text-brand-primary underline"
                >
                  Change Email
                </button>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                disabled={loading || otp.join("").length !== 6}
                className="w-full mt-2 font-bold text-base flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Security & Self-Hosted Guarantee Badge */}
          <div className="mt-8 pt-6 border-t border-brand-border/60 flex items-center justify-center gap-2 text-[11px] text-brand-text/50">
            <KeyRound className="w-3.5 h-3.5 text-brand-accent" />
            <span>Secure OTP authentication</span>
          </div>

        </div>

      </div>
    </div>
  );
}
