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
  ClipboardList,
  Shield,
  Phone,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types";

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

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auth state & profile sync
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          let resolvedName = data?.name ? data.name.trim() : "";
          if (!resolvedName || resolvedName.toLowerCase() === "user") {
            const metaName = (
              user.user_metadata?.name ||
              user.user_metadata?.full_name ||
              user.user_metadata?.user_name ||
              user.user_metadata?.display_name ||
              ""
            ).trim();

            if (metaName && metaName.toLowerCase() !== "user") {
              resolvedName = metaName;
            } else if (user.email) {
              const prefix = user.email.split("@")[0].replace(/[._\-+]/g, " ").trim();
              resolvedName = prefix
                .split(" ")
                .filter(Boolean)
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(" ");
            }
          }

          if (!resolvedName) resolvedName = "Member";

          const resolvedProfile: Profile = data
            ? { ...data, name: resolvedName }
            : {
                id: user.id,
                email: user.email || "",
                name: resolvedName,
                phone: user.user_metadata?.phone || "",
                role: (user.user_metadata?.role as UserRole) || "user",
                created_at: user.created_at,
              };

          if (data && (!data.name || data.name.trim().toLowerCase() === "user") && resolvedName !== "Member") {
            supabase.from("profiles").update({ name: resolvedName }).eq("id", user.id).then(() => {}, () => {});
          }

          if (mounted) setProfile(resolvedProfile);
        } else {
          if (mounted) setProfile(null);
        }
      } catch (err) {
        console.warn("Header: Auth/Profile fetch error:", err);
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    const onProfileUpdated = () => load();
    window.addEventListener("profile-updated", onProfileUpdated);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      window.removeEventListener("profile-updated", onProfileUpdated);
      subscription.unsubscribe();
    };
  }, [supabase]);

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

  const displayName = profile?.name?.trim() || "Member";
  const initialLetter = displayName.charAt(0).toUpperCase() || "M";
  const firstName = displayName.split(" ")[0];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-2xl shadow-[0_6px_28px_rgba(6,38,30,0.08)] border-b border-gold-400/25"
            : "bg-white/88 backdrop-blur-xl border-b border-ivory-200/90 shadow-[0_2px_12px_rgba(6,38,30,0.03)]"
        }`}
      >
        {/* Subtle Ambient Gold Hairline at Bottom */}
        <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold-400/40 to-transparent pointer-events-none" />

        <div className="page-container">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Brand Medallion & Name */}
            <Link
              href="/"
              className="flex items-center gap-3 group shrink-0 focus-visible:outline-none"
              aria-label="Sri Kubera Decor & Events - Home"
            >
              {/* Luxury Gold Ring Logo Emblem */}
              <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-gold-600 via-gold-300 to-gold-500 shadow-[0_0_12px_rgba(201,162,75,0.28)] group-hover:shadow-[0_0_18px_rgba(201,162,75,0.5)] group-hover:scale-105 transition-all duration-300 shrink-0">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-navy-950">
                  <Image
                    src="/assets/logo.jpeg"
                    alt="Sri Kubera Decor & Events Logo"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col leading-none">
                <span
                  className="text-base sm:text-lg font-bold text-navy-950 group-hover:text-gold-600 transition-colors tracking-tight"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Sri Kubera
                </span>
                <span className="text-[9px] font-bold text-[#7A5B10] tracking-[0.24em] uppercase mt-0.5">
                  Decor &amp; Events
                </span>
              </div>
            </Link>

            {/* Center: Floating Capsule Navigation */}
            <nav
              className="hidden lg:flex items-center p-1 rounded-full bg-navy-950/[0.04] border border-navy-900/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      active
                        ? "bg-white text-navy-950 shadow-[0_2px_10px_rgba(201,162,75,0.22)] border border-gold-400/45 font-bold"
                        : "text-navy-700 hover:text-navy-950 hover:bg-white/80"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-gold-500 shadow-[0_0_6px_#C9A24B] shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Quick Call + Auth + Luxury Enquire CTA */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Quick Call Direct Link (Large screens) */}
              <a
                href="tel:7373876879"
                className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-navy-900 hover:text-bronze hover:bg-gold-50/70 border border-ivory-300 hover:border-gold-300 transition-all shadow-xs"
                title="Call Sri Kubera Decor directly"
              >
                <Phone size={12} className="text-bronze shrink-0" />
                <span>+91 73738 76879</span>
              </a>

              {/* Luxury Shimmering Enquire CTA */}
              <Link
                href="/#post-requirement"
                className="btn-gold !px-3.5 sm:!px-4 !py-1.5 sm:!py-2 !text-[11px] sm:!text-xs flex items-center gap-1.5 shrink-0"
              >
                <Sparkles size={13} className="shrink-0" />
                <span>Enquire</span>
              </Link>

              {/* User Account or Auth Links (Width-stabilized to prevent layout shift) */}
              <div className="min-w-[62px] sm:min-w-[70px] flex items-center justify-end">
                {loading ? (
                  <div className="w-7 h-7 rounded-full bg-ivory-200/60 animate-pulse" />
                ) : profile ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      id="user-menu-trigger"
                      data-testid="user-menu-trigger"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white hover:bg-gold-50/60 transition-all border border-ivory-300 hover:border-gold-300 shadow-xs"
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                      aria-label="User account menu"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs ring-2 ring-gold-400/50 bg-gradient-to-br from-navy-900 to-emerald-950"
                        aria-hidden="true"
                      >
                        {initialLetter}
                      </div>
                      <span className="hidden sm:inline-block text-xs font-bold text-navy-950 max-w-[100px] truncate">
                        {firstName}
                      </span>
                      <ChevronDown
                        size={12}
                        className={`text-navy-500 transition-transform duration-200 ${
                          userMenuOpen ? "rotate-180 text-gold-600" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 top-11 w-64 bg-white/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gold-300/30 py-2 animate-slide-down z-50 overflow-hidden">
                        {/* User Header */}
                        <div className="px-4 py-3 bg-gradient-to-br from-ivory-100 to-ivory-50 border-b border-ivory-200">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[10px] font-bold text-gold-700 uppercase tracking-widest">
                              Signed In
                            </p>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-800 border border-gold-400/30">
                              {profile.role === "admin" ? "Admin" : "Client"}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-navy-950 truncate mt-1">
                            {displayName}
                          </p>
                          <p className="text-xs text-navy-500 truncate">{profile.email}</p>
                        </div>

                        {/* Dropdown Actions */}
                        <div className="py-1">
                          {profile.role === "admin" && (
                            <>
                              <Link
                                href="/admin"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-xs text-gold-700 hover:bg-gold-50 font-bold transition-colors"
                              >
                                <Shield size={15} className="text-gold-600" />
                                <span>Admin Dashboard</span>
                              </Link>
                              <div className="h-px bg-ivory-200 mx-3 my-1" />
                            </>
                          )}
                          <Link
                            href="/enquiries"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs text-navy-800 hover:bg-gold-50/60 hover:text-navy-950 font-semibold transition-colors"
                          >
                            <ClipboardList size={15} className="text-gold-600" />
                            <span>My Enquiries</span>
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs text-navy-800 hover:bg-gold-50/60 hover:text-navy-950 font-semibold transition-colors"
                          >
                            <User size={15} className="text-gold-600" />
                            <span>My Profile</span>
                          </Link>
                        </div>

                        <div className="h-px bg-ivory-200 mx-3 my-1" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50/80 font-bold transition-colors text-left"
                        >
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-end">
                    <Link
                      href="/login"
                      className="text-xs font-bold text-navy-800 hover:text-gold-700 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-ivory-100 transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Button */}
              <button
                id="mobile-menu-toggle"
                data-testid="mobile-menu-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl text-navy-800 hover:bg-gold-50/80 hover:text-gold-700 border border-ivory-300 hover:border-gold-300 transition-all"
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-md animate-fade-in"
          style={{ paddingTop: "4.25rem" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileOpen(false);
          }}
        >
          <div className="bg-white border-b border-ivory-200 shadow-2xl rounded-b-3xl max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            <div className="page-container py-5 space-y-4">
              {/* Mobile Quick Action Pill */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-ivory-100 via-gold-50/40 to-ivory-100 border border-gold-300/40">
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-bronze" />
                  <div>
                    <p className="text-[10px] font-bold text-bronze uppercase tracking-widest leading-none">
                      Direct Booking
                    </p>
                    <a
                      href="tel:7373876879"
                      className="text-xs font-bold text-navy-950 hover:text-bronze transition-colors"
                    >
                      +91 73738 76879
                    </a>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1" aria-label="Mobile navigation">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        active
                          ? "bg-gold-50/90 text-bronze border border-gold-300/60"
                          : "text-navy-800 hover:bg-ivory-100 hover:text-navy-950"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span>{link.label}</span>
                      <ArrowRight
                        size={14}
                        className={active ? "text-bronze" : "text-navy-400"}
                      />
                    </Link>
                  );
                })}
              </nav>

              <div className="h-px bg-ivory-200" />

              {/* Account Section or Auth CTAs */}
              {profile ? (
                <div className="space-y-2">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-ivory-100 to-ivory-50 border border-ivory-200">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-gold-700 uppercase tracking-widest">
                        Your Account
                      </p>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-800 border border-gold-400/30">
                        {profile.role === "admin" ? "Admin" : "Client"}
                      </span>
                    </div>
                    <p className="text-navy-950 font-bold text-sm mt-1">{displayName}</p>
                    <p className="text-xs text-navy-500 truncate">{profile.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/enquiries"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-navy-900 bg-ivory-100 hover:bg-gold-50 transition-colors border border-ivory-200"
                    >
                      <ClipboardList size={14} className="text-gold-600" />
                      <span>My Enquiries</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-navy-900 bg-ivory-100 hover:bg-gold-50 transition-colors border border-ivory-200"
                    >
                      <User size={14} className="text-gold-600" />
                      <span>My Profile</span>
                    </Link>
                  </div>

                  {profile.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-gold-700 bg-gold-50 hover:bg-gold-100 border border-gold-300 transition-colors"
                    >
                      <Shield size={14} />
                      <span>Open Admin Panel</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-100 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="py-3 text-center text-xs font-bold text-navy-800 rounded-xl bg-ivory-100 hover:bg-ivory-200 border border-ivory-200 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="py-3 text-center text-xs font-bold text-navy-950 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 shadow-sm transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

