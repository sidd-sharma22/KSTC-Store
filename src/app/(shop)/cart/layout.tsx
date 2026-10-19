import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart & Quotation Order",
  description: "Review your selected pipes, sanitary ware, and bathroom fittings before placing an order or requesting wholesale trade quotation.",
  alternates: {
    canonical: "https://store-kstco.vercel.app/cart",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
