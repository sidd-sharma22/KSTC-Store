"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, MessageSquare, Store, User, ShoppingCart, Menu, X, Home as HomeIcon, LogOut, ShieldCheck, Clock, Building } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/providers/CartProvider";
import { getCurrentUserAction, logoutAction } from "@/app/actions/auth";
import type { SessionPayload } from "@/lib/session";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionPayload | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  useEffect(() => {
    async function loadSession() {
      const user = await getCurrentUserAction();
      setCurrentUser(user);
    }
    loadSession();
  }, []);

  // Close user dropdown on outside click
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
    await logoutAction();
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-4 md:px-8">
      {/* Floating Glass Container */}
      <div className="mx-auto max-w-7xl bg-white border border-brand-border rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm transition-all duration-300">
        
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden p-1">
              <Image src="/kstc-logo.png" alt="KSTC Logo" fill className="object-contain" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="font-heading font-bold text-brand-primary leading-tight text-lg">Khatu Shyam</span>
              <span className="text-[10px] text-brand-text/60 uppercase tracking-widest font-semibold">Trading Co.</span>
            </div>
          </Link>
          <div className="hidden xl:flex items-center gap-2 ml-4 px-3 py-1 bg-white/40 rounded-full border border-white/50 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
            <span className="text-[11px] font-semibold text-brand-primary">Authorized Distributor</span>
          </div>
        </div>

        {/* Center: Search Bar (Glass) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-brand-text/40 group-focus-within:text-brand-accent transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search products, brands, or SKUs..." 
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:bg-white transition-all placeholder:text-brand-text/50 text-sm shadow-sm"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-brand-text/50 bg-white/50 rounded-md border border-brand-border">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Right: Icons & Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Desktop Nav Icons */}
          <div className="hidden lg:flex items-center gap-1">
            <NavIcon href="/" icon={<HomeIcon className="w-4 h-4" />} label="Home" />
            <NavIcon href="/contact-us" icon={<MessageSquare className="w-4 h-4" />} label="Contact" />
            <NavIcon href="/category/all-products" icon={<Store className="w-4 h-4" />} label="Shop" />
            
            {/* Authenticated User Menu or Login Button */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex flex-col items-center justify-center w-[64px] h-[52px] rounded-xl hover:bg-gray-50 transition-colors group relative"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                  </div>
                  <span className="text-[10px] font-medium text-brand-text/80 truncate max-w-[56px] mt-0.5">
                    {currentUser.name?.split(" ")[0] || "Account"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-14 w-64 bg-white rounded-2xl p-4 shadow-xl border border-brand-border z-50 flex flex-col gap-3"
                    >
                      {/* User Info Header */}
                      <div className="border-b border-brand-border/60 pb-3">
                        <div className="font-semibold text-brand-primary text-sm truncate">
                          {currentUser.name || "User"}
                        </div>
                        <div className="text-xs text-brand-text/60 truncate">{currentUser.email}</div>
                        
                        {/* Role & Status Badges */}
                        <div className="flex items-center gap-1.5 mt-2">
                          {currentUser.role === "TRADE" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold border border-blue-200">
                              <Building className="w-3 h-3" /> Trade Partner
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-semibold">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Retail Customer
                            </span>
                          )}

                          {currentUser.role === "TRADE" && currentUser.tradeStatus === "PENDING" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-medium border border-amber-200">
                              <Clock className="w-2.5 h-2.5" /> Verification Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Logout Action */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavIcon href="/login" icon={<User className="w-4 h-4" />} label="Login" />
            )}
          </div>
          
          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2.5 bg-white shadow-sm rounded-xl hover:shadow-md transition-all group flex items-center justify-center border border-brand-border ml-1">
            <ShoppingCart className="w-5 h-5 text-brand-primary group-hover:text-brand-accent transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-bounce">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2.5 bg-white rounded-xl border border-brand-border shadow-sm ml-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-brand-primary" /> : <Menu className="w-5 h-5 text-brand-primary" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Animated) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-4 right-4 bg-white rounded-2xl p-4 lg:hidden shadow-xl border border-brand-border"
          >
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-text/50" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-sm"
              />
            </div>
            
            {/* Mobile Links */}
            <div className="flex flex-col gap-2">
              <MobileNavLink href="/" icon={<HomeIcon className="w-4 h-4" />} label="Home" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink href="/contact-us" icon={<MessageSquare className="w-4 h-4" />} label="Contact Us" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink href="/category/all-products" icon={<Store className="w-4 h-4" />} label="Shop" onClick={() => setIsMobileMenuOpen(false)} />
              
              {currentUser ? (
                <div className="pt-2 border-t border-brand-border/60 mt-1">
                  <div className="px-3 py-2 text-xs font-semibold text-brand-primary flex items-center justify-between">
                    <span>{currentUser.name || currentUser.email}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-md">{currentUser.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-sm font-semibold"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <MobileNavLink href="/login" icon={<User className="w-4 h-4" />} label="Login" onClick={() => setIsMobileMenuOpen(false)} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavIcon({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center w-[60px] h-[52px] rounded-xl hover:bg-gray-50 transition-colors group">
      <div className="text-brand-text/60 group-hover:text-brand-primary transition-colors mb-1">
        {icon}
      </div>
      <span className="text-[10px] font-medium text-brand-text/60 group-hover:text-brand-primary transition-colors">
        {label}
      </span>
    </Link>
  );
}

function MobileNavLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-brand-border/50">
      <div className="text-brand-primary p-2 bg-gray-50 rounded-lg shadow-sm border border-brand-border/30">
        {icon}
      </div>
      <span className="text-sm font-medium text-brand-text">{label}</span>
    </Link>
  );
}
