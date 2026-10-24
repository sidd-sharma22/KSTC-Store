import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { getProductsAction, getCategoriesAction } from "@/app/actions/catalog";
import { getSession, isAuthorizedDealer, isContractor } from "@/lib/session";
import { ShieldCheck, Truck, Percent, Award, ArrowRight } from "lucide-react";

export default async function Home() {
  const [productsRes, categoriesRes, session] = await Promise.all([
    getProductsAction({ limit: 6, sortBy: "popularity" }),
    getCategoriesAction(),
    getSession(),
  ]);

  const products = productsRes.success ? productsRes.products : [];
  const categories = categoriesRes.success ? categoriesRes.categories : [];

  const isDealer = isAuthorizedDealer(session?.role);
  const isContr = isContractor(session?.role);

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      {/* Hero Section */}
      <section
        className="relative w-full overflow-hidden min-h-[580px] lg:min-h-[640px] pt-28 sm:pt-36 pb-36 sm:pb-48 px-4 md:px-8 bg-cover bg-[position:center_center] bg-no-repeat flex items-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#111916]/95 via-[#111916]/80 to-[#111916]/45 backdrop-blur-[0.5px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-start text-left">
          <div className="max-w-4xl lg:max-w-5xl flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2.5 mb-4 text-[#34D399] font-bold text-xs sm:text-sm uppercase tracking-widest bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-pulse" />
              <span>Gwalior &amp; Chambal Region Authorized Wholesale Distributor</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-black text-white font-heading mb-6 leading-[1.08] tracking-tight text-left">
              Premium Plumbing &amp; Sanitary Solutions for{" "}
              <span className="text-[#34D399]">Trade &amp; Retail</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#E5EEE8] font-normal leading-relaxed max-w-3xl text-left mb-8">
              Official wholesale distributor for <strong className="text-white font-bold">Sentini Flopipes</strong>, <strong className="text-white font-bold">Polyworld Tanks</strong>, and <strong className="text-white font-bold">Johnson Pedders</strong> sanitaryware. Serving shop owners, contractors, plumbers, and home builders with factory-direct pricing.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/category/all-products">
                <Button variant="solid" size="lg" className="font-heading font-black text-xs uppercase tracking-wider px-8 py-4 shadow-lg shadow-[#0F8A63]/30">
                  Explore Store &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Highlights Grid */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-8 -mt-10 sm:-mt-16 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#E5EEE8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCF5E9] border border-[#E5EEE8] flex items-center justify-center text-[#0F8A63] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-brand-dark">100% Factory Direct</h4>
              <p className="text-xs text-brand-text-muted mt-0.5">Direct manufacturer warranty</p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#E5EEE8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCF5E9] border border-[#E5EEE8] flex items-center justify-center text-[#0F8A63] shrink-0">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-brand-dark">Tiered Wholesale Rates</h4>
              <p className="text-xs text-brand-text-muted mt-0.5">Dealer &amp; contractor margins</p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#E5EEE8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCF5E9] border border-[#E5EEE8] flex items-center justify-center text-[#0F8A63] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-brand-dark">Local Rapid Dispatch</h4>
              <p className="text-xs text-brand-text-muted mt-0.5">Same-day delivery in Gwalior</p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#E5EEE8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCF5E9] border border-[#E5EEE8] flex items-center justify-center text-[#0F8A63] shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-brand-dark">Plumber 5% Cash Scheme</h4>
              <p className="text-xs text-brand-text-muted mt-0.5">Instant points to cash transfer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-4 md:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-[#0F8A63] uppercase tracking-wider block mb-1">
                Authorized Lines
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-dark font-heading tracking-tight">
                Product Categories
              </h2>
            </div>
            <Link href="/category/all-products" className="text-xs font-bold text-[#0F8A63] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group p-5 bg-white rounded-2xl border border-[#E5EEE8] hover:border-brand-primary/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="w-10 h-10 rounded-xl bg-brand-tint text-brand-primary flex items-center justify-center font-heading font-black text-sm mb-3 group-hover:scale-105 transition-transform">
                    {cat.name[0]}
                  </span>
                  <h3 className="font-heading font-bold text-sm text-brand-dark group-hover:text-brand-primary transition-colors">
                    {cat.name}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-xs text-brand-text-muted mt-4 pt-3 border-t border-[#E5EEE8]">
                  <span>{cat._count?.products || 0} Products</span>
                  <span className="text-brand-primary font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F8A63] mb-1.5">
              <span>Catalog Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-dark font-heading tracking-tight">
              Popular in Store
            </h2>
          </div>
          <Link href="/category/all-products">
            <Button variant="outline" size="sm" className="font-bold text-xs uppercase tracking-wider">
              Browse All Products &rarr;
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const specsStr = product.specifications.map((s) => s.value).slice(0, 2).join(", ");
            const primaryImg = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || "";
            const displayPrice = isDealer && product.dealerPrice
              ? product.dealerPrice
              : isContr && product.contractorPrice
              ? product.contractorPrice
              : product.basePrice;
            const bulkTier = product.bulkPricing[0];

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                brand={product.brand || "KSTC"}
                category={product.category.name}
                imageUrl={primaryImg}
                unitPrice={displayPrice}
                bulkPrice={bulkTier?.pricePerUnit}
                bulkMinQty={bulkTier?.minQuantity}
                inStock={product.stockCount > 0}
                specs={specsStr}
                isTradeUser={isDealer || isContr}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
