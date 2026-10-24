"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Check,
  Minus,
  Plus,
  FileText,
  BadgePercent,
  Warehouse,
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getProductByIdAction, SerializedProduct } from "@/app/actions/catalog";
import { getCurrentUserAction } from "@/app/actions/auth";
import type { SessionPayload } from "@/lib/session-types";
import { isAuthorizedDealer, isContractor } from "@/lib/session-types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const id = params.id as string;
  const [product, setProduct] = useState<SerializedProduct | null>(null);
  const [currentUser, setCurrentUser] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isFavorited = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [prodRes, user] = await Promise.all([
        getProductByIdAction(id),
        getCurrentUserAction(),
      ]);

      if (prodRes.success && prodRes.product) {
        setProduct(prodRes.product);
        const minQty = prodRes.product.bulkPricing?.[0]?.minQuantity || 1;
        setQuantity(minQty);
      }
      setCurrentUser(user);
      setLoading(false);
    }
    loadData();
  }, [id]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isDealer = isAuthorizedDealer(currentUser?.role);
  const isContr = isContractor(currentUser?.role);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 py-12 md:px-8">
        <div className="h-8 w-48 bg-white/70 rounded-xl mb-6 animate-pulse border border-[#E5EEE8]" />
        <div className="bg-white/90 rounded-3xl border border-[#E5EEE8] p-8 h-96 animate-pulse" />
      </div>
    );
  }

  // Not Found State
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-24 px-4">
        <h2 className="text-2xl font-bold font-heading text-brand-dark mb-2">Product Not Found</h2>
        <p className="text-brand-text/60 mb-6">The product you are looking for does not exist in our wholesale catalog.</p>
        <Link href="/category/all-products">
          <Button variant="solid">Back to Catalog &rarr;</Button>
        </Link>
      </div>
    );
  }

  const effectiveUnitPrice = isDealer && product.dealerPrice
    ? product.dealerPrice
    : isContr && product.contractorPrice
    ? product.contractorPrice
    : product.basePrice;

  const firstTier = product.bulkPricing?.[0];

  const handleAddToCart = async () => {
    const added = await addToCart(
      {
        id: product.id,
        title: product.title,
        brand: product.brand || "KSTC",
        category: product.category.name,
        imageUrl: product.images[0]?.url || "",
        unitPrice: effectiveUnitPrice,
        bulkPrice: firstTier?.pricePerUnit,
        bulkMinQty: firstTier?.minQuantity,
        isTradeUser: isDealer || isContr,
      },
      quantity
    );
    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleToggleFavorite = () => {
    toggleWishlist({
      id: product.id,
      title: product.title,
      brand: product.brand || "KSTC",
      category: product.category.name,
      imageUrl: product.images[0]?.url || "",
      unitPrice: effectiveUnitPrice,
    });
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-24 md:pb-12">
      {/* Breadcrumbs & Back Navigation */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-6 pb-4 md:px-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs font-bold text-brand-text-muted hover:text-brand-primary transition-colors mb-4 md:hidden uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </button>
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-brand-text-muted uppercase tracking-wider">
          <Link href="/" className="hover:text-brand-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#0F8A63]" />
          <Link href={`/category/${product.category.slug}`} className="hover:text-brand-primary transition-colors">
            {product.category.name}
          </Link>
          <ChevronRight className="w-3 h-3 text-[#0F8A63]" />
          <span className="text-brand-primary font-black truncate max-w-sm">{product.title}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] shadow-xs overflow-hidden flex flex-col lg:flex-row">
          {/* Left: Product Image & Badges */}
          <div className="w-full lg:w-5/12 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#E5EEE8] bg-[#FAF8F2]/60 flex flex-col justify-between">
            <div className="flex justify-between items-start w-full mb-4">
              <span className="bg-[#DCF5E9] px-3 py-1 rounded-xl border border-[#E5EEE8] text-[10px] font-bold text-[#0F8A63] uppercase tracking-wider shadow-xs">
                {product.brand}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="p-2 bg-white rounded-xl text-brand-text-muted hover:text-brand-primary border border-[#E5EEE8] shadow-xs transition-all hover:scale-105 cursor-pointer relative"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copiedLink && (
                    <span className="absolute -bottom-7 right-0 bg-brand-dark text-white text-[10px] px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  aria-label={isFavorited ? "Remove from wishlist" : "Save to wishlist"}
                  className={`p-2 rounded-xl border shadow-xs transition-all hover:scale-105 cursor-pointer ${
                    isFavorited
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white border-[#E5EEE8] text-brand-text-muted hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Main Visual */}
            <div className="w-full py-8 flex items-center justify-center">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 bg-white/90 rounded-2xl flex items-center justify-center border border-[#E5EEE8] shadow-2xs p-4 overflow-hidden">
                {product.images[0]?.url ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.title}
                    fill
                    className="object-contain"
                    sizes="300px"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <span className="w-12 h-12 rounded-2xl bg-brand-tint text-brand-primary flex items-center justify-center font-heading font-black text-sm mb-2 shadow-xs">
                      KSTC
                    </span>
                    <span className="font-heading font-bold text-brand-dark text-xs">{product.brand}</span>
                    <span className="text-[10px] text-brand-text-muted uppercase tracking-wider mt-1">Authorized Factory-Direct</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-brand-text-muted border-t border-[#E5EEE8] pt-3">
              <span>SKU: {product.sku}</span>
              <span>HSN: {product.hsnCode} (GST: {product.gstRate}%)</span>
            </div>
          </div>

          {/* Right: Product Details, Pricing & Action */}
          <div className="w-full lg:w-7/12 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Stock Tag */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-[#0F8A63] uppercase tracking-wider">
                  {product.category.name}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    product.stockCount > 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${product.stockCount > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                  {product.stockCount > 0 ? `In Stock (${product.stockCount} ${product.unit})` : "Out of Stock"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-dark leading-tight tracking-tight mb-4">
                {product.title}
              </h1>

              {/* Pricing Block */}
              <div className="bg-[#FAF8F2] rounded-2xl border border-[#E5EEE8] p-4 sm:p-5 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    {isDealer ? (
                      <div>
                        <span className="inline-block bg-[#DCF5E9] text-[#0F8A63] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                          Authorized Dealer Wholesale Rate
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-heading font-black text-[#0F8A63]">
                            {formatPrice(effectiveUnitPrice)}
                          </span>
                          <span className="text-xs text-brand-text-muted">/ {product.unit} (excl. 18% GST)</span>
                        </div>
                        <span className="text-xs text-brand-text-muted mt-1 block">
                          Standard MRP: <del>{formatPrice(product.basePrice)}</del>
                        </span>
                      </div>
                    ) : isContr ? (
                      <div>
                        <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                          Contractor Project Rate
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-heading font-black text-brand-dark">
                            {formatPrice(effectiveUnitPrice)}
                          </span>
                          <span className="text-xs text-brand-text-muted">/ {product.unit}</span>
                        </div>
                        <span className="text-xs text-brand-text-muted mt-1 block">
                          Retail MRP: <del>{formatPrice(product.basePrice)}</del>
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[11px] font-semibold text-brand-text-muted block mb-0.5">Retail Price (MRP)</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-heading font-black text-brand-dark">
                            {formatPrice(product.basePrice)}
                          </span>
                          <span className="text-xs text-brand-text-muted">/ {product.unit}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center gap-2 mt-3 sm:mt-0">
                    <span className="text-xs font-bold text-brand-dark uppercase tracking-wider mr-1">Qty:</span>
                    <div className="flex items-center bg-white border border-[#E5EEE8] rounded-xl p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FAF8F2] text-brand-dark transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-heading font-bold text-sm text-brand-dark">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FAF8F2] text-brand-dark transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bulk Tiers Matrix */}
                {product.bulkPricing.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#E5EEE8]">
                    <div className="text-[11px] font-bold text-brand-dark uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BadgePercent className="w-3.5 h-3.5 text-[#0F8A63]" />
                      Bulk Volume Discount Tiers
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {product.bulkPricing.map((tier, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-[#E5EEE8] text-center shadow-2xs">
                          <div className="text-[10px] text-brand-text-muted font-bold">Min. {tier.minQuantity} {product.unit}</div>
                          <div className="font-heading font-bold text-xs text-[#0F8A63] mt-0.5">
                            {formatPrice(tier.pricePerUnit)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button
                  variant="solid"
                  size="lg"
                  className="flex-1 font-heading font-black text-xs uppercase tracking-wider py-3.5 shadow-sm"
                  onClick={handleAddToCart}
                  disabled={product.stockCount <= 0 || justAdded}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4 mr-2" /> Added to Cart!
                    </>
                  ) : (
                    "Add to cart"
                  )}
                </Button>
                <Link href="/cart">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto font-heading font-black text-xs uppercase tracking-wider py-3.5">
                    View Cart
                  </Button>
                </Link>
              </div>

              {/* Technical Specifications */}
              {product.specifications.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-heading font-black text-brand-dark text-xs uppercase tracking-wider mb-3">
                    Technical Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {product.specifications.map((spec, i) => (
                      <div key={i} className="flex justify-between p-2.5 rounded-xl bg-[#FAF8F2] border border-[#E5EEE8]">
                        <span className="text-brand-text-muted font-medium">{spec.name}</span>
                        <span className="font-bold text-brand-dark">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="text-xs text-brand-text-muted leading-relaxed mb-6">
                  <h3 className="font-heading font-black text-brand-dark text-xs uppercase tracking-wider mb-2">
                    Product Overview
                  </h3>
                  <p>{product.description}</p>
                </div>
              )}
            </div>

            {/* Warehouse & Delivery Footnote */}
            <div className="pt-4 border-t border-[#E5EEE8] flex flex-wrap items-center justify-between gap-4 text-xs text-brand-text-muted font-medium">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-[#0F8A63]" />
                <span>Available at Warehouse</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0F8A63]" />
                <span>Same-day Dispatch in Gwalior</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0F8A63]" />
                <span>100% Factory Direct Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
