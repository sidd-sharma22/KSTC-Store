import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/providers/CartProvider";
import { WishlistProvider } from "@/providers/WishlistProvider";
import { Analytics } from "@vercel/analytics/next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://store-kstco.vercel.app";
const SITE_TITLE = "Khatu Shyam Trading Co. — Authorized Wholesale Distributor | Gwalior";
const SITE_DESCRIPTION =
  "Khatu Shyam Trading Co. is the premier authorized wholesale distributor of Sentini Flopipes, Johnson Pedders Sanitary Ware, and Polyworld Water Tanks in Gwalior & Chambal region, Madhya Pradesh.";

export const viewport: Viewport = {
  themeColor: "#0F8A63",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Khatu Shyam Trading Co",
    "Sentini Flopipes Gwalior",
    "Polyworld Water Tanks",
    "Johnson Pedder Sanitary",
    "wholesale pipes",
    "CPVC pipes",
    "UPVC",
    "SWR",
    "column pipes",
    "borewell casing",
    "sanitary ware distributor Gwalior",
    "B2B plumbing wholesale",
    "PVC fittings",
    "building materials Gwalior",
    "KSTC store",
    "plumbing distributor Madhya Pradesh",
  ],
  authors: [{ name: "Khatu Shyam Trading Co.", url: SITE_URL }],
  creator: "Khatu Shyam Trading Co.",
  publisher: "Khatu Shyam Trading Co.",
  applicationName: "KSTC Store",
  category: "ecommerce",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-IN": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Khatu Shyam Trading Co.",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-preview.png",
        width: 1024,
        height: 547,
        type: "image/png",
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description:
      "Authorized wholesale distributor for Sentini Flopipes, Polyworld Water Tanks, and Johnson Pedders Sanitary Ware serving retail & trade in Gwalior & Chambal.",
    images: ["/og-preview.png"],
    creator: "@khatushyamtradingco",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/kstc-logo.png" },
      { url: "/kstc-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/kstc-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/kstc-logo.png", sizes: "180x180", type: "image/png" },
      { url: "/kstc-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/kstc-logo.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Khatu Shyam Trading Co.",
      alternateName: ["KSTC", "KSTC Store", "Khatu Shyam Trading Company"],
      url: SITE_URL,
      logo: `${SITE_URL}/kstc-logo.png`,
      image: `${SITE_URL}/og-preview.png`,
      description: SITE_DESCRIPTION,
      telephone: "+91-93404-86840",
      email: "kstradingco88@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Vaibhav Enclave, Shubhanjalipuram, Radhapuram, Maharajpura",
        addressLocality: "Gwalior",
        addressRegion: "Madhya Pradesh",
        postalCode: "474005",
        addressCountry: "IN",
      },
      sameAs: [
        "https://kstco.vercel.app",
        "https://www.instagram.com/khatushyamtradingco",
        "https://maps.app.goo.gl/HMytKeSHLpnLAgAp7",
      ],
    },
    {
      "@type": "WholesaleStore",
      "@id": `${SITE_URL}/#store`,
      name: "Khatu Shyam Trading Co. - Wholesale Store",
      url: SITE_URL,
      telephone: "+91-93404-86840",
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, Credit Card, Bank Transfer, UPI",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Vaibhav Enclave, Shubhanjalipuram, Radhapuram, Maharajpura",
        addressLocality: "Gwalior",
        addressRegion: "Madhya Pradesh",
        postalCode: "474005",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 26.2625,
        longitude: 78.2045,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:00",
          closes: "20:00",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "en-IN",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-brand-text bg-brand-background relative selection:bg-brand-sand/40 selection:text-brand-primary">
        <CartProvider>
          <WishlistProvider>
            {/* Subtle Ambient Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-brand-cream to-brand-cream h-[50vh] -z-10" />

            <Header />

            <main className="flex-1 flex flex-col">
              {children}
            </main>

            <Footer />

            {/* Floating WhatsApp Button (Deep Green & Sand Accent) */}
            <a
              href="https://wa.me/919340486840?text=Hello!%20I'm%20interested%20in%20your%20products.%20I've%20got%20you%20from%20your%20website.%20Let's%20have%20a%20good%20deal."
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/30 hover:scale-110 hover:shadow-xl hover:shadow-brand-primary/40 transition-all duration-300 group ring-2 ring-brand-sand/70 ring-offset-2"
              title="Chat with us on WhatsApp"
              aria-label="Chat with us on WhatsApp"
            >
              <WhatsApp className="w-7 h-7" />
              <span className="absolute right-16 glass text-brand-primary text-xs font-bold px-3 py-1.5 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-brand-border">
                Need wholesale help? Chat with us
              </span>
            </a>
          </WishlistProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}

function WhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  );
}
