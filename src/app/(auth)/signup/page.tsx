import type { Metadata } from "next";
import AuthPageContent from "@/components/auth/AuthPageContent";

export const metadata: Metadata = {
  title: "Sign Up Trade Account",
  description: "Sign up for a Khatu Shyam Trading Co. trade or retail account for plumbing and sanitary solutions.",
  alternates: {
    canonical: "https://store-kstco.vercel.app/signup",
  },
};

export default function SignUpPage() {
  return <AuthPageContent initialMode="register" />;
}
