"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auth state
  useEffect(() => {
    let mounted = true;
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (mounted) setProfile(data);
      }
      if (mounted) setLoading(false);
    }
    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Click outside user menu
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/96 backdrop-blur-xl shadow-[0_2px_24px_rgba(31,58,95,0.10)] border-b border-ivory-200"
            : "bg-white/90 backdrop-blur-md"
        }`}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              {/* Brand Logo */}
              <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#C9A24B]/50 shadow-sm group-hover:scale-105 transition-transform">
                <Image
                  src="/assets/logo.jpeg"
                  alt="Sri Kubera Decor & Events Logo"
                  fill
                  sizes="36px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="text-base font-bold text-navy-900 group-hover:text-gold-600 transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Sri Kubera
                </span>
                <span className="text-[10px] font-semibold text-gold-500 tracking-[0.18em] uppercase mt-0.5">
                  Decor &amp; Events
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "text-gold-600"
                      : "text-navy-700 hover:text-navy-900 hover:bg-navy-50"
                  }`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full bg-gold-500" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2">
              {loading ? (
                <div className="w-24 h-9 bg-ivory-200 rounded-full animate-pulse" />
              ) : profile ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-navy-50 transition-colors"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--color-navy-900), var(--color-navy-700))" }}
                      aria-hidden="true"
                    >
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-navy-800 max-w-[100px] truncate">
                      {profile.name.split(" ")[0]}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-navy-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-56 card shadow-card-hover py-1.5 animate-slide-down z-50">
                      {profile.role === "admin" && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold-700 hover:bg-gold-50 font-semibold transition-colors"
                          >
                            <Shield size={15} />
                            Admin Panel
                          </Link>
                          <div className="h-px bg-ivory-200 mx-3 my-1" />
                        </>
                      )}
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50 transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>
                      <Link
                        href="/enquiries"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50 transition-colors"
                      >
                        <ClipboardList size={15} />
                        My Enquiries
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50 transition-colors"
                      >
                        <User size={15} />
                        My Profile
                      </Link>
                      <div className="h-px bg-ivory-200 mx-3 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="btn-ghost text-sm">
                    Sign In
                  </Link>
                  <Link href="/signup" className="btn-primary text-sm px-5 py-2">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — full-screen overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-white animate-fade-in"
          style={{ paddingTop: "4rem" }}
        >
          <div className="page-container py-6 h-full overflow-y-auto">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-semibold transition-colors ${
                    isActive(link.href)
                      ? "bg-gold-50 text-gold-700"
                      : "text-navy-800 hover:bg-navy-50"
                  }`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="w-2 h-2 rounded-full bg-gold-500" aria-hidden="true" />
                  )}
                </Link>
              ))}
            </nav>

            <div className="h-px bg-ivory-200 my-5" />

            {profile ? (
              <div className="space-y-1">
                <div className="px-4 py-2 mb-2">
                  <p className="text-xs font-semibold text-navy-400 uppercase tracking-widest">
                    Your Account
                  </p>
                  <p className="text-navy-900 font-semibold mt-1">{profile.name}</p>
                </div>
                {profile.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold text-gold-700 hover:bg-gold-50 transition-colors"
                  >
                    <Shield size={18} />
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-navy-800 hover:bg-navy-50 transition-colors"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <Link
                  href="/enquiries"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-navy-800 hover:bg-navy-50 transition-colors"
                >
                  <ClipboardList size={18} />
                  My Enquiries
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-navy-800 hover:bg-navy-50 transition-colors"
                >
                  <User size={18} />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 px-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-outline text-center py-3.5 text-base"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-center py-3.5 text-base"
                >
                  Create Free Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
