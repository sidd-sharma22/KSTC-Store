import type { Metadata } from "next";
import AuthPageContent from "@/components/auth/AuthPageContent";

export const metadata: Metadata = {
  title: "Register Trade Account",
  description: "Create an account with Khatu Shyam Trading Co. to access wholesale contractor rates and factory-direct sanitary ware in Gwalior.",
  alternates: {
    canonical: "https://store-kstco.vercel.app/register",
  },
};

export default function RegisterPage() {
  return <AuthPageContent initialMode="register" />;
}
