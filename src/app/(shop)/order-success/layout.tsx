import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed - Thank You",
  description: "Your order has been placed with Khatu Shyam Trading Co. Our dispatch desk will contact you shortly.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderSuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
