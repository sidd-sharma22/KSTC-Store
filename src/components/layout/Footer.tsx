import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#18231F] text-white pt-16 pb-8 border-t-2 border-[#0F8A63] mt-20 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0F8A63]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-[#0F8A63]/5 rounded-full blur-3xl pointer-events-none translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.35fr_0.9fr_0.9fr_1.1fr] gap-8 lg:gap-10 mb-12">

          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden p-1 border border-white/20 transition-transform group-hover:scale-105 shrink-0">
                <Image src="/kstc-logo.png" alt="Khatu Shyam Trading Co. Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-white leading-tight text-base sm:text-lg tracking-tight whitespace-nowrap">Khatu Shyam Trading Co.</span>
                <span className="text-[10px] sm:text-[11px] text-[#DCF5E9] uppercase tracking-wider font-semibold whitespace-nowrap">Authorized Wholesale Distributor</span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-sm mt-3">
              Authorized wholesale distributor for Sentini Flopipes and Johnson&apos;s Pedders serving retail and trade customers in the Gwalior & Chambal region.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-black text-white text-xs uppercase tracking-widest mb-5">Categories</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/category/bathroom-ware">Bathroom Ware</FooterLink>
              <FooterLink href="/category/sanitary-ware">Sanitary Ware</FooterLink>
              <FooterLink href="/category/pipes-fittings">Pipes & Fittings</FooterLink>
              <FooterLink href="/category/all-products">All Products</FooterLink>
            </ul>
          </div>

          {/* Trade & Support */}
          <div>
            <h4 className="font-heading font-black text-white text-xs uppercase tracking-widest mb-5">Support Center</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/login">Trade Account</FooterLink>
              <FooterLink href="/contact-us">Showroom Desk</FooterLink>
              <FooterLink href="/cart">My Cart</FooterLink>
              <FooterLink href="/contact-us">Contact Us</FooterLink>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-black text-white text-xs uppercase tracking-widest mb-5">Contact</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3 text-xs sm:text-sm text-white/80">
                <MapPin className="w-5 h-5 text-[#0F8A63] shrink-0 mt-0.5" />
                <a href="https://maps.app.goo.gl/HMytKeSHLpnLAgAp7" target="_blank" rel="noopener noreferrer" className="hover:text-[#DCF5E9] hover:underline transition-colors leading-relaxed">
                  Vaibhav Enclave, Shubhanjalipuram, Radhapuram, Maharajpura, Gwalior, Madhya Pradesh, 474005
                </a>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
                <Phone className="w-4 h-4 text-[#0F8A63] shrink-0" />
                <a href="tel:+919340486840" className="hover:text-[#DCF5E9] transition-colors font-medium">+91 93404 86840</a>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
                <Mail className="w-4 h-4 text-[#0F8A63] shrink-0" />
                <a href="mailto:kstradingco88@gmail.com" className="hover:text-[#DCF5E9] transition-colors">kstradingco88@gmail.com</a>
              </li>
              <li className="pt-2">
                <div className="flex gap-3 items-center">
                  <SocialIcon href="https://wa.me/919340486840?text=Hello!%20I'm%20interested%20in%20your%20products.%20I've%20got%20you%20from%20your%20website.%20Let's%20have%20a%20good%20deal." icon={<WhatsApp className="w-4 h-4" />} label="WhatsApp" />
                  <SocialIcon href="#" icon={<Facebook className="w-4 h-4" />} label="Facebook" />
                  <SocialIcon href="https://www.instagram.com/khatushyamtradingco" icon={<Instagram className="w-4 h-4" />} label="Instagram" />
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/70">
            © {new Date().getFullYear()} Khatu Shyam Trading Co. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-white/70 hover:text-[#DCF5E9] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-white/70 hover:text-[#DCF5E9] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2.5 rounded-xl bg-white/10 hover:bg-[#0F8A63] text-white border border-white/10 hover:border-[#0F8A63] transition-all duration-200 flex items-center justify-center shadow-xs"
      title={label}
      aria-label={label}
    >
      {icon ? icon : label.charAt(0)}
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-xs sm:text-sm text-white/80 hover:text-[#DCF5E9] transition-all duration-150 inline-block hover:translate-x-0.5">
        {children}
      </Link>
    </li>
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
