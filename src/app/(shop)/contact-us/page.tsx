import type { Metadata } from "next";
import { MapPin, Phone, Clock, Navigation, Globe } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us & Warehouse Showroom Location",
  description:
    "Get in touch with Khatu Shyam Trading Co. in Gwalior. Wholesale inquiries, dealer pricing, and technical support for Sentini pipes, Johnson Pedders, and Polyworld tanks.",
  alternates: {
    canonical: "https://store-kstco.vercel.app/contact-us",
  },
  openGraph: {
    title: "Contact Us & Warehouse Showroom | Khatu Shyam Trading Co. Gwalior",
    description:
      "Visit our wholesale warehouse in Gwalior or contact our commercial sales team directly for distributor pricing.",
    url: "https://store-kstco.vercel.app/contact-us",
    images: [{ url: "/og-preview.png", width: 1024, height: 547, alt: "Contact KSTC Gwalior" }],
  },
};

export default function ContactUsPage() {
  return (
    <div className="flex flex-col flex-1 pb-20">

      {/* Page Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 pb-6 md:px-8">
        <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#0F8A63] font-black">Contact Us</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark font-heading tracking-tight">
          Contact Us
        </h1>
        <p className="text-xs sm:text-sm text-brand-text-muted mt-2 max-w-xl font-medium">
          Get in touch with our commercial sales desk, technical assistance, or visit our wholesale warehouse showroom in Gwalior.
        </p>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col lg:flex-row gap-8">

        {/* Left: Form & Map */}
        <div className="flex-1 flex flex-col gap-8">

          {/* Contact Form */}
          <ContactForm />

          {/* Map */}
          <div className="rounded-3xl overflow-hidden border border-[#E5EEE8] shadow-xs bg-white min-h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3287.0145320883375!2d78.22335264366733!3d26.26678713027006!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c77cbcb628c1%3A0x5d89e0ad2bd0301a!2sKhatu%20Shyam%20Trading%20Co.!5e0!3m2!1sen!2sin!4v1782819374303!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Khatu Shyam Trading Co. Location"
            />
          </div>
        </div>

        {/* Right: Store Details */}
        <div className="w-full lg:w-96 shrink-0 flex flex-col gap-5">

          {/* Address Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5EEE8] p-6 shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0F8A63]" /> Our Warehouse
            </h3>
            <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed mb-4">
              Vaibhav Enclave, Shubhanjalipuram, Radhapuram, Maharajpura, Gwalior, Madhya Pradesh, 474005
            </p>
            <a
              href="https://maps.app.goo.gl/HMytKeSHLpnLAgAp7"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="accent" size="sm" icon={<Navigation className="w-3.5 h-3.5" />} className="w-full font-heading font-black text-xs uppercase tracking-wider">
                Get Directions
              </Button>
            </a>
          </div>

          {/* Hours Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5EEE8] p-6 shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0F8A63]" /> Operating Hours
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-brand-text">
                <span className="font-medium text-brand-text-muted">Monday – Saturday</span>
                <span className="font-bold text-brand-dark">10:00 AM – 05:00 PM</span>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5EEE8] p-6 shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#0F8A63]" /> Phone & WhatsApp
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm text-brand-text">
              <p><span className="font-bold text-brand-dark">Primary Phone:</span> <a href="tel:+919340486840" className="hover:text-[#0F8A63] transition-colors font-medium">+91 93404 86840</a></p>
              <p><span className="font-bold text-brand-dark">Alternate Phone:</span> <a href="tel:+919074912742" className="hover:text-[#0F8A63] transition-colors font-medium">+91 90749 12742</a></p>
              <p><span className="font-bold text-brand-dark">Official Email:</span> <a href="mailto:kstradingco88@gmail.com" className="hover:text-[#0F8A63] transition-colors font-medium">kstradingco88@gmail.com</a></p>
              <p><span className="font-bold text-brand-dark">WhatsApp Desk:</span> <a href="https://wa.me/919340486840?text=Hello!%20I'm%20interested%20in%20your%20products.%20I've%20got%20you%20from%20your%20website.%20Let's%20have%20a%20good%20deal." target="_blank" rel="noopener noreferrer" className="hover:text-[#0F8A63] transition-colors font-medium">+91 93404 86840</a></p>
            </div>
          </div>

          {/* Social Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5EEE8] p-6 shadow-xs">
            <h3 className="font-heading font-black text-brand-dark text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#0F8A63]" /> Connect Online
            </h3>
            <div className="flex gap-3 items-center mt-2">
              <SocialIcon href="https://wa.me/919340486840?text=Hello!%20I'm%20interested%20in%20your%20products.%20I've%20got%20you%20from%20your%20website.%20Let's%20have%20a%20good%20deal." icon={<WhatsApp className="w-4 h-4" />} label="WhatsApp" />
              <SocialIcon href="#" icon={<Facebook className="w-4 h-4" />} label="Facebook" />
              <SocialIcon href="https://www.instagram.com/khatushyamtradingco" icon={<Instagram className="w-4 h-4" />} label="Instagram" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SocialIcon({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2.5 rounded-xl bg-[#DCF5E9] border border-[#E5EEE8] text-[#0F8A63] hover:bg-[#0F8A63] hover:text-white transition-all flex items-center justify-center shadow-2xs"
      title={label}
      aria-label={label}
    >
      {icon ? icon : label.charAt(0)}
    </a>
  );
}

function Facebook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
  );
}

function Instagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
  );
}

function WhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  );
}

