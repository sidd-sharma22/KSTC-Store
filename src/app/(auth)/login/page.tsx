import type { Metadata } from "next";
import AuthPageContent from "@/components/auth/AuthPageContent";

export const metadata: Metadata = {
  title: "Sign In & Trade Account Access",
  description: "Sign in to your KSTC account for wholesale contractor pricing, rapid re-orders, and invoice tracking in Gwalior & Chambal.",
  alternates: {
    canonical: "https://store-kstco.vercel.app/login",
  },
};

export default function LoginPage() {
  return <AuthPageContent initialMode="login" />;
}
