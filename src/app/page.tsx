import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">

      {/* Hero Section */}
      <section
        className="relative w-full overflow-hidden min-h-[600px] lg:min-h-[660px] pt-28 sm:pt-36 pb-36 sm:pb-48 px-4 md:px-8 bg-cover bg-[position:center_center] bg-no-repeat flex items-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        {/* Dark translucent gradient overlay with subtle blur to guarantee 100% text readability across 1170px width while keeping the luxury bathroom visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#111916]/92 via-[#111916]/75 to-[#111916]/40 backdrop-blur-[0.5px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-start text-left">
          <div className="max-w-4xl lg:max-w-5xl flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2.5 mb-4 text-[#34D399] font-bold text-sm sm:text-base uppercase tracking-widest">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-pulse" />
              <span>Gwalior &amp; Chambal Region Authorized Wholesale Distributor</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] xl:text-[74px] font-black text-white font-heading mb-6 leading-[1.08] tracking-tight text-left">
              Premium Plumbing &amp; Sanitary Solutions for{" "}
              <span className="text-[#34D399]">Retail &amp; Trade</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-[#E5EEE8] font-normal leading-relaxed max-w-3xl text-left">
              Authorized wholesale distributor for <strong className="text-white font-bold">Sentini Flopipes</strong>, <strong className="text-white font-bold">Polyworld Tanks</strong>, and <strong className="text-white font-bold">Johnson Pedders</strong>{" "}in Gwalior &amp; Chambal region.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Highlights Grid */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-8 -mt-10 sm:-mt-16 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-[#E5EEE8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCF5E9] border border-[#E5EEE8] flex items-center justify-center text-[#0F8A63] font-heading font-black text-xl shrink-0">
              ✓
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-brand-dark">100% Genuine</h4>
              <p className="text-xs text-brand-text-muted mt-0.5">Authorized factory-direct goods</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-[#E5EEE8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCF5E9] border border-[#E5EEE8] flex items-center justify-center text-[#0F8A63] font-heading font-black text-xl shrink-0">
              ₹
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-brand-dark">Bulk Wholesale</h4>
              <p className="text-xs text-brand-text-muted mt-0.5">Discounted contractor pricing</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-[#E5EEE8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCF5E9] border border-[#E5EEE8] flex items-center justify-center text-[#0F8A63] font-heading font-black text-xl shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-brand-dark">Rapid Dispatch</h4>
              <p className="text-xs text-brand-text-muted mt-0.5">Same-day delivery in Gwalior</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-[#E5EEE8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCF5E9] border border-[#E5EEE8] flex items-center justify-center text-[#0F8A63] font-heading font-black text-xl shrink-0">
              ★
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-brand-dark">ISO Certified</h4>
              <p className="text-xs text-brand-text-muted mt-0.5">Tested for long-term durability</p>
            </div>
          </div>
        </div>
      </section>

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
              View All Products &rarr;
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCard
            id="1"
            title="Sentini CPVC Pipe SDR 11"
            brand="Sentini Flopipes"
            category="Pipes & Fittings"
            imageUrl=""
            unitPrice={269}
            bulkPrice={230}
            bulkMinQty={50}
            inStock={true}
            specs="1/2 inch, 3Mtr Length"
            isTradeUser={true}
          />
          <ProductCard
            id="2"
            title="Sentini UPVC SCH 40 Plain Pipe"
            brand="Sentini Flopipes"
            category="Pipes & Fittings"
            imageUrl=""
            unitPrice={4158}
            bulkPrice={3800}
            bulkMinQty={10}
            inStock={true}
            specs="2.5 inch, 3Mtr Length"
            isTradeUser={true}
          />
          <ProductCard
            id="4"
            title="Johnson's Pedders Ceramic Wash Basin"
            brand="Johnson's Pedders"
            category="Sanitary Ware"
            imageUrl=""
            unitPrice={1250}
            bulkPrice={1050}
            bulkMinQty={10}
            inStock={true}
            specs="White, 18x12 inch"
            isTradeUser={true}
          />
        </div>
      </section>
    </div>
  );
}
