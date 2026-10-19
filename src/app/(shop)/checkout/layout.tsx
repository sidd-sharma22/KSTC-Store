import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout & Order Placement",
  description: "Complete your wholesale order or retail checkout securely with Khatu Shyam Trading Co.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
