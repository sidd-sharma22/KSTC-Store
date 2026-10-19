import AuthPageContent from "@/components/auth/AuthPageContent";

export const metadata = {
  title: "Register - Khatu Shyam Trading Co.",
  description: "Create an account with Khatu Shyam Trading Co. to access wholesale contractor rates and factory-direct sanitaryware.",
};

export default function RegisterPage() {
  return <AuthPageContent initialMode="register" />;
}
