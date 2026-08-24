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
    address: "", city: "Gwalior", state: "Madhya Pradesh", pincode: "", notes: "",
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
        <h2 className="text-2xl font-bold font-heading text-brand-primary mb-2">No Items to Checkout</h2>
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
    <div className="flex flex-col flex-1 bg-brand-background">

      {/* Checkout Header / Progress */}
      <div className="bg-white border-b border-brand-border/50 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-heading font-bold text-brand-primary">KSTC Checkout</Link>
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
            {/* Step 1: Cart */}
            <Link href="/cart" className="flex items-center gap-2 text-green-600">
              <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              Cart
            </Link>
            <div className={`w-10 h-px ${stepIndex >= 2 ? "bg-brand-primary" : "bg-brand-border"}`} />
            {/* Step 2: Details */}
            <button
              onClick={() => setStep("details")}
              className={`flex items-center gap-2 ${stepIndex >= 2 ? "text-brand-primary" : "text-brand-text/40"}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                stepIndex > 2 ? "bg-green-500 text-white" : stepIndex === 2 ? "bg-brand-primary text-white" : "border-2 border-brand-border"
              }`}>
                {stepIndex > 2 ? <CheckCircle2 className="w-4 h-4" /> : "2"}
              </span>
              Details
            </button>
            <div className={`w-10 h-px ${stepIndex >= 3 ? "bg-brand-primary" : "bg-brand-border"}`} />
            {/* Step 3: Payment */}
            <div className={`flex items-center gap-2 ${stepIndex >= 3 ? "text-brand-primary" : "text-brand-text/40"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                stepIndex === 3 ? "bg-brand-primary text-white" : "border-2 border-brand-border"
              }`}>3</span>
              Payment
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <Lock className="w-4 h-4" /> Secure
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-12">

        {/* Left: Form Steps */}
        <div className="flex-1 flex flex-col gap-6">

          {step === "details" && (
            <div className="bg-white rounded-2xl border border-brand-border/50 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold font-heading text-brand-primary mb-6">Delivery Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="First Name" value={deliveryDetails.firstName} onChange={(v) => updateField("firstName", v)} error={errors.firstName} placeholder="Rahul" />
                <FormField label="Last Name" value={deliveryDetails.lastName} onChange={(v) => updateField("lastName", v)} error={errors.lastName} placeholder="Sharma" />
                <FormField label="Email" type="email" value={deliveryDetails.email} onChange={(v) => updateField("email", v)} error={errors.email} placeholder="rahul@example.com" />
                <FormField label="Phone" type="tel" value={deliveryDetails.phone} onChange={(v) => updateField("phone", v)} error={errors.phone} placeholder="9876543210" />
                <div className="sm:col-span-2">
                  <FormField label="Delivery Address" value={deliveryDetails.address} onChange={(v) => updateField("address", v)} error={errors.address} placeholder="House no., Street, Locality" />
                </div>
                <FormField label="City" value={deliveryDetails.city} onChange={(v) => updateField("city", v)} placeholder="Gwalior" />
                <FormField label="State" value={deliveryDetails.state} onChange={(v) => updateField("state", v)} placeholder="Madhya Pradesh" />
                <FormField label="Pincode" value={deliveryDetails.pincode} onChange={(v) => updateField("pincode", v)} error={errors.pincode} placeholder="474005" />
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-text/70 mb-1.5 uppercase tracking-wider">Delivery Notes (Optional)</label>
                  <textarea
                    value={deliveryDetails.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Any special instructions for delivery..."
                    rows={3}
                    className="w-full border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-brand-border/50">
                <Link href="/cart">
                  <Button variant="ghost" size="md" icon={<ChevronLeft className="w-4 h-4" />}>Back to Cart</Button>
                </Link>
                <Button variant="solid" size="lg" className="flex-1 font-bold" onClick={handleProceedToPayment}>
                  Continue to Payment <ChevronRight className="w-4 h-4 ml-1 inline-block" />
                </Button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-white rounded-2xl border border-brand-border/50 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold font-heading text-brand-primary mb-2">Payment Method</h2>
              <p className="text-sm text-brand-text/60 mb-6">Choose your preferred payment method.</p>

              <div className="flex flex-col gap-3">
                <PaymentOption
                  id="pay-later"
                  icon={<Building2 className="w-5 h-5" />}
                  title="Pay Later (Credit Account)"
                  description="For approved trade customers. Pay within 30 days."
                  badge="Trade Only"
                  selected={paymentMethod === "pay-later"}
                  onSelect={() => setPaymentMethod("pay-later")}
                />
                <PaymentOption
                  id="bank-transfer"
                  icon={<Banknote className="w-5 h-5" />}
                  title="Bank Transfer (NEFT/RTGS/IMPS)"
                  description="Transfer directly to our bank account. Ideal for high-value orders."
                  selected={paymentMethod === "bank-transfer"}
                  onSelect={() => setPaymentMethod("bank-transfer")}
                />
                <PaymentOption
                  id="razorpay"
                  icon={<CreditCard className="w-5 h-5" />}
                  title="Pay Online (Razorpay)"
                  description="Credit/Debit card, UPI, Net Banking, Wallets."
                  selected={paymentMethod === "razorpay"}
                  onSelect={() => setPaymentMethod("razorpay")}
                />
                <PaymentOption
                  id="cod"
                  icon={<Wallet className="w-5 h-5" />}
                  title="Cash on Delivery / Pickup"
                  description="Pay in cash when you receive or pick up the order."
                  selected={paymentMethod === "cod"}
                  onSelect={() => setPaymentMethod("cod")}
                />
              </div>

              {/* Delivery Summary */}
              <div className="mt-8 p-4 bg-brand-background/50 rounded-xl border border-brand-border/50">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-brand-text/50 uppercase tracking-wider mb-1">Delivering To</div>
                    <div className="text-sm font-semibold text-brand-primary">
                      {deliveryDetails.firstName} {deliveryDetails.lastName}
                    </div>
                    <div className="text-xs text-brand-text/70 mt-0.5">
                      {deliveryDetails.address}, {deliveryDetails.city}, {deliveryDetails.state} - {deliveryDetails.pincode}
                    </div>
                    <div className="text-xs text-brand-text/70 mt-0.5">
                      {deliveryDetails.phone} &middot; {deliveryDetails.email}
                    </div>
                    <button onClick={() => setStep("details")} className="text-xs font-semibold text-brand-accent hover:underline mt-2 inline-block">
                      Change Address
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-brand-border/50">
                <Button variant="ghost" size="md" icon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep("details")}>
                  Back to Details
                </Button>
                <Button variant="accent" size="lg" className="flex-1 font-bold text-base shadow-lg" onClick={handlePlaceOrder}>
                  Place Order &middot; {formatPrice(total)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary (Glass) */}
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <div className="glass-panel rounded-2xl p-6 sticky top-24 border border-white/60 shadow-lg">
            <h3 className="font-heading font-bold text-brand-primary text-lg mb-4">Order Summary</h3>

            {/* Item List */}
            <div className="space-y-3 mb-4 pb-4 border-b border-brand-border/40 max-h-48 overflow-y-auto">
              {items.map((item) => {
                const price = item.isTradeUser && item.bulkPrice ? item.bulkPrice : item.unitPrice;
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="text-brand-primary font-medium truncate">{item.title}</div>
                      <div className="text-[10px] text-brand-text/50">Qty: {item.quantity}</div>
                    </div>
                    <span className="font-semibold text-brand-primary whitespace-nowrap">{formatPrice(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-brand-border/40">
              <div className="flex justify-between text-brand-text/80">
                <span>Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                <span className="font-semibold text-brand-primary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-text/80">
                <span>GST (18%)</span>
                <span className="font-semibold text-brand-primary">{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between text-brand-text/80">
                <span>Local Delivery</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-brand-primary">Total</span>
              <span className="font-bold text-2xl text-brand-primary">{formatPrice(total)}</span>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-brand-text/60">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Authorized Distributor Guarantee
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-text/60">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Easy Returns within 7 days
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
      <label className="block text-xs font-semibold text-brand-text/70 mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
          error
            ? "border-red-400 focus:ring-red-400/50 focus:border-red-400 bg-red-50/50"
            : "border-brand-border focus:ring-brand-accent/50 focus:border-brand-accent"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
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
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
        selected
          ? "border-brand-accent bg-brand-accent/5 shadow-sm"
          : "border-brand-border hover:border-brand-accent/40 bg-white"
      }`}
    >
      <div className={`p-2.5 rounded-lg shrink-0 ${selected ? "bg-brand-accent text-white" : "bg-brand-background text-brand-text/60"}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-brand-primary">{title}</span>
          {badge && (
            <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded uppercase tracking-wider">{badge}</span>
          )}
        </div>
        <p className="text-xs text-brand-text/60 mt-0.5">{description}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center ${
        selected ? "border-brand-accent" : "border-brand-border"
      }`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />}
      </div>
    </button>
  );
}
