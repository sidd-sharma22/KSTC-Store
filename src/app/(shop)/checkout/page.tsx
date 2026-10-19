"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { useCart } from "@/providers/CartProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Lock, ChevronRight, ChevronLeft, CheckCircle2,
  CreditCard, Building2, Wallet, Banknote, MapPin,
} from "lucide-react";

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

type PaymentMethod = "pay-later" | "bank-transfer" | "razorpay" | "cod";

export default function CheckoutPage() {
  const { items, totalItems, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<CheckoutStep>("details");
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "", notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryDetails, string>>>({});

  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  // Redirect to cart if empty
  if (items.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center py-24 px-4">
        <h2 className="text-2xl font-bold font-heading text-brand-dark mb-2">No Items to Checkout</h2>
        <p className="text-brand-text/60 mb-8 text-center max-w-sm">
          Your cart is empty. Add some products before proceeding to checkout.
        </p>
        <Link href="/category/all-products">
          <Button variant="solid" size="lg">Browse Shop &rarr;</Button>
        </Link>
      </div>
    );
  }

  // Validation
  const validateDetails = (): boolean => {
    const newErrors: Partial<Record<keyof DeliveryDetails, string>> = {};
    if (!deliveryDetails.firstName.trim()) newErrors.firstName = "First name is required";
    if (!deliveryDetails.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!deliveryDetails.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryDetails.email)) newErrors.email = "Invalid email address";
    if (!deliveryDetails.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(deliveryDetails.phone.replace(/\s/g, ""))) newErrors.phone = "Enter a valid 10-digit phone number";
    if (!deliveryDetails.address.trim()) newErrors.address = "Address is required";
    if (!deliveryDetails.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(deliveryDetails.pincode)) newErrors.pincode = "Enter a valid 6-digit pincode";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateDetails()) {
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePlaceOrder = () => {
    // Store order info in sessionStorage for the success page
    const orderNumber = `KSTC-${Date.now().toString().slice(-8)}`;
    sessionStorage.setItem("kstc-order", JSON.stringify({
      orderNumber,
      items: items.map(i => ({ title: i.title, quantity: i.quantity, brand: i.brand })),
      totalItems,
      subtotal,
      gst,
      total,
      deliveryDetails,
      paymentMethod,
      date: new Date().toISOString(),
    }));
    clearCart();
    router.push("/order-success");
  };

  const updateField = (field: keyof DeliveryDetails, value: string) => {
    setDeliveryDetails(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const stepIndex = step === "details" ? 2 : 3;

  return (
    <div className="flex flex-col flex-1">

      {/* Checkout Header / Progress */}
      <div className="bg-white/90 backdrop-blur-md border-b border-[#E5EEE8] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="font-heading font-black text-brand-dark text-sm sm:text-base tracking-tight">KSTC Checkout</Link>
          <div className="hidden sm:flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            {/* Step 1: Cart */}
            <Link href="/cart" className="flex items-center gap-2 text-[#0F8A63]">
              <span className="w-5 h-5 rounded-full bg-[#0F8A63] text-white flex items-center justify-center text-[10px] font-black">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              Cart
            </Link>
            <div className={`w-8 h-px ${stepIndex >= 2 ? "bg-[#0F8A63]" : "bg-[#E5EEE8]"}`} />
            {/* Step 2: Details */}
            <button
              type="button"
              onClick={() => setStep("details")}
              className={`flex items-center gap-2 cursor-pointer ${stepIndex >= 2 ? "text-[#0F8A63]" : "text-brand-text-muted"}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${stepIndex > 2 ? "bg-[#0F8A63] text-white" : stepIndex === 2 ? "bg-[#0F8A63] text-white" : "border border-[#E5EEE8]"
                }`}>
                {stepIndex > 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : "2"}
              </span>
              Details
            </button>
            <div className={`w-8 h-px ${stepIndex >= 3 ? "bg-[#0F8A63]" : "bg-[#E5EEE8]"}`} />
            {/* Step 3: Payment */}
            <div className={`flex items-center gap-2 ${stepIndex >= 3 ? "text-[#0F8A63]" : "text-brand-text-muted"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${stepIndex === 3 ? "bg-[#0F8A63] text-white" : "border border-[#E5EEE8]"
                }`}>3</span>
              Payment
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#0F8A63] text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> 256-Bit Encrypted
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-10">

        {/* Left: Form Steps */}
        <div className="flex-1 flex flex-col gap-6">

          {step === "details" && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black font-heading text-brand-dark mb-6 tracking-tight">Delivery Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="First Name" value={deliveryDetails.firstName} onChange={(v) => updateField("firstName", v)} error={errors.firstName} />
                <FormField label="Last Name" value={deliveryDetails.lastName} onChange={(v) => updateField("lastName", v)} error={errors.lastName} />
                <FormField label="Email" type="email" value={deliveryDetails.email} onChange={(v) => updateField("email", v)} error={errors.email} />
                <FormField label="Phone" type="tel" value={deliveryDetails.phone} onChange={(v) => updateField("phone", v)} error={errors.phone} />
                <div className="sm:col-span-2">
                  <FormField label="Delivery Address" value={deliveryDetails.address} onChange={(v) => updateField("address", v)} error={errors.address} />
                </div>
                <FormField label="City" value={deliveryDetails.city} onChange={(v) => updateField("city", v)} />
                <FormField label="State" value={deliveryDetails.state} onChange={(v) => updateField("state", v)} />
                <FormField label="Pincode" value={deliveryDetails.pincode} onChange={(v) => updateField("pincode", v)} error={errors.pincode} />
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">Delivery Notes (Optional)</label>
                  <textarea
                    value={deliveryDetails.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Any special instructions for delivery (optional)..."
                    rows={3}
                    className="w-full border border-[#E5EEE8] rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 focus:border-[#0F8A63] transition-colors resize-none text-brand-text placeholder:text-brand-text-muted"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-[#E5EEE8]">
                <Link href="/cart">
                  <Button variant="ghost" size="md" icon={<ChevronLeft className="w-4 h-4" />}>Back to Cart</Button>
                </Link>
                <Button variant="solid" size="lg" className="flex-1 font-heading font-black text-xs uppercase tracking-wider py-3.5 shadow-sm" onClick={handleProceedToPayment}>
                  Continue to Payment <ChevronRight className="w-4 h-4 ml-1 inline-block" />
                </Button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black font-heading text-brand-dark mb-2 tracking-tight">Payment Method</h2>
              <p className="text-xs sm:text-sm text-brand-text-muted mb-6 font-medium">Select your preferred payment method for wholesale or retail order.</p>

              <div className="flex flex-col gap-3">
                <PaymentOption
                  id="pay-later"
                  icon={<Building2 className="w-5 h-5" />}
                  title="Pay Later (Trade Credit Account)"
                  description="For approved retail partners & contractors. 30-day billing cycle."
                  badge="Trade Only"
                  selected={paymentMethod === "pay-later"}
                  onSelect={() => setPaymentMethod("pay-later")}
                />
                <PaymentOption
                  id="bank-transfer"
                  icon={<Banknote className="w-5 h-5" />}
                  title="Direct Bank Transfer (NEFT / RTGS / IMPS)"
                  description="Transfer directly to KSTC current account. Recommended for bulk orders."
                  selected={paymentMethod === "bank-transfer"}
                  onSelect={() => setPaymentMethod("bank-transfer")}
                />
                <PaymentOption
                  id="razorpay"
                  icon={<CreditCard className="w-5 h-5" />}
                  title="Online Payment (UPI, Cards, NetBanking)"
                  description="Instant secure online checkout via Razorpay gateway."
                  selected={paymentMethod === "razorpay"}
                  onSelect={() => setPaymentMethod("razorpay")}
                />
                <PaymentOption
                  id="cod"
                  icon={<Wallet className="w-5 h-5" />}
                  title="Cash on Delivery / Warehouse Pickup"
                  description="Pay in cash upon physical delivery or store pickup in Maharajpura, Gwalior."
                  selected={paymentMethod === "cod"}
                  onSelect={() => setPaymentMethod("cod")}
                />
              </div>

              {/* Delivery Summary */}
              <div className="mt-8 p-5 bg-[#FAF8F2] rounded-2xl border border-[#E5EEE8]">
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-[#0F8A63] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold text-[#0F8A63] uppercase tracking-widest mb-1">Delivering To</div>
                    <div className="text-sm font-heading font-bold text-brand-dark">
                      {deliveryDetails.firstName} {deliveryDetails.lastName}
                    </div>
                    <div className="text-xs text-brand-text-muted mt-0.5">
                      {deliveryDetails.address}, {deliveryDetails.city}, {deliveryDetails.state} - {deliveryDetails.pincode}
                    </div>
                    <div className="text-xs text-brand-text-muted mt-0.5">
                      {deliveryDetails.phone} &middot; {deliveryDetails.email}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="text-xs font-bold text-[#0F8A63] hover:text-[#0B7453] uppercase tracking-wider mt-2.5 inline-block cursor-pointer"
                    >
                      Change Address
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-[#E5EEE8]">
                <Button variant="ghost" size="md" icon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep("details")}>
                  Back to Details
                </Button>
                <Button variant="solid" size="lg" className="flex-1 font-heading font-black text-xs uppercase tracking-wider py-3.5 shadow-sm hover:shadow-md" onClick={handlePlaceOrder}>
                  Confirm Order &middot; {formatPrice(total)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary (Glass) */}
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 sticky top-20 border border-[#E5EEE8] shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-base uppercase tracking-wider mb-4">Order Summary</h3>

            {/* Item List */}
            <div className="space-y-3 mb-4 pb-4 border-b border-[#E5EEE8] max-h-48 overflow-y-auto">
              {items.map((item) => {
                const price = item.isTradeUser && item.bulkPrice ? item.bulkPrice : item.unitPrice;
                return (
                  <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="text-brand-dark font-bold truncate">{item.title}</div>
                      <div className="text-[10px] text-brand-text-muted font-medium">Qty: {item.quantity}</div>
                    </div>
                    <span className="font-heading font-bold text-brand-dark whitespace-nowrap">{formatPrice(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 text-xs sm:text-sm mb-5 pb-5 border-b border-[#E5EEE8]">
              <div className="flex justify-between text-brand-text font-medium">
                <span>Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                <span className="font-bold text-brand-dark">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-text font-medium">
                <span>GST (18%)</span>
                <span className="font-bold text-brand-dark">{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between text-brand-text font-medium">
                <span>Local Gwalior Delivery</span>
                <span className="font-bold text-[#0F8A63] uppercase text-xs">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-heading font-black text-sm uppercase tracking-wider text-brand-dark">Total</span>
              <span className="font-heading font-black text-2xl text-[#0F8A63]">{formatPrice(total)}</span>
            </div>

            <div className="pt-4 border-t border-[#E5EEE8] flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs text-brand-text-muted font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#0F8A63] shrink-0" /> Authorized Wholesale Distributor Guarantee
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-text-muted font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#0F8A63] shrink-0" /> Invoice & E-Way Bill Generated
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function FormField({
  label, value, onChange, error, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  error?: string; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-colors text-brand-text placeholder:text-brand-text-muted ${error
            ? "border-red-400 focus:ring-red-400/50 focus:border-red-400 bg-red-50/50"
            : "border-[#E5EEE8] focus:ring-[#0F8A63]/30 focus:border-[#0F8A63]"
          }`}
      />
      {error && <p className="text-xs text-red-600 mt-1 font-bold">{error}</p>}
    </div>
  );
}

function PaymentOption({
  id, icon, title, description, badge, selected, onSelect,
}: {
  id: string; icon: React.ReactNode; title: string; description: string;
  badge?: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      id={`payment-option-${id}`}
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer ${selected
          ? "border-[#0F8A63] bg-[#DCF5E9]/40 shadow-xs"
          : "border-[#E5EEE8] hover:border-[#0F8A63]/40 bg-white"
        }`}
    >
      <div className={`p-2.5 rounded-xl shrink-0 ${selected ? "bg-[#0F8A63] text-white" : "bg-[#DCF5E9] text-[#0F8A63] border border-[#E5EEE8]"}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-sm text-brand-dark">{title}</span>
          {badge && (
            <span className="text-[9px] font-bold bg-[#DCF5E9] border border-[#E5EEE8] text-[#0F8A63] px-2 py-0.5 rounded uppercase tracking-wider">{badge}</span>
          )}
        </div>
        <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">{description}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center ${selected ? "border-[#0F8A63]" : "border-[#E5EEE8]"
        }`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#0F8A63]" />}
      </div>
    </button>
  );
}
