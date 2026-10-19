import AuthPageContent from "@/components/auth/AuthPageContent";

export const metadata = {
  title: "Sign Up - Khatu Shyam Trading Co.",
  description: "Sign up for a Khatu Shyam Trading Co. trade or retail account for plumbing and sanitary solutions.",
};

export default function SignUpPage() {
  return <AuthPageContent initialMode="register" />;
}
