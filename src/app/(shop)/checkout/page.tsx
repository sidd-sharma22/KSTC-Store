"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { useCart } from "@/providers/CartProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Lock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  CreditCard,
  Building2,
  Wallet,
  Banknote,
  MapPin,
  Tag,
  Award,
  Warehouse,
  Truck,
  AlertCircle,
  Sparkles,
  PhoneCall,
} from "lucide-react";
import { createOrderAction } from "@/app/actions/order";
import { validateCouponAction } from "@/app/actions/coupon";
import { getCurrentUserAction } from "@/app/actions/auth";
import type { SessionPayload } from "@/lib/session-types";

type CheckoutStep = "details" | "payment";

interface DeliveryDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

type PaymentMethodType = "CASHFREE" | "PAY_LATER" | "COD";

export default function CheckoutPage() {
  const { items, totalItems, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<CheckoutStep>("details");
  const [currentUser, setCurrentUser] = useState<SessionPayload | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("CASHFREE");

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryDetails, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Coupon & Plumber Code State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
    message: string;
    isPlumber: boolean;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Require user authentication for checkout
  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUserAction();
      if (!user) {
        router.push("/login?redirect=" + encodeURIComponent("/checkout"));
        return;
      }
      setCurrentUser(user);
      setCheckingAuth(false);
      const nameParts = (user.name || "").split(" ");
      setDeliveryDetails((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
      }));

      // Default dealers to PAY_LATER if approved
      if ((user.role === "AUTHORIZED_DEALER" || user.role === "TRADE") && user.tradeStatus === "APPROVED") {
        setPaymentMethod("PAY_LATER");
      }
    }
    loadUser();
  }, [router]);

  const rawSubtotal = subtotal;
  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const discountedSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const gst = Math.round(discountedSubtotal * 0.18);
  const total = discountedSubtotal + gst;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  // Empty Cart Check
  if (items.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center py-24 px-4">
        <h2 className="text-2xl font-bold font-heading text-brand-dark mb-2">No Items in Cart</h2>
        <p className="text-brand-text/60 mb-8 text-center max-w-sm">
          Your shopping cart is currently empty. Add products before proceeding to checkout.
        </p>
        <Link href="/category/all-products">
          <Button variant="solid" size="lg">
            Browse Store Catalog &rarr;
          </Button>
        </Link>
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center py-24 px-4">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-brand-text-muted text-xs font-bold uppercase tracking-wider">Verifying account session...</p>
      </div>
    );
  }

  // Handle Coupon / Plumber Code Application
  const handleApplyCoupon = async () => {
    if (!promoCodeInput.trim()) return;
    setCouponError(null);
    setCouponValidating(true);

    const res = await validateCouponAction(promoCodeInput, subtotal, currentUser?.role);
    setCouponValidating(false);

    if (res.isValid) {
      setAppliedDiscount({
        code: res.code || promoCodeInput.toUpperCase(),
        amount: res.discountAmount,
        message: res.message || "Discount applied successfully!",
        isPlumber: !!res.isPlumberReferral,
      });
      setCouponError(null);
    } else {
      setCouponError(res.error || "Invalid coupon code.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setPromoCodeInput("");
    setCouponError(null);
  };

  // Validation
  const validateDetails = (): boolean => {
    const newErrors: Partial<Record<keyof DeliveryDetails, string>> = {};
    if (!deliveryDetails.firstName.trim()) newErrors.firstName = "First name is required";
    if (!deliveryDetails.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!deliveryDetails.email.trim()) newErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryDetails.email)) newErrors.email = "Invalid email format";
    if (!deliveryDetails.phone.trim()) newErrors.phone = "10-digit mobile number is required";
    else if (!/^\d{10}$/.test(deliveryDetails.phone.replace(/\D/g, "")))
      newErrors.phone = "Enter a valid 10-digit Indian phone number";

    if (deliveryType === "DELIVERY") {
      if (!deliveryDetails.address.trim()) newErrors.address = "Delivery address is required";
      if (!deliveryDetails.city.trim()) newErrors.city = "City is required";
      if (!deliveryDetails.state.trim()) newErrors.state = "State is required";
      if (!deliveryDetails.pincode.trim()) newErrors.pincode = "Pincode is required";
      else if (!/^\d{6}$/.test(deliveryDetails.pincode)) newErrors.pincode = "Enter a valid 6-digit postal code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateDetails()) {
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Final Order Placement
  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setSubmissionError(null);

    const res = await createOrderAction({
      items: items.map((i) => ({ id: i.id, quantity: i.quantity, title: i.title })),
      deliveryDetails: {
        ...deliveryDetails,
        address:
          deliveryType === "PICKUP"
            ? "Warehouse Showroom Pickup (Self-Collection)"
            : deliveryDetails.address,
        pincode: deliveryType === "PICKUP" ? "474005" : deliveryDetails.pincode,
      },
      deliveryType,
      paymentMethod,
      couponCode: appliedDiscount && !appliedDiscount.isPlumber ? appliedDiscount.code : undefined,
      plumberCode: appliedDiscount && appliedDiscount.isPlumber ? appliedDiscount.code : undefined,
    });

    if (!res.success || !res.orderId) {
      setSubmitting(false);
      setSubmissionError(res.error || "Failed to create order. Please try again.");
      return;
    }

    // Clear client cart
    clearCart();

    // If Cashfree Checkout is required
    if (res.requiresPaymentRedirect && res.paymentSessionId) {
      router.push(`/order-success?order_id=${res.orderId}&session_id=${res.paymentSessionId}`);
    } else {
      router.push(`/order-success?order_id=${res.orderId}`);
    }
  };

  const updateField = (field: keyof DeliveryDetails, value: string) => {
    setDeliveryDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Checkout Header / Progress */}
      <div className="bg-white/90 backdrop-blur-md border-b border-[#E5EEE8] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="font-heading font-black text-brand-dark text-sm sm:text-base tracking-tight">
            KSTC Secure Checkout
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2 text-brand-primary">
              <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-black">
                ✓
              </span>
              Cart
            </div>
            <div className="w-8 h-px bg-[#E5EEE8]" />
            <div className={`flex items-center gap-2 ${step === "details" ? "text-brand-primary" : "text-brand-dark"}`}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === "details" ? "bg-brand-primary text-white" : "border border-[#E5EEE8]"
                }`}
              >
                2
              </span>
              Details
            </div>
            <div className="w-8 h-px bg-[#E5EEE8]" />
            <div className={`flex items-center gap-2 ${step === "payment" ? "text-brand-primary" : "text-brand-text-muted"}`}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === "payment" ? "bg-brand-primary text-white" : "border border-[#E5EEE8]"
                }`}
              >
                3
              </span>
              Payment
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#0F8A63] text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-10">
        {/* Left Form Area */}
        <div className="flex-1 flex flex-col gap-6">
          {submissionError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submissionError}</span>
            </div>
          )}

          {step === "details" ? (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 sm:p-7 shadow-xs">
              <h2 className="text-lg sm:text-xl font-black font-heading text-brand-dark mb-4 tracking-tight">
                Fulfillment &amp; Recipient Details
              </h2>

              {/* Delivery Type Toggle */}
              <div className="mb-6 p-1.5 bg-[#FAF8F2] rounded-2xl border border-[#E5EEE8] grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDeliveryType("DELIVERY")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    deliveryType === "DELIVERY"
                      ? "bg-white text-brand-primary shadow-xs border border-brand-primary/20"
                      : "text-brand-text-muted hover:text-brand-dark"
                  }`}
                >
                  <Truck className="w-4 h-4" /> Local Truck Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType("PICKUP")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    deliveryType === "PICKUP"
                      ? "bg-white text-brand-primary shadow-xs border border-brand-primary/20"
                      : "text-brand-text-muted hover:text-brand-dark"
                  }`}
                >
                  <Warehouse className="w-4 h-4" /> Warehouse Pickup (₹0)
                </button>
              </div>

              {deliveryType === "PICKUP" && (
                <div className="p-4 bg-brand-tint/60 border border-brand-primary/20 rounded-2xl text-xs text-brand-dark mb-6 flex items-start gap-3">
                  <Warehouse className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Pickup Address:</span>
                    <span>KSTC Central Warehouse, Vaibhav Enclave, Gwalior, MP 474005. Orders are prepared within 2 hours.</span>
                  </div>
                </div>
              )}

              {/* Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">First Name *</label>
                  <input
                    type="text"
                    value={deliveryDetails.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30"
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <span className="text-[10px] text-red-600 mt-1 block">{errors.firstName}</span>}
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={deliveryDetails.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30"
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <span className="text-[10px] text-red-600 mt-1 block">{errors.lastName}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={deliveryDetails.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30"
                    placeholder="Enter your email address"
                  />
                  {errors.email && <span className="text-[10px] text-red-600 mt-1 block">{errors.email}</span>}
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    value={deliveryDetails.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30"
                    placeholder="Enter 10-digit mobile number"
                  />
                  {errors.phone && <span className="text-[10px] text-red-600 mt-1 block">{errors.phone}</span>}
                </div>
              </div>

              {deliveryType === "DELIVERY" && (
                <>
                  <div className="mb-4">
                    <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">
                      Site / Delivery Street Address *
                    </label>
                    <input
                      type="text"
                      value={deliveryDetails.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30"
                      placeholder="Plot number, Building, Street, Landmark"
                    />
                    {errors.address && <span className="text-[10px] text-red-600 mt-1 block">{errors.address}</span>}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">City *</label>
                      <input
                        type="text"
                        value={deliveryDetails.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Enter your city"
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30"
                      />
                      {errors.city && <span className="text-[10px] text-red-600 mt-1 block">{errors.city}</span>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">State *</label>
                      <input
                        type="text"
                        value={deliveryDetails.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="Enter your state"
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30"
                      />
                      {errors.state && <span className="text-[10px] text-red-600 mt-1 block">{errors.state}</span>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-1">Pincode *</label>
                      <input
                        type="text"
                        value={deliveryDetails.pincode}
                        onChange={(e) => updateField("pincode", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30"
                        placeholder="Enter 6-digit pincode"
                      />
                      {errors.pincode && <span className="text-[10px] text-red-600 mt-1 block">{errors.pincode}</span>}
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-[#E5EEE8] flex justify-end">
                <Button variant="solid" size="lg" onClick={handleProceedToPayment}>
                  Continue to Payment &rarr;
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2: Payment Selector */
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-black font-heading text-brand-dark tracking-tight">
                  Select Payment Method
                </h2>
                <button
                  onClick={() => setStep("details")}
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Edit Details
                </button>
              </div>

              {/* Consultation Prompt for Orders Above 20,000 */}
              {rawSubtotal >= 20000 && (
                <div className="mb-6 p-5 bg-gradient-to-r from-[#DCF5E9]/80 to-[#FAF8F2] border-2 border-[#0F8A63]/30 rounded-2xl shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#0F8A63] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-heading font-black text-sm text-brand-dark uppercase tracking-wide">
                          Want Any Discount?
                        </h3>
                        <span className="bg-[#0F8A63] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Direct Discounts
                        </span>
                      </div>
                      <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                        We provides discounts on or above ₹20,000 cart value. Before completing payment, contact us. After a quick discussion, you will receive a custom coupon code for direct discounts!
                      </p>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 pt-3 border-t border-[#0F8A63]/20">
                        <a
                          href={`https://wa.me/919340486840?text=Hello%20KSTC!%20My%20order%20subtotal%20is%20${formatPrice(rawSubtotal)}.%20I%20am%20at%20checkout%20and%20would%20like%20to%20discuss%20project%20discounts.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" /> WhatsApp Consultant (+91 93404 86840)
                        </a>
                        <a
                          href="tel:+919340486840"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5EEE8] hover:border-[#0F8A63] text-brand-dark rounded-xl text-xs font-bold transition-colors"
                        >
                          Call: +91 93404 86840
                        </a>
                        <a
                          href="tel:+919074912742"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5EEE8] hover:border-[#0F8A63] text-brand-text-muted hover:text-brand-dark rounded-xl text-xs font-bold transition-colors"
                        >
                          Alt: +91 90749 12742
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                {/* Cashfree PG */}
                <label
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === "CASHFREE"
                      ? "bg-brand-tint/60 border-brand-primary shadow-xs"
                      : "bg-[#FAF8F2] border-[#E5EEE8] hover:border-brand-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "CASHFREE"}
                    onChange={() => setPaymentMethod("CASHFREE")}
                    className="mt-1 text-[#0F8A63] focus:ring-[#0F8A63]/30 accent-[#0F8A63]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-brand-primary" />
                      <span className="font-heading font-bold text-sm text-brand-dark">
                        Cashfree Payments (Online Instant)
                      </span>
                      <span className="bg-[#0F8A63] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Recommended</span>
                    </div>
                    <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                      Instant checkout with Google Pay, PhonePe, Paytm, All UPI apps, Debit/Credit Cards &amp; NetBanking.
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery / Pay at Warehouse */}
                <label
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === "COD"
                      ? "bg-brand-tint/60 border-brand-primary shadow-xs"
                      : "bg-[#FAF8F2] border-[#E5EEE8] hover:border-brand-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1 text-[#0F8A63] focus:ring-[#0F8A63]/30 accent-[#0F8A63]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-brand-primary" />
                      <span className="font-heading font-bold text-sm text-brand-dark">
                        {deliveryType === "PICKUP" ? "Pay at Showroom Counter" : "Cash on Delivery (COD)"}
                      </span>
                    </div>
                    <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                      Pay via cash or UPI upon material delivery or pickup at warehouse showroom.
                    </p>
                  </div>
                </label>

                {/* Pay Later Credit */}
                <label
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                    paymentMethod === "PAY_LATER"
                      ? "bg-brand-tint/60 border-brand-primary shadow-xs"
                      : "bg-[#FAF8F2] border-[#E5EEE8] hover:border-brand-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "PAY_LATER"}
                    onChange={() => setPaymentMethod("PAY_LATER")}
                    className="mt-1 text-[#0F8A63] focus:ring-[#0F8A63]/30 accent-[#0F8A63]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-brand-primary" />
                      <span className="font-heading font-bold text-sm text-brand-dark">
                        Pay Later (Authorized Dealer Credit Line)
                      </span>
                    </div>
                    <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                      Charges to authorized trade credit line. Available for verified retail shop owners.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E5EEE8] flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep("details")}>
                  &larr; Back
                </Button>
                <Button variant="solid" size="lg" onClick={handlePlaceOrder} disabled={submitting}>
                  {submitting ? "Processing Order..." : `Confirm & Place Order (${formatPrice(total)})`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Sidebar */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-5">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-base tracking-tight mb-4">Order Summary</h3>

            {/* Items List */}
            <div className="divide-y divide-[#E5EEE8] max-h-56 overflow-y-auto mb-4 pr-1">
              {items.map((i) => (
                <div key={i.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-brand-dark line-clamp-1">{i.title}</span>
                    <span className="text-brand-text-muted text-[10px]">Qty: {i.quantity}</span>
                  </div>
                  <span className="font-heading font-bold text-brand-dark ml-2">
                    {formatPrice((i.bulkPrice || i.unitPrice) * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo / Plumber Referral Code Input */}
            <div className="pt-3 border-t border-[#E5EEE8] mb-4">
              {rawSubtotal >= 20000 && !appliedDiscount && (
                <div className="mb-3 p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-[11px] text-amber-900 leading-snug">
                  <span className="font-bold block text-amber-950 mb-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Order &gt; ₹20,000 Special Discount
                  </span>
                  Have you talked with our business consultant? Enter your customized coupon code below to apply your discount.
                </div>
              )}
              <label className="text-[11px] font-bold text-brand-dark uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-brand-primary" /> Coupon or Plumber Code
              </label>
              {appliedDiscount ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-800">{appliedDiscount.code}</span>
                    <p className="text-[10px] text-emerald-600">{appliedDiscount.message}</p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-xs font-bold text-red-600 hover:underline cursor-pointer">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code or Plumber ID"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary uppercase"
                  />
                  <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={couponValidating}>
                    {couponValidating ? "..." : "Apply"}
                  </Button>
                </div>
              )}
              {couponError && <span className="text-[10px] text-red-600 mt-1 block">{couponError}</span>}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-xs pt-3 border-t border-[#E5EEE8]">
              <div className="flex justify-between text-brand-text-muted">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatPrice(rawSubtotal)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span>-{formatPrice(appliedDiscount.amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-brand-text-muted">
                <span>GST (18%)</span>
                <span>{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between text-brand-text-muted">
                <span>Delivery Charge</span>
                <span className="text-[#0F8A63] font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black font-heading text-brand-dark pt-3 border-t border-[#E5EEE8]">
                <span>Total Amount</span>
                <span className="text-brand-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
