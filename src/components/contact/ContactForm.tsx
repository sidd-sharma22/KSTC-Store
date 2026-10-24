"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { CheckCircle2, AlertCircle, RefreshCw, Send } from "lucide-react";
import { submitContactInquiryAction } from "@/app/actions/contact";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await submitContactInquiryAction({
        name,
        email,
        phone,
        message,
      });

      if (!res.success) {
        setError(res.error || "Failed to submit message. Please try again.");
      } else {
        setSuccess(res.message || "Message sent successfully!");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-6 md:p-8 shadow-xs">
      <h2 className="text-xl sm:text-2xl font-black text-brand-dark mb-2 font-heading tracking-tight">
        Send us a Message
      </h2>
      <p className="text-xs text-brand-text-muted mb-6">
        Direct wholesale inquiries, pipe bundle estimates, or technical queries.
      </p>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-start gap-3 mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-emerald-900">{success}</p>
            <p className="text-xs font-normal text-emerald-700 mt-1">
              Our sales desk will contact you via email or phone within business hours.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-bold text-brand-dark uppercase tracking-wider">
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5EEE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 focus:border-[#0F8A63] text-sm text-brand-text placeholder:text-brand-text-muted transition-all"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-brand-dark uppercase tracking-wider">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5EEE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 focus:border-[#0F8A63] text-sm text-brand-text placeholder:text-brand-text-muted transition-all"
              placeholder="you@company.com"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-xs font-bold text-brand-dark uppercase tracking-wider">
            Contact Phone *
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#E5EEE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 focus:border-[#0F8A63] text-sm text-brand-text placeholder:text-brand-text-muted transition-all"
            placeholder="10-digit mobile number"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="message" className="text-xs font-bold text-brand-dark uppercase tracking-wider">
            Message or Product Inquiries *
          </label>
          <textarea
            id="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#E5EEE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 focus:border-[#0F8A63] text-sm text-brand-text placeholder:text-brand-text-muted transition-all resize-y"
            placeholder="Describe the pipe sizes, quantities, or sanitary items required..."
            required
          />
        </div>
        <Button
          type="submit"
          variant="solid"
          disabled={loading}
          className="w-full md:w-auto font-heading font-black text-xs uppercase tracking-wider px-8 py-3 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Sending Message...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
