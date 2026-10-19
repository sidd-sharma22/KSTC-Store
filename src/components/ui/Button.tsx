import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  icon?: ReactNode;
  isLoading?: boolean;
}

export default function Button({
  variant = "solid",
  size = "md",
  children,
  icon,
  isLoading,
  className = "",
  ...props
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    solid: "bg-[#0F8A63] text-white hover:bg-[#0B7453] focus:ring-[#0F8A63]/30 shadow-xs active:scale-[0.98]",
    accent: "bg-white text-[#1F2937] border border-[#E5EEE8] hover:bg-[#DCF5E9] hover:text-[#0F8A63] font-semibold focus:ring-[#0F8A63]/20 shadow-2xs active:scale-[0.98]",
    outline: "border border-[#0F8A63] text-[#0F8A63] bg-transparent hover:bg-[#DCF5E9] focus:ring-[#0F8A63]/30 active:scale-[0.98]",
    ghost: "text-[#1F2937] hover:bg-[#DCF5E9] hover:text-[#0F8A63] focus:ring-[#0F8A63]/30"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs font-semibold rounded-lg",
    md: "px-5 py-2.5 text-sm font-semibold rounded-xl",
    lg: "px-7 py-3 text-base font-semibold rounded-xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
