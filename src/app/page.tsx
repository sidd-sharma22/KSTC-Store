import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-20">

      {/* Hero Section */}
      <section
        className="relative w-full overflow-hidden pt-24 pb-32 px-4 md:px-8 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80')" }}
      >
        {/* Dark overlay to ensure text legibility */}
        <div className="absolute inset-0 bg-brand-background/80 md:bg-brand-background/60 backdrop-blur-[2px]" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10 mt-8">
          <h1 className="text-4xl md:text-6xl font-bold text-brand-primary font-heading mb-6 max-w-4xl leading-tight">
            Premium Plumbing & Sanitary Solutions for Retail and Shop
          </h1>
          <p className="text-lg text-brand-text/90 font-medium mb-10 max-w-2xl bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/60">
            Authorized distributor for Sentini Flopipes and Johnson's Pedders in the Gwalior & Chambal region.
          </p>

          {/* Glass Search Banner Overlay */}
          <div className="glass-panel w-full max-w-3xl rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-lg">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="flex-1 w-full px-4 py-3 bg-white/70 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-brand-text font-medium"
            />
            <Button variant="accent" size="lg" className="w-full md:w-auto font-bold text-base">
              Search Catalog
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-brand-primary font-heading">Popular in Shop</h2>
          <Link href="/category/all-products">
            <Button variant="ghost" size="sm">View All &rarr;</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
            id="3"
            title="Sentini SWR Pipe Double Socket"
            brand="Sentini Flopipes"
            category="Drainage System"
            imageUrl=""
            unitPrice={666}
            bulkPrice={580}
            bulkMinQty={20}
            inStock={true}
            specs="75mm, Ring Fit Type A"
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

      {/* About Us Section */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-4">
        <div className="bg-white rounded-3xl border border-brand-border/50 shadow-sm p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/5 rounded-full border border-brand-primary/10">
                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">About Us</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-primary font-heading leading-tight">
                Your Trusted Partner in <span className="text-brand-accent">Plumbing & Sanitary</span>
              </h2>
              <p className="text-brand-text/80 leading-relaxed text-lg">
                We are <strong>Khatu Shyam Trading Co.</strong>, the authorized distributor for Sentini Flopipes and Johnson's Pedders in the Gwalior & Chambal region.
              </p>
              <p className="text-brand-text/70 leading-relaxed">
                With a strong commitment to quality and service, we supply a comprehensive range of plumbing and sanitary solutions to both retail customers and trade partners. Our product lineup includes UPVC, CPVC, SWR, and Agri pipes, along with premium sanitary ware, water tanks, and fitting accessories.
              </p>
              <div className="pt-4">
                <Link href="/contact-us">
                  <Button variant="outline" className="font-semibold">Get in Touch</Button>
                </Link>
              </div>
            </div>

            <div className="w-full md:w-1/3 shrink-0 flex justify-center">
              <div className="relative w-48 h-48 md:w-64 md:h-64 bg-gray-50 rounded-full border-8 border-white shadow-xl flex items-center justify-center p-6">
                <Image src="/kstc-logo.png" alt="KSTC Logo" fill className="object-contain p-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands We Deal In */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-primary font-heading mb-4">Brands We Deal In</h2>
          <p className="text-brand-text/60 max-w-2xl mx-auto">We partner with industry-leading brands to bring you the highest quality products for your construction and renovation needs.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {/* Sentini Flopipes */}
          <div className="bg-white group rounded-2xl border border-brand-border hover:border-brand-accent/40 shadow-sm hover:shadow-md transition-all duration-300 w-40 h-40 md:w-56 md:h-56 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-full h-full flex items-center justify-center">
              <a href="https://www.sentiniflopipes.com/" target="_blank"><Image src="/brands/sentini.png" alt="Sentini Flopipes" fill className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" /></a>
            </div>
          </div>

          {/* Johnson's Pedders */}
          <div className="bg-white group rounded-2xl border border-brand-border hover:border-brand-accent/40 shadow-sm hover:shadow-md transition-all duration-300 w-40 h-40 md:w-56 md:h-56 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-full h-full flex items-center justify-center">
              <a href="https://www.johnsonpedder.in/" target="_blank"><Image src="/brands/johnson-pedders.png" alt="Johnson Pedders" fill className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" /></a>
            </div>
          </div>

          {/* Polyworld Tanks */}
          <div className="bg-white group rounded-2xl border border-brand-border hover:border-brand-accent/40 shadow-sm hover:shadow-md transition-all duration-300 w-40 h-40 md:w-56 md:h-56 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-center z-10 group-hover:text-brand-accent transition-colors">
              <a href="https://www.polyworld.in/" target="_blank"><Image src="/brands/polyworld.png" alt="Polyworld Tanks" fill className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" /></a>
            </div>
          </div>


        </div>
      </section>
    </div>
  );
}
