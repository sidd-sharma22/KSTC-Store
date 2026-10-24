"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Store,
  User,
  ShoppingCart,
  Menu,
  X,
  Home as HomeIcon,
  LogOut,
  ShieldCheck,
  Clock,
  Building,
  Info,
  PhoneCall,
  Heart,
  LayoutDashboard,
  Cpu,
  Coins,
  Package,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { getCurrentUserAction, logoutAction } from "@/app/actions/auth";
import type { SessionPayload } from "@/lib/session-types";
import {
  isSuperAdmin,
  isAdminStaff,
  isAuthorizedDealer,
  isPlumber,
  getRoleDisplayName,
} from "@/lib/session-types";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionPayload | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { totalItems, clearCart } = useCart();
  const { totalWishlistItems, clearWishlist } = useWishlist();

  useEffect(() => {
    async function loadSession() {
      const user = await getCurrentUserAction();
      setCurrentUser(user);
    }
    loadSession();
  }, [pathname]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    clearCart();
    clearWishlist();
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("kstc-cart");
        localStorage.removeItem("kstc-wishlist");
      } catch {
        // ignore
      }
      window.dispatchEvent(new Event("kstc:auth-change"));
    }
    await logoutAction();
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    window.location.href = "/";
  };

  const isSuper = isSuperAdmin(currentUser?.role);
  const isAdmin = isAdminStaff(currentUser?.role);
  const isDealer = isAuthorizedDealer(currentUser?.role);
  const isPlum = isPlumber(currentUser?.role);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E5EEE8] shadow-xs transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 md:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden p-1 border border-[#E5EEE8]">
              <Image src="/kstc-logo.png" alt="Khatu Shyam Trading Co. Logo" fill className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-[#18231F] leading-tight text-base sm:text-lg tracking-tight">
                Khatu Shyam Trading Co.
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">
                Authorized Wholesale Distributor
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <HeaderNavLink href="/" icon={<HomeIcon className="w-3.5 h-3.5" />} label="Home" active={pathname === "/"} />
          <HeaderNavLink href="/category/all-products" icon={<Store className="w-3.5 h-3.5" />} label="Store" active={pathname.startsWith("/category")} />
          <HeaderNavLink href="https://kstco.vercel.app/" icon={<Info className="w-3.5 h-3.5" />} label="About" external />
          <HeaderNavLink href="/contact-us" icon={<PhoneCall className="w-3.5 h-3.5" />} label="Contact Us" active={pathname === "/contact-us"} />
        </nav>

        {/* Right: User Menu, Wishlist & Cart */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* User Account Dropdown */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-tint/70 hover:bg-brand-tint transition-all group border border-brand-primary/20 cursor-pointer"
                aria-label="User Account"
              >
                <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                </div>
                <span className="text-xs font-semibold text-brand-primary truncate max-w-[80px] hidden sm:inline">
                  {currentUser.name?.split(" ")[0] || "Account"}
                </span>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-64 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-brand-border z-50 flex flex-col gap-3"
                  >
                    {/* User Info Header */}
                    <div className="border-b border-brand-border/80 pb-3">
                      <div className="font-semibold text-brand-primary text-sm truncate">
                        {currentUser.name || "User"}
                      </div>
                      <div className="text-xs text-brand-text-muted truncate">{currentUser.email}</div>

                      {/* Role & Status Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-tint text-brand-primary rounded-md text-[10px] font-bold border border-brand-border">
                          {getRoleDisplayName(currentUser.role)}
                        </span>

                        {isDealer && currentUser.tradeStatus === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-medium border border-amber-200">
                            <Clock className="w-2.5 h-2.5" /> Pending Verification
                          </span>
                        )}
                        {currentUser.plumberCode && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold border border-blue-200">
                            ID: {currentUser.plumberCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Portal Links */}
                    <div className="flex flex-col gap-1 py-1 text-xs">
                      {isSuper && (
                        <Link
                          href="/dev-admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-brand-dark hover:bg-brand-tint/60 rounded-xl transition-colors font-semibold"
                        >
                          <Cpu className="w-3.5 h-3.5 text-brand-primary" />
                          Developer Dashboard
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-brand-dark hover:bg-brand-tint/60 rounded-xl transition-colors font-semibold"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-brand-primary" />
                          Business Owner Dashboard
                        </Link>
                      )}

                      {isDealer && (
                        <Link
                          href="/dealer"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-brand-dark hover:bg-brand-tint/60 rounded-xl transition-colors font-semibold"
                        >
                          <Building className="w-3.5 h-3.5 text-brand-primary" />
                          Shop Owner Portal
                        </Link>
                      )}

                      {isPlum && (
                        <Link
                          href="/plumber/rewards"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-brand-dark hover:bg-brand-tint/60 rounded-xl transition-colors font-semibold"
                        >
                          <Coins className="w-3.5 h-3.5 text-amber-600" />
                          Plumber Rewards Wallet
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-brand-dark hover:bg-brand-tint/60 rounded-xl transition-colors font-semibold"
                      >
                        <Package className="w-3.5 h-3.5 text-brand-primary" />
                        My Orders &amp; Invoices
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-brand-dark hover:bg-brand-tint/60 rounded-xl transition-colors font-semibold"
                      >
                        <User className="w-3.5 h-3.5 text-brand-primary" />
                        Account Settings
                      </Link>
                    </div>

                    {/* Logout Action */}
                    <div className="border-t border-[#E5EEE8] pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#1F2937] border border-[#E5EEE8] hover:bg-[#DCF5E9] hover:text-[#0F8A63] text-xs font-semibold transition-all shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-[#0F8A63]" />
              <span>Login</span>
            </Link>
          )}

          {/* Wishlist Button with Live Count */}
          <Link
            href="/wishlist"
            className={`relative p-2 rounded-xl transition-all shadow-2xs group flex items-center justify-center border ${
              pathname === "/wishlist"
                ? "bg-brand-tint text-brand-primary border-brand-teal/30 font-bold"
                : "bg-white text-[#1F2937] border-[#E5EEE8] hover:bg-[#DCF5E9] hover:text-[#0F8A63]"
            }`}
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4 transition-colors" />
            {totalWishlistItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white">
                {totalWishlistItems}
              </span>
            )}
          </Link>

          {/* Cart Icon with Live Count */}
          <Link
            href="/cart"
            className={`relative p-2 rounded-xl transition-all shadow-2xs group flex items-center justify-center border ${
              pathname === "/cart"
                ? "bg-brand-tint text-brand-primary border-brand-teal/30 font-bold"
                : "bg-white text-[#1F2937] border-[#E5EEE8] hover:bg-[#DCF5E9] hover:text-[#0F8A63]"
            }`}
            title="Shopping Cart"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4 transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle - Only visible on mobile/tablet portrait (<768px), removed on desktop */}
          <button
            className="md:hidden p-2 bg-white rounded-xl border border-brand-border shadow-2xs text-brand-dark hover:bg-brand-tint transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-brand-primary" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown - Only on screens <768px */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-white/98 backdrop-blur-xl border-b border-[#E5EEE8] shadow-xl p-4 md:hidden z-50"
          >
            <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
              <MobileNavLink href="/" icon={<HomeIcon className="w-4 h-4" />} label="Home" active={pathname === "/"} onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink href="/category/all-products" icon={<Store className="w-4 h-4" />} label="Store Catalog" active={pathname.startsWith("/category")} onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink href="/wishlist" icon={<Heart className="w-4 h-4" />} label={`Wishlist (${totalWishlistItems})`} active={pathname === "/wishlist"} onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink href="https://kstco.vercel.app/" icon={<Info className="w-4 h-4" />} label="About KSTC" external onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink href="/contact-us" icon={<PhoneCall className="w-4 h-4" />} label="Contact Showroom" active={pathname === "/contact-us"} onClick={() => setIsMobileMenuOpen(false)} />

              {currentUser ? (
                <div className="pt-2 border-t border-brand-border/80 mt-1">
                  <div className="px-3 py-2 text-xs font-semibold text-brand-primary flex items-center justify-between">
                    <span>{currentUser.name || currentUser.email}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-brand-tint text-brand-primary font-bold rounded-md">
                      {getRoleDisplayName(currentUser.role)}
                    </span>
                  </div>
                  {isSuper && (
                    <MobileNavLink href="/dev-admin" icon={<Cpu className="w-4 h-4" />} label="Developer Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
                  )}
                  {isAdmin && (
                    <MobileNavLink href="/admin" icon={<LayoutDashboard className="w-4 h-4" />} label="Business Owner Admin" onClick={() => setIsMobileMenuOpen(false)} />
                  )}
                  {isDealer && (
                    <MobileNavLink href="/dealer" icon={<Building className="w-4 h-4" />} label="Shop Owner Portal" onClick={() => setIsMobileMenuOpen(false)} />
                  )}
                  {isPlum && (
                    <MobileNavLink href="/plumber/rewards" icon={<Coins className="w-4 h-4" />} label="Plumber Rewards" onClick={() => setIsMobileMenuOpen(false)} />
                  )}
                  <MobileNavLink href="/orders" icon={<Package className="w-4 h-4" />} label="My Orders" onClick={() => setIsMobileMenuOpen(false)} />
                  <MobileNavLink href="/account" icon={<User className="w-4 h-4" />} label="Account Settings" onClick={() => setIsMobileMenuOpen(false)} />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-sm font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-brand-border/80 mt-1">
                  <MobileNavLink href="/login" icon={<User className="w-4 h-4" />} label="Login / Register" onClick={() => setIsMobileMenuOpen(false)} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeaderNavLink({
  href,
  icon,
  label,
  active,
  external,
}: {
  href: string;
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  external?: boolean;
}) {
  const inner = (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap ${
        active
          ? "bg-brand-tint text-brand-primary border border-brand-teal/20 shadow-2xs font-bold"
          : "text-brand-text hover:text-brand-primary hover:bg-brand-tint/60"
      }`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return <Link href={href}>{inner}</Link>;
}

function MobileNavLink({
  href,
  icon,
  label,
  active,
  external,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  external?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div
        className={`p-2 rounded-lg shadow-2xs border ${
          active
            ? "bg-brand-primary text-brand-sand border-brand-primary"
            : "bg-white text-brand-primary border-brand-border/50"
        }`}
      >
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </>
  );

  const className = `flex items-center gap-3 p-2.5 rounded-xl transition-colors border ${
    active
      ? "bg-brand-tint border-brand-teal/30 text-brand-primary font-bold"
      : "hover:bg-brand-tint border-transparent hover:border-brand-border text-brand-text font-medium"
  }`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {content}
    </Link>
  );
}
