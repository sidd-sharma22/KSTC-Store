import { MapPin, Phone, Clock, Navigation, Globe } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ContactUsPage() {
  return (
    <div className="flex flex-col flex-1 pb-20">

      {/* Page Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 pb-6 md:px-8">
        <div className="text-[10px] font-bold text-brand-text/50 uppercase tracking-widest mb-2">
          <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link> / Contact Us
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-primary font-heading">
          Contact Us
        </h1>
        <p className="text-sm text-brand-text/70 mt-2 max-w-xl">
          Get in touch with us for inquiries, support, or to visit our showroom in Gwalior.
        </p>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col lg:flex-row gap-8">

        {/* Left: Form & Map */}
        <div className="flex-1 flex flex-col gap-8">

          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-brand-border/50 p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-brand-primary mb-6 font-heading">Send us a Message</h2>
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-brand-text">Name</label>
                  <input type="text" id="name" className="w-full px-4 py-2.5 bg-gray-50 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-sm transition-all" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-brand-text">Email</label>
                  <input type="email" id="email" className="w-full px-4 py-2.5 bg-gray-50 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-sm transition-all" placeholder="your@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-brand-text">Phone (Optional)</label>
                <input type="tel" id="phone" className="w-full px-4 py-2.5 bg-gray-50 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-sm transition-all" placeholder="Your Phone Number" />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-brand-text">Message</label>
                <textarea id="message" rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-sm transition-all resize-y" placeholder="How can we help you?"></textarea>
              </div>
              <Button type="button" variant="solid" className="w-full md:w-auto">Send Message</Button>
            </form>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-brand-border/50 shadow-sm bg-white min-h-[400px]">
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
        <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6">

          {/* Address Card */}
          <div className="bg-white rounded-2xl border border-brand-border/50 p-6 shadow-sm">
            <h3 className="font-heading font-semibold text-brand-primary text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-accent" /> Our Address
            </h3>
            <p className="text-sm text-brand-text/80 leading-relaxed mb-4">
              Radhapuram, Vaibhav Enclave, Maharajpura, Gwalior-474005, Madhya Pradesh, India
            </p>
            <a
              href="https://maps.app.goo.gl/HMytKeSHLpnLAgAp7"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="accent" size="sm" icon={<Navigation className="w-4 h-4" />} className="w-full">
                Get Directions
              </Button>
            </a>
          </div>

          {/* Hours Card */}
          <div className="bg-white rounded-2xl border border-brand-border/50 p-6 shadow-sm">
            <h3 className="font-heading font-semibold text-brand-primary text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-accent" /> Store Hours
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-brand-text/80">
                <span>Monday - Sunday</span>
                <span className="font-semibold text-brand-primary">10:00 AM - 05:00 PM</span>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-2xl border border-brand-border/50 p-6 shadow-sm">
            <h3 className="font-heading font-semibold text-brand-primary text-lg mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-brand-accent" /> Contact
            </h3>
            <div className="space-y-3 text-sm text-brand-text/80">
              <p><span className="font-semibold text-brand-primary">Phone:</span> <a href="tel:+919340486840">+91 93404 86840</a></p>
              <p><span className="font-semibold text-brand-primary">Alternate Phone:</span> <a href="tel:+919074912742">+91 90749 12742</a></p>
              <p><span className="font-semibold text-brand-primary">Email:</span> <a href="mailto:kstradingco88@gmail.com">kstradingco88@gmail.com</a></p>
              <p><span className="font-semibold text-brand-primary">WhatsApp:</span> <a href="https://wa.me/919340486840?text=Hello!%20I'm%20interested%20in%20your%20products.%20I've%20got%20you%20from%20your%20website.%20Let's%20have%20a%20good%20deal." target="_blank" rel="noopener noreferrer">+91 93404 86840</a></p>
            </div>
          </div>

          {/* Social Card */}
          <div className="bg-white rounded-2xl border border-brand-border/50 p-6 shadow-sm">
            <h3 className="font-heading font-semibold text-brand-primary text-lg mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-accent" /> Social Media
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-5 items-center mt-1">
                <SocialIcon href="https://wa.me/919340486840?text=Hello!%20I'm%20interested%20in%20your%20products.%20I've%20got%20you%20from%20your%20website.%20Let's%20have%20a%20good%20deal." icon={<WhatsApp className="w-5 h-5" />} label="WhatsApp" />
                <SocialIcon href="#" icon={<Facebook className="w-5 h-5" />} label="Facebook" />
                <SocialIcon href="https://www.instagram.com/khatushyamtradingco" icon={<Instagram className="w-5 h-5" />} label="Instagram" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SocialIcon({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-text/50 hover:text-brand-primary transition-colors" title={label}>
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
