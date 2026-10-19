import AuthPageContent from "@/components/auth/AuthPageContent";

export const metadata = {
  title: "Sign In - Khatu Shyam Trading Co.",
  description: "Sign in to your KSTC account for wholesale contractor pricing, rapid re-orders, and invoice tracking in Gwalior & Chambal.",
};

export default function LoginPage() {
  return <AuthPageContent initialMode="login" />;
}
