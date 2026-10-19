"use client";

import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Filter, ChevronDown, ChevronUp, X, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";

// Product data extracted from Sentini Catalogue + Johnson's Pedders
const ALL_PRODUCTS = [
  {
    id: "1",
    title: "Sentini CPVC Pipe SDR 11",
    brand: "Sentini Flopipes",
    category: "Pipes & Fittings",
    material: "CPVC",
    imageUrl: "",
    unitPrice: 269,
    bulkPrice: 230,
    bulkMinQty: 50,
    inStock: true,
    specs: "1/2 inch, 3Mtr Length",
  },
  {
    id: "2",
    title: "Sentini UPVC SCH 40 Plain Pipe",
    brand: "Sentini Flopipes",
    category: "Pipes & Fittings",
    material: "UPVC",
    imageUrl: "",
    unitPrice: 4158,
    bulkPrice: 3800,
    bulkMinQty: 10,
    inStock: true,
    specs: "2.5 inch, 3Mtr Length",
  },
  {
    id: "3",
    title: "Sentini SWR Pipe Double Socket",
    brand: "Sentini Flopipes",
    category: "Drainage System",
    material: "SWR",
    imageUrl: "",
    unitPrice: 666,
    bulkPrice: 580,
    bulkMinQty: 20,
    inStock: true,
    specs: "75mm, Ring Fit Type A",
  },
  {
    id: "4",
    title: "Johnson's Pedders Ceramic Wash Basin",
    brand: "Johnson's Pedders",
    category: "Sanitary Ware",
    material: "Ceramic",
    imageUrl: "",
    unitPrice: 1250,
    bulkPrice: 1050,
    bulkMinQty: 10,
    inStock: true,
    specs: "White, 18x12 inch",
  },
  {
    id: "5",
    title: "Sentini CPVC Brass Elbow 90┬░",
    brand: "Sentini Flopipes",
    category: "Pipes & Fittings",
    material: "CPVC",
    imageUrl: "",
    unitPrice: 89,
    bulkPrice: 75,
    bulkMinQty: 180,
    inStock: true,
    specs: "1/2 x 1/2 inch",
  },
  {
    id: "6",
    title: "Sentini SWR Multi Floor Trap",
    brand: "Sentini Flopipes",
    category: "Drainage System",
    material: "SWR",
    imageUrl: "",
    unitPrice: 202,
    bulkPrice: 175,
    bulkMinQty: 24,
    inStock: true,
    specs: "110 x 75 x 50 mm",
  },
  {
    id: "7",
    title: "Sentini UPVC Solvent Cement",
    brand: "Sentini Flopipes",
    category: "Pipes & Fittings",
    material: "UPVC",
    imageUrl: "",
    unitPrice: 125,
    bulkPrice: 105,
    bulkMinQty: 50,
    inStock: true,
    specs: "100ml Can",
  },
  {
    id: "8",
    title: "Johnson's Pedders Single Lever Basin Mixer",
    brand: "Johnson's Pedders",
    category: "Bathroom Ware",
    material: "Brass",
    imageUrl: "",
    unitPrice: 2100,
    bulkPrice: 1800,
    bulkMinQty: 5,
    inStock: true,
    specs: "Chrome Finish",
  },
  {
    id: "9",
    title: "Sentini CPVC Tee",
    brand: "Sentini Flopipes",
    category: "Pipes & Fittings",
    material: "CPVC",
    imageUrl: "",
    unitPrice: 45,
    bulkPrice: 38,
    bulkMinQty: 200,
    inStock: true,
    specs: "1/2 inch",
  },
  {
    id: "10",
    title: "Johnson's Pedders Wall Hung Commode",
    brand: "Johnson's Pedders",
    category: "Sanitary Ware",
    material: "Ceramic",
    imageUrl: "",
    unitPrice: 8500,
    bulkPrice: 7200,
    bulkMinQty: 3,
    inStock: false,
    specs: "White, Soft Close Seat",
  },
  {
    id: "11",
    title: "Sentini UPVC Ball Valve",
    brand: "Sentini Flopipes",
    category: "Pipes & Fittings",
    material: "UPVC",
    imageUrl: "",
    unitPrice: 450,
    bulkPrice: 380,
    bulkMinQty: 20,
    inStock: true,
    specs: "2 inch",
  },
  {
    id: "12",
    title: "Johnson's Pedders Rain Shower Head",
    brand: "Johnson's Pedders",
    category: "Bathroom Ware",
    material: "Brass",
    imageUrl: "",
    unitPrice: 3200,
    bulkPrice: 2800,
    bulkMinQty: 5,
    inStock: true,
    specs: "8 inch, Round, Chrome",
  },
];

type SortOption = "popularity" | "price-asc" | "price-desc" | "newest";

export default function CategoryPage() {
  const params = useParams();
  const slug = (params.slug as string) || "all-products";
  const categoryName = slug === "all-products" ? "All Products" : slug.replace(/-/g, " ");

  // Filter state
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Collapsible filter sections
  const [openSections, setOpenSections] = useState({ brand: true, material: true, price: true });
  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Extract unique brands and materials
  const brands = [...new Set(ALL_PRODUCTS.map(p => p.brand))];
  const materials = [...new Set(ALL_PRODUCTS.map(p => p.material))];

  // Filter + Sort logic
  const filteredProducts = useMemo(() => {
    let results = [...ALL_PRODUCTS];

    // Brand filter
    if (selectedBrands.length > 0) {
      results = results.filter(p => selectedBrands.includes(p.brand));
    }

    // Material filter
    if (selectedMaterials.length > 0) {
      results = results.filter(p => selectedMaterials.includes(p.material));
    }

    // Price range filter
    if (selectedPriceRange === "under-500") {
      results = results.filter(p => p.unitPrice < 500);
    } else if (selectedPriceRange === "500-2000") {
      results = results.filter(p => p.unitPrice >= 500 && p.unitPrice <= 2000);
    } else if (selectedPriceRange === "above-2000") {
      results = results.filter(p => p.unitPrice > 2000);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.specs && p.specs.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        results.sort((a, b) => a.unitPrice - b.unitPrice);
        break;
      case "price-desc":
        results.sort((a, b) => b.unitPrice - a.unitPrice);
        break;
      case "newest":
        results.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      default:
        // popularity: keep original order
        break;
    }

    return results;
  }, [selectedBrands, selectedMaterials, selectedPriceRange, sortBy, searchQuery]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev => prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]);
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedMaterials([]);
    setSelectedPriceRange(null);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedBrands.length > 0 || selectedMaterials.length > 0 || selectedPriceRange !== null || searchQuery.trim().length > 0;

  // Count products per brand/material for badges
  const brandCounts = brands.map(b => ({ name: b, count: ALL_PRODUCTS.filter(p => p.brand === b).length }));
  const materialCounts = materials.map(m => ({ name: m, count: ALL_PRODUCTS.filter(p => p.material === m).length }));

  const filterSidebar = (
    <div className="flex flex-col gap-5">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center p-3.5 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5EEE8] shadow-xs">
          {selectedBrands.map(b => (
            <button key={b} onClick={() => toggleBrand(b)} className="flex items-center gap-1.5 bg-[#DCF5E9] text-[#0F8A63] border border-[#E5EEE8] text-xs font-bold px-3 py-1 rounded-lg hover:bg-[#0F8A63] hover:text-white transition-colors">
              {b} <X className="w-3 h-3 text-current" />
            </button>
          ))}
          {selectedMaterials.map(m => (
            <button key={m} onClick={() => toggleMaterial(m)} className="flex items-center gap-1.5 bg-[#DCF5E9] text-[#0F8A63] border border-[#E5EEE8] text-xs font-bold px-3 py-1 rounded-lg hover:bg-[#0F8A63] hover:text-white transition-colors">
              {m} <X className="w-3 h-3 text-current" />
            </button>
          ))}
          {selectedPriceRange && (
            <button onClick={() => setSelectedPriceRange(null)} className="flex items-center gap-1.5 bg-[#DCF5E9] text-[#0F8A63] border border-[#E5EEE8] text-xs font-bold px-3 py-1 rounded-lg hover:bg-[#0F8A63] hover:text-white transition-colors">
              {selectedPriceRange === "under-500" ? "Under ₹500" : selectedPriceRange === "500-2000" ? "₹500 - ₹2,000" : "Above ₹2,000"} <X className="w-3 h-3 text-current" />
            </button>
          )}
          {searchQuery.trim() && (
            <button onClick={() => setSearchQuery("")} className="flex items-center gap-1.5 bg-[#DCF5E9] text-[#0F8A63] border border-[#E5EEE8] text-xs font-bold px-3 py-1 rounded-lg hover:bg-[#0F8A63] hover:text-white transition-colors">
              Search: &quot;{searchQuery}&quot; <X className="w-3 h-3 text-current" />
            </button>
          )}
          <button onClick={clearAllFilters} className="text-xs font-bold text-red-600 hover:text-red-700 ml-auto underline cursor-pointer">Clear All</button>
        </div>
      )}

      {/* Brand Filter */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5EEE8] p-5 shadow-xs">
        <button onClick={() => toggleSection("brand")} className="w-full font-heading font-black text-brand-dark text-xs uppercase tracking-wider mb-0 flex items-center justify-between cursor-pointer">
          Brand {openSections.brand ? <ChevronUp className="w-4 h-4 text-[#0F8A63]" /> : <ChevronDown className="w-4 h-4 text-brand-text-muted" />}
        </button>
        {openSections.brand && (
          <div className="space-y-3 mt-4 pt-3 border-t border-[#E5EEE8]">
            {brandCounts.map(({ name, count }) => (
              <FilterCheckbox
                key={name}
                id={`brand-${name}`}
                label={name}
                count={count}
                checked={selectedBrands.includes(name)}
                onChange={() => toggleBrand(name)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Material Filter */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5EEE8] p-5 shadow-xs">
        <button onClick={() => toggleSection("material")} className="w-full font-heading font-black text-brand-dark text-xs uppercase tracking-wider mb-0 flex items-center justify-between cursor-pointer">
          Material {openSections.material ? <ChevronUp className="w-4 h-4 text-[#0F8A63]" /> : <ChevronDown className="w-4 h-4 text-brand-text-muted" />}
        </button>
        {openSections.material && (
          <div className="space-y-3 mt-4 pt-3 border-t border-[#E5EEE8]">
            {materialCounts.map(({ name, count }) => (
              <FilterCheckbox
                key={name}
                id={`mat-${name}`}
                label={name}
                count={count}
                checked={selectedMaterials.includes(name)}
                onChange={() => toggleMaterial(name)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5EEE8] p-5 shadow-xs">
        <button onClick={() => toggleSection("price")} className="w-full font-heading font-black text-brand-dark text-xs uppercase tracking-wider mb-0 flex items-center justify-between cursor-pointer">
          Price Range {openSections.price ? <ChevronUp className="w-4 h-4 text-[#0F8A63]" /> : <ChevronDown className="w-4 h-4 text-brand-text-muted" />}
        </button>
        {openSections.price && (
          <div className="space-y-3 mt-4 pt-3 border-t border-[#E5EEE8]">
            <FilterRadio id="price-1" label="Under ₹500" value="under-500" selected={selectedPriceRange} onSelect={setSelectedPriceRange} />
            <FilterRadio id="price-2" label="₹500 - ₹2,000" value="500-2000" selected={selectedPriceRange} onSelect={setSelectedPriceRange} />
            <FilterRadio id="price-3" label="Above ₹2,000" value="above-2000" selected={selectedPriceRange} onSelect={setSelectedPriceRange} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-8">
      
      {/* Category Header with Store Search Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/category/all-products" className="hover:text-brand-primary transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-brand-primary font-black">{categoryName}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark font-heading capitalize tracking-tight">
            {categoryName}
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted mt-2 font-medium">
            Showing {filteredProducts.length} of {ALL_PRODUCTS.length} products
          </p>
        </div>

        {/* Search Bar in Store */}
        <div className="w-full md:w-80 lg:w-96 relative">
          <Search className="w-4 h-4 text-brand-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, pipes, brands..."
            className="w-full pl-10 pr-9 py-2.5 bg-white/90 backdrop-blur-md border border-[#E5EEE8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 focus:border-[#0F8A63] text-brand-text placeholder:text-brand-text-muted transition-all shadow-2xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-primary cursor-pointer p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden w-full flex justify-between items-center bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#E5EEE8] shadow-xs">
          <span className="font-heading font-black text-brand-dark text-xs uppercase tracking-wider">
            Filters {hasActiveFilters && <span className="text-[#0F8A63] ml-1">({selectedBrands.length + selectedMaterials.length + (selectedPriceRange ? 1 : 0)})</span>}
          </span>
          <Button variant="outline" size="sm" icon={<Filter className="w-4 h-4" />} onClick={() => setShowMobileFilters(!showMobileFilters)}>
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        {/* Mobile Filter Panel */}
        {showMobileFilters && (
          <div className="lg:hidden w-full">
            {filterSidebar}
          </div>
        )}

        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-6 sticky top-28">
          {filterSidebar}
        </aside>

        {/* Product Grid Area */}
        <main className="flex-1 w-full">
          
          {/* Sorting Bar */}
          <div className="flex justify-between items-center mb-6 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#E5EEE8] shadow-xs">
            <div className="text-xs font-bold text-brand-text-muted hidden sm:block uppercase tracking-wider">
              {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} available
            </div>
            <div className="flex items-center gap-2.5 ml-auto">
              <span className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">Sort:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortOption)} 
                className="bg-white border border-[#E5EEE8] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F8A63]/30 text-brand-dark font-bold cursor-pointer shadow-xs"
              >
                <option value="popularity">Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/90 backdrop-blur-md rounded-3xl border border-[#E5EEE8] p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#DCF5E9] flex items-center justify-center mb-4 border border-[#E5EEE8]">
                <Filter className="w-6 h-6 text-[#0F8A63]" />
              </div>
              <h3 className="font-heading font-black text-brand-dark text-lg mb-2">No Products Found</h3>
              <p className="text-xs sm:text-sm text-brand-text-muted mb-5 max-w-xs">Try adjusting your filters to find what you&apos;re looking for.</p>
              <Button variant="solid" size="sm" onClick={clearAllFilters} className="font-heading font-bold text-xs uppercase tracking-wider">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  brand={product.brand}
                  category={product.category}
                  imageUrl={product.imageUrl}
                  unitPrice={product.unitPrice}
                  bulkPrice={product.bulkPrice}
                  bulkMinQty={product.bulkMinQty}
                  inStock={product.inStock}
                  specs={product.specs}
                  isTradeUser={true}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterCheckbox({ id, label, count, checked, onChange }: { id: string; label: string; count: number; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onChange}>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 rounded border-[#E5EEE8] text-[#0F8A63] focus:ring-[#0F8A63]/30 cursor-pointer accent-[#0F8A63]"
          onClick={(e) => e.stopPropagation()}
        />
        <label htmlFor={id} className="text-xs font-medium text-brand-text group-hover:text-brand-primary cursor-pointer transition-colors">
          {label}
        </label>
      </div>
      <span className="text-[10px] font-bold text-[#0F8A63] bg-[#DCF5E9] border border-[#E5EEE8] px-2 py-0.5 rounded-md">
        {count}
      </span>
    </div>
  );
}

function FilterRadio({ id, label, value, selected, onSelect }: { id: string; label: string; value: string; selected: string | null; onSelect: (v: string | null) => void }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onSelect(selected === value ? null : value)}>
      <input
        type="radio"
        id={id}
        name="price-range"
        checked={selected === value}
        onChange={() => onSelect(selected === value ? null : value)}
        className="w-4 h-4 border-[#E5EEE8] text-[#0F8A63] focus:ring-[#0F8A63]/30 cursor-pointer accent-[#0F8A63]"
        onClick={(e) => e.stopPropagation()}
      />
      <label htmlFor={id} className="text-xs font-medium text-brand-text group-hover:text-brand-primary cursor-pointer transition-colors">
        {label}
      </label>
    </div>
  );
}
