"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { ChevronRight, Heart, Share2, ShieldCheck, Truck, ArrowLeft, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

// Same product data used across the app
const PRODUCTS: Record<string, {
  id: string; title: string; brand: string; category: string;
  retailPrice: number; tradePrice: number; minTradeQty: number;
  inStock: boolean; description: string; features: string[];
}> = {
  "1": {
    id: "1",
    title: "Sentini CPVC Pipe SDR 11",
    brand: "Sentini Flopipes",
    category: "Pipes & Fittings",
    retailPrice: 269,
    tradePrice: 230,
    minTradeQty: 50,
    inStock: true,
    description: "High-quality CPVC pipe designed for hot and cold water distribution systems. Manufactured using premium resins for maximum durability and heat resistance. Conforms to IS 15778.",
    features: ["Length: 3 Meters", "Standard: SDR 11", "Size: 1/2 inch (15mm)", "Max Operating Temp: 93┬░C", "Lead-free and safe for drinking water"],
  },
  "2": {
    id: "2",
    title: "Sentini UPVC SCH 40 Plain Pipe",
    brand: "Sentini Flopipes",
    category: "Pipes & Fittings",
    retailPrice: 4158,
    tradePrice: 3800,
    minTradeQty: 10,
    inStock: true,
    description: "Heavy-duty UPVC pressure pipe conforming to ASTM D-1785 Schedule 40. Ideal for industrial and agricultural water transport applications.",
    features: ["Length: 3 Meters", "Standard: SCH 40", "Size: 2.5 inch (63mm)", "Pressure Rating: 16 Bar", "UV Resistant"],
  },
  "3": {
    id: "3",
    title: "Sentini SWR Pipe Double Socket",
    brand: "Sentini Flopipes",
    category: "Drainage System",
    retailPrice: 666,
    tradePrice: 580,
    minTradeQty: 20,
    inStock: true,
    description: "SWR (Soil, Waste & Rainwater) pipe with double socket design for quick ring-fit installation. Type A heavy-duty rating for multi-storey buildings.",
    features: ["Size: 75mm", "Type: Ring Fit Type A", "Heavy Duty", "Double Socket Design", "Leak-proof Joints"],
  },
  "4": {
    id: "4",
    title: "Johnson's Pedders Ceramic Wash Basin",
    brand: "Johnson's Pedders",
    category: "Sanitary Ware",
    retailPrice: 1250,
    tradePrice: 1050,
    minTradeQty: 10,
    inStock: true,
    description: "Premium ceramic wash basin with a smooth glossy white finish. Counter-top installation for modern bathrooms. Easy to clean and maintain.",
    features: ["Color: White", "Size: 18x12 inch", "Material: Vitreous China", "Counter-top Mount", "Overflow Hole"],
  },
  "5": {
    id: "5",
    title: "Sentini CPVC Brass Elbow 90┬░",
    brand: "Sentini Flopipes",
    category: "Pipes & Fittings",
    retailPrice: 89,
    tradePrice: 75,
    minTradeQty: 180,
    inStock: true,
    description: "CPVC-to-brass transition elbow for secure connections to metal fittings. 90┬░ angle for directional pipe changes.",
    features: ["Size: 1/2 x 1/2 inch", "Angle: 90┬░", "CPVC to Brass", "IS 15778 Certified", "Hot & Cold Water Compatible"],
  },
  "6": {
    id: "6",
    title: "Sentini SWR Multi Floor Trap",
    brand: "Sentini Flopipes",
    category: "Drainage System",
    retailPrice: 202,
    tradePrice: 175,
    minTradeQty: 24,
    inStock: true,
    description: "Multi-purpose floor trap for bathroom and kitchen drainage. Anti-odour design prevents sewer gas backflow.",
    features: ["Size: 110 x 75 x 50 mm", "Anti-Odour Design", "Without Jali", "Multi-purpose", "Easy Installation"],
  },
  "7": {
    id: "7",
    title: "Sentini UPVC Solvent Cement",
    brand: "Sentini Flopipes",
    category: "Pipes & Fittings",
    retailPrice: 125,
    tradePrice: 105,
    minTradeQty: 50,
    inStock: true,
    description: "High-strength solvent cement for permanent UPVC pipe joints. Fast setting with superior bonding strength.",
    features: ["Volume: 100ml", "Type: Solvent Cement", "Fast Setting", "Superior Bond Strength", "For UPVC Pipes"],
  },
  "8": {
    id: "8",
    title: "Johnson's Pedders Single Lever Basin Mixer",
    brand: "Johnson's Pedders",
    category: "Bathroom Ware",
    retailPrice: 2100,
    tradePrice: 1800,
    minTradeQty: 5,
    inStock: true,
    description: "Premium single lever basin mixer with ceramic cartridge. Chrome-plated brass body for lasting shine and durability.",
    features: ["Finish: Chrome", "Material: Brass", "Ceramic Cartridge", "Single Lever Operation", "5 Year Warranty"],
  },
  "9": {
    id: "9",
    title: "Sentini CPVC Tee",
    brand: "Sentini Flopipes",
    category: "Pipes & Fittings",
    retailPrice: 45,
    tradePrice: 38,
    minTradeQty: 200,
    inStock: true,
    description: "CPVC equal tee fitting for branching pipe connections. Precision-molded for leak-free joints.",
    features: ["Size: 1/2 inch", "Type: Equal Tee", "IS 15778 Certified", "Precision Molded", "Hot & Cold Water"],
  },
  "10": {
    id: "10",
    title: "Johnson's Pedders Wall Hung Commode",
    brand: "Johnson's Pedders",
    category: "Sanitary Ware",
    retailPrice: 8500,
    tradePrice: 7200,
    minTradeQty: 3,
    inStock: false,
    description: "Modern wall-hung commode with concealed cistern compatibility. Soft-close seat included. Space-saving design for contemporary bathrooms.",
    features: ["Color: White", "Soft Close Seat", "Wall Mounted", "Concealed Cistern Compatible", "Easy Clean Glaze"],
  },
  "11": {
    id: "11",
    title: "Sentini UPVC Ball Valve",
    brand: "Sentini Flopipes",
    category: "Pipes & Fittings",
    retailPrice: 450,
    tradePrice: 380,
    minTradeQty: 20,
    inStock: true,
    description: "Industrial-grade UPVC ball valve for on/off flow control. Full bore design for maximum flow rate.",
    features: ["Size: 2 inch", "Full Bore Design", "EPDM Seals", "Manual Operation", "Chemical Resistant"],
  },
  "12": {
    id: "12",
    title: "Johnson's Pedders Rain Shower Head",
    brand: "Johnson's Pedders",
    category: "Bathroom Ware",
    retailPrice: 3200,
    tradePrice: 2800,
    minTradeQty: 5,
    inStock: true,
    description: "Luxury 8-inch round rain shower head with anti-lime nozzles. Chrome finish for a premium look. Ceiling or wall mount compatible.",
    features: ["Size: 8 inch Round", "Finish: Chrome", "Anti-Lime Nozzles", "Ceiling/Wall Mount", "360┬░ Swivel"],
  },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const id = params.id as string;

  const product = PRODUCTS[id];
  const [quantity, setQuantity] = useState(product?.minTradeQty || 1);
  const [justAdded, setJustAdded] = useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle product not found
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-24 px-4">
        <h2 className="text-2xl font-bold font-heading text-brand-primary mb-2">Product Not Found</h2>
        <p className="text-brand-text/60 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/category/all-products">
          <Button variant="solid">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      brand: product.brand,
      category: product.category,
      imageUrl: "",
      unitPrice: product.retailPrice,
      bulkPrice: product.tradePrice,
      bulkMinQty: product.minTradeQty,
      isTradeUser: true,
    }, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="flex flex-col flex-1 pb-24 md:pb-12">
      
      {/* Breadcrumbs & Back */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-6 pb-4 md:px-8">
        <button onClick={() => router.back()} className="inline-flex items-center text-sm font-medium text-brand-text/60 hover:text-brand-primary transition-colors mb-4 md:hidden">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-brand-text/50 uppercase tracking-wider">
          <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/category/all-products" className="hover:text-brand-primary transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-brand-primary">{product.title}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8">
        <div className="bg-white rounded-3xl border border-brand-border/50 shadow-sm overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 p-6 lg:p-12 border-b lg:border-b-0 lg:border-r border-brand-border/50 bg-brand-background/30 flex flex-col">
            <div className="flex justify-between items-start w-full mb-4">
              <span className="bg-white px-3 py-1 rounded-lg border border-brand-border text-[10px] font-bold text-brand-primary uppercase tracking-wider shadow-sm">
                {product.brand}
              </span>
              <div className="flex gap-2">
                <button className="p-2.5 bg-white rounded-full text-brand-text/50 hover:text-brand-primary border border-brand-border shadow-sm transition-all hover:scale-105">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2.5 bg-white rounded-full text-brand-text/50 hover:text-red-500 border border-brand-border shadow-sm transition-all hover:scale-105">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 aspect-square w-full flex items-center justify-center relative">
              <div className="w-3/4 h-3/4 bg-brand-border/20 rounded-2xl flex items-center justify-center border-2 border-dashed border-brand-border/50">
                <span className="font-heading text-brand-text/40 font-medium">Product Image</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col">
            <div className="mb-2 text-sm font-semibold text-brand-accent tracking-widest uppercase">
              {product.category}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold font-heading text-brand-primary leading-tight mb-4">
              {product.title}
            </h1>
            
            <p className="text-brand-text/70 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Pricing Section */}
            <div className="bg-brand-background/50 rounded-2xl p-5 border border-brand-border mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-brand-border/80">
                <div>
                  <div className="text-xs font-semibold text-brand-text/50 uppercase tracking-wider mb-1">Retail Price (MSRP)</div>
                  <div className="text-2xl font-bold text-brand-text">{formatPrice(product.retailPrice)} <span className="text-sm font-medium text-brand-text/50">/ unit</span></div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <div className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Shop / Trade Price</div>
                  </div>
                  <div className="text-2xl font-bold text-green-700">{formatPrice(product.tradePrice)} <span className="text-sm font-medium text-green-600/70">/ unit</span></div>
                  <div className="text-xs text-green-600/80 font-medium mt-1">Min. order: {product.minTradeQty} units</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-brand-primary">{product.inStock ? 'In Stock & Ready to Ship' : 'Out of Stock'}</span>
                </div>
                <span className="text-sm text-brand-text/50">SKU: KSTC-{id.padStart(4, '0')}</span>
              </div>
            </div>

            {/* Quantity & Actions (Desktop) */}
            <div className="hidden md:flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-brand-border rounded-xl bg-white overflow-hidden h-12">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="px-4 text-brand-text/50 hover:text-brand-primary hover:bg-brand-background transition-colors h-full"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center font-bold text-brand-primary outline-none" 
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="px-4 text-brand-text/50 hover:text-brand-primary hover:bg-brand-background transition-colors h-full"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || justAdded}
                  className={`flex-1 h-12 inline-flex items-center justify-center font-bold rounded-xl text-base transition-all duration-200 shadow-md ${
                    justAdded
                      ? "bg-green-500 text-white"
                      : !product.inStock
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-brand-primary text-white hover:bg-brand-primary/90"
                  }`}
                >
                  {justAdded ? (
                    <><Check className="w-5 h-5 mr-2" /> Added to Cart!</>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
              </div>
              <Link href="/cart">
                <Button variant="outline" size="lg" className="w-full">
                  View Cart
                </Button>
              </Link>
            </div>

            {/* Key Features */}
            <div className="mt-auto pt-8 border-t border-brand-border/50">
              <h3 className="font-heading font-semibold text-brand-primary mb-4">Key Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-brand-text/80">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-brand-border/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-primary" />
                <span className="text-xs font-semibold text-brand-text/70 uppercase">Genuine Product</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-primary" />
                <span className="text-xs font-semibold text-brand-text/70 uppercase">Local Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Action Bar (Glass) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/60 p-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex items-center border border-brand-border rounded-xl bg-white overflow-hidden h-10">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 text-brand-text/50 hover:text-brand-primary h-full">
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-brand-primary">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="px-3 text-brand-text/50 hover:text-brand-primary h-full">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || justAdded}
            className={`flex-1 h-10 inline-flex items-center justify-center font-bold rounded-xl text-sm transition-all ${
              justAdded
                ? "bg-green-500 text-white"
                : !product.inStock
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-brand-primary text-white hover:bg-brand-primary/90"
            }`}
          >
            {justAdded ? <><Check className="w-4 h-4 mr-1" /> Added!</> : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
