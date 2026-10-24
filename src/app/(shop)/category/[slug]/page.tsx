"use client";

import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Filter, ChevronDown, ChevronUp, X, Search, RefreshCw, Layers } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { getProductsAction, getCategoriesAction, SerializedProduct } from "@/app/actions/catalog";
import { getCurrentUserAction } from "@/app/actions/auth";
import type { SessionPayload } from "@/lib/session-types";
import { isAuthorizedDealer, isContractor } from "@/lib/session-types";

type SortOption = "popularity" | "price-asc" | "price-desc" | "newest";

export default function CategoryPage() {
  const params = useParams();
  const slug = (params.slug as string) || "all-products";

  const [products, setProducts] = useState<SerializedProduct[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; _count?: { products: number } }[]>([]);
  const [currentUser, setCurrentUser] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Collapsible filter sections
  const [openSections, setOpenSections] = useState({ brand: true, price: true });
  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Load user session
  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUserAction();
      setCurrentUser(user);
    }
    loadUser();
  }, []);

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      const res = await getCategoriesAction();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    }
    loadCategories();
  }, []);

  // Load products whenever slug or sorting changes
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      let minPrice: number | undefined;
      let maxPrice: number | undefined;

      if (selectedPriceRange === "under-500") {
        maxPrice = 500;
      } else if (selectedPriceRange === "500-2000") {
        minPrice = 500;
        maxPrice = 2000;
      } else if (selectedPriceRange === "above-2000") {
        minPrice = 2000;
      }

      const res = await getProductsAction({
        categorySlug: slug,
        brand: selectedBrands.length > 0 ? selectedBrands : undefined,
        minPrice,
        maxPrice,
        searchQuery: searchQuery.trim() || undefined,
        sortBy,
        limit: 50,
      });

      if (res.success && res.products) {
        setProducts(res.products);
      }
      setLoading(false);
    }

    loadProducts();
  }, [slug, selectedBrands, selectedPriceRange, searchQuery, sortBy]);

  // Extract available brands dynamically from categories or current list
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    // Always include the core authorized distributor brands
    brandsSet.add("Sentini Flopipes");
    brandsSet.add("Johnson's Pedders");
    brandsSet.add("Polyworld Tanks");
    return Array.from(brandsSet);
  }, [products]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRange(null);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedPriceRange !== null ||
    searchQuery.trim().length > 0;

  const currentCategoryName =
    slug === "all-products"
      ? "All Products"
      : categories.find((c) => c.slug === slug)?.name || slug.replace(/-/g, " ");

  const isDealer = isAuthorizedDealer(currentUser?.role);
  const isContr = isContractor(currentUser?.role);

  const filterSidebar = (
    <div className="flex flex-col gap-5">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center p-3.5 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5EEE8] shadow-xs">
          {selectedBrands.map((b) => (
            <button
              key={b}
              onClick={() => toggleBrand(b)}
              className="flex items-center gap-1.5 bg-[#DCF5E9] text-[#0F8A63] border border-[#E5EEE8] text-xs font-bold px-3 py-1 rounded-lg hover:bg-[#0F8A63] hover:text-white transition-colors cursor-pointer"
            >
              {b} <X className="w-3 h-3 text-current" />
            </button>
          ))}
          {selectedPriceRange && (
            <button
              onClick={() => setSelectedPriceRange(null)}
              className="flex items-center gap-1.5 bg-[#DCF5E9] text-[#0F8A63] border border-[#E5EEE8] text-xs font-bold px-3 py-1 rounded-lg hover:bg-[#0F8A63] hover:text-white transition-colors cursor-pointer"
            >
              {selectedPriceRange === "under-500"
                ? "Under ₹500"
                : selectedPriceRange === "500-2000"
                ? "₹500 - ₹2,000"
                : "Above ₹2,000"}{" "}
              <X className="w-3 h-3 text-current" />
            </button>
          )}
          {searchQuery.trim() && (
            <button
              onClick={() => setSearchQuery("")}
              className="flex items-center gap-1.5 bg-[#DCF5E9] text-[#0F8A63] border border-[#E5EEE8] text-xs font-bold px-3 py-1 rounded-lg hover:bg-[#0F8A63] hover:text-white transition-colors cursor-pointer"
            >
              Search: &quot;{searchQuery}&quot; <X className="w-3 h-3 text-current" />
            </button>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-red-600 hover:text-red-700 ml-auto underline cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Brand Filter */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5EEE8] p-5 shadow-xs">
        <button
          onClick={() => toggleSection("brand")}
          className="w-full font-heading font-black text-brand-dark text-xs uppercase tracking-wider mb-0 flex items-center justify-between cursor-pointer"
        >
          Brand{" "}
          {openSections.brand ? (
            <ChevronUp className="w-4 h-4 text-[#0F8A63]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-brand-text-muted" />
          )}
        </button>
        {openSections.brand && (
          <div className="space-y-3 mt-4 pt-3 border-t border-[#E5EEE8]">
            {availableBrands.map((brandName) => {
              const count = products.filter((p) => p.brand === brandName).length;
              return (
                <FilterCheckbox
                  key={brandName}
                  id={`brand-${brandName}`}
                  label={brandName}
                  count={count}
                  checked={selectedBrands.includes(brandName)}
                  onChange={() => toggleBrand(brandName)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5EEE8] p-5 shadow-xs">
        <button
          onClick={() => toggleSection("price")}
          className="w-full font-heading font-black text-brand-dark text-xs uppercase tracking-wider mb-0 flex items-center justify-between cursor-pointer"
        >
          Price Range{" "}
          {openSections.price ? (
            <ChevronUp className="w-4 h-4 text-[#0F8A63]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-brand-text-muted" />
          )}
        </button>
        {openSections.price && (
          <div className="space-y-3 mt-4 pt-3 border-t border-[#E5EEE8]">
            <FilterRadio
              id="price-1"
              label="Under ₹500"
              value="under-500"
              selected={selectedPriceRange}
              onSelect={setSelectedPriceRange}
            />
            <FilterRadio
              id="price-2"
              label="₹500 - ₹2,000"
              value="500-2000"
              selected={selectedPriceRange}
              onSelect={setSelectedPriceRange}
            />
            <FilterRadio
              id="price-3"
              label="Above ₹2,000"
              value="above-2000"
              selected={selectedPriceRange}
              onSelect={setSelectedPriceRange}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Category Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8 pb-4 md:px-8">
        <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#0F8A63] font-black">{currentCategoryName}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark font-heading tracking-tight capitalize">
              {currentCategoryName}
            </h1>
            <p className="text-xs sm:text-sm text-brand-text-muted mt-2 max-w-xl font-medium">
              Authorized wholesale distributor catalogue for Gwalior &amp; Chambal region. Certified genuine products with immediate warehouse dispatch.
            </p>
          </div>

          {/* Role Status Tag */}
          {isDealer ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-tint border border-brand-primary/20 text-brand-primary text-xs font-bold">
              <span>Authorized Dealer Pricing Active</span>
            </div>
          ) : isContr ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <span>Contractor Project Pricing Active</span>
            </div>
          ) : null}
        </div>

        {/* Quick Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-6 scrollbar-none">
          <Link
            href="/category/all-products"
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              slug === "all-products"
                ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                : "bg-white text-brand-text border-brand-border hover:border-brand-primary/40"
            }`}
          >
            All Products
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                slug === c.slug
                  ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                  : "bg-white text-brand-text border-brand-border hover:border-brand-primary/40"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid & Filter Sidebar */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-4">
        {/* Controls Bar: Search & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5EEE8] p-3 shadow-xs">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-brand-tint text-brand-primary border border-brand-border rounded-xl text-xs font-bold cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters {hasActiveFilters && `(Active)`}
          </button>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-brand-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by product name, size, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 focus:border-[#0F8A63] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-text cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="sort-select" className="text-xs font-bold text-brand-dark uppercase tracking-wider hidden sm:inline">
              Sort:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 bg-[#FAF8F2] border border-[#E5EEE8] rounded-xl text-xs font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 cursor-pointer"
            >
              <option value="popularity">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">{filterSidebar}</div>

          {/* Product Grid Area */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-white/70 rounded-2xl animate-pulse border border-[#E5EEE8]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-tint flex items-center justify-center mb-4">
                  <Layers className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-lg font-black font-heading text-brand-dark mb-1">No Products Found</h3>
                <p className="text-xs text-brand-text-muted max-w-sm mb-6">
                  We couldn&apos;t find any products matching your active filters. Try resetting your search or filters.
                </p>
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => {
                  const specsStr = product.specifications.map((s) => s.value).slice(0, 2).join(", ");
                  const primaryImg = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || "";

                  const displayUnitPrice = isDealer && product.dealerPrice
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
                      unitPrice={displayUnitPrice}
                      bulkPrice={bulkTier?.pricePerUnit}
                      bulkMinQty={bulkTier?.minQuantity}
                      inStock={product.stockCount > 0}
                      specs={specsStr}
                      isTradeUser={isDealer || isContr}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowMobileFilters(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto z-10 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5EEE8] mb-5">
              <span className="font-heading font-black text-brand-dark text-base uppercase tracking-wider">Filters</span>
              <button onClick={() => setShowMobileFilters(false)} className="p-1 rounded-lg hover:bg-[#FAF8F2] text-brand-text-muted cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterSidebar}
            <div className="mt-auto pt-6 border-t border-[#E5EEE8]">
              <Button variant="solid" className="w-full" onClick={() => setShowMobileFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterCheckbox({
  id,
  label,
  count,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center justify-between text-xs font-semibold text-brand-text cursor-pointer hover:text-brand-primary group">
      <div className="flex items-center gap-2.5">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 rounded-md border border-[#E5EEE8] text-[#0F8A63] focus:ring-[#0F8A63]/30 accent-[#0F8A63] cursor-pointer"
        />
        <span>{label}</span>
      </div>
      <span className="text-[11px] font-bold text-brand-text-muted bg-[#FAF8F2] px-2 py-0.5 rounded-md border border-[#E5EEE8] group-hover:bg-[#DCF5E9] group-hover:text-[#0F8A63] transition-colors">
        {count}
      </span>
    </label>
  );
}

function FilterRadio({
  id,
  label,
  value,
  selected,
  onSelect,
}: {
  id: string;
  label: string;
  value: string;
  selected: string | null;
  onSelect: (val: string | null) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2.5 text-xs font-semibold text-brand-text cursor-pointer hover:text-brand-primary">
      <input
        type="radio"
        id={id}
        name="price-filter"
        checked={selected === value}
        onChange={() => onSelect(selected === value ? null : value)}
        className="w-4 h-4 text-[#0F8A63] focus:ring-[#0F8A63]/30 accent-[#0F8A63] cursor-pointer"
      />
      <span>{label}</span>
    </label>
  );
}
