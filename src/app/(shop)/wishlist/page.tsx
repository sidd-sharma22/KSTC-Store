import Button from "@/components/ui/Button";
import Link from "next/link";
import { Heart, ChevronRight, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Wishlist | Khatu Shyam Trading Co.",
  description: "Your saved products and plumbing favorites at KSTC.",
};

export default function WishlistPage() {
  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 pb-6 md:px-8">
        <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#0F8A63]" />
          <span className="text-[#0F8A63] font-black">Wishlist</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark font-heading tracking-tight">
          My Wishlist
        </h1>
        <p className="text-xs sm:text-sm text-brand-text-muted mt-2 max-w-xl font-medium">
          Saved pipes, sanitary ware, and fittings for quick ordering and contractor quotation.
        </p>
      </div>

      {/* Main Wishlist Content */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] shadow-xs p-10 sm:p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#DCF5E9] flex items-center justify-center mb-6 border border-[#E5EEE8] shadow-xs">
            <Heart className="w-9 h-9 text-[#0F8A63]" />
          </div>
          <h2 className="text-2xl font-black font-heading text-brand-dark mb-2 tracking-tight">
            Your Wishlist is Empty
          </h2>
          <p className="text-sm text-brand-text-muted max-w-md mb-8 leading-relaxed">
            You haven&apos;t saved any products to your wishlist yet. Click the heart icon on any product in our store to save it for later.
          </p>
          <Link href="/category/all-products">
            <Button variant="solid" size="lg" className="font-heading font-black text-xs uppercase tracking-wider px-8 py-3.5 shadow-sm" icon={<ShoppingBag className="w-4 h-4" />}>
              Explore Store Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
