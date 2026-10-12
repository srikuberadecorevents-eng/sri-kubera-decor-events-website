"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  SlidersHorizontal,
  Sparkles,
  Lock,
  LogIn,
  UserPlus,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DesignCard from "@/components/ui/DesignCard";
import type { Design, Category } from "@/types";
import { INITIAL_DESIGNS, INITIAL_CATEGORIES } from "@/data/initialDesigns";
import { openAuthModal } from "@/lib/authModal";

const LOCKED_PREVIEWS = [
  {
    id: "locked-marriage-1",
    title: "Royal Golden Temple Wedding Mandapam",
    category: "Marriage",
    image: "/assets/marriage-01.jpeg",
  },
  {
    id: "locked-bday-1",
    title: "Enchanted Pastel Castle Birthday Stage",
    category: "Birthday",
    image: "/assets/birthday-08.jpeg",
  },
  {
    id: "locked-baby-1",
    title: "Traditional Floral Golden Seemantham",
    category: "Baby Shower",
    image: "/assets/babyshower-01.jpeg",
  },
];

export default function GalleryPage() {
  const [dbDesigns, setDbDesigns] = useState<Design[] | null>(null);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGated, setIsGated] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(INITIAL_DESIGNS.length);
  const [lockedCount, setLockedCount] = useState<number>(0);

  const supabase = createClient();

  // Load categories
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get("category");
      if (catParam) setSelectedCategory(catParam);
    }

    let isCancelled = false;
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("name");

        if (!isCancelled && !error && data && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.warn("Could not fetch categories from Supabase, using initial categories:", err);
      }
    }

    loadCategories();
    return () => {
      isCancelled = true;
    };
  }, [supabase]);

  // Fetch designs via server API to enforce server-side gating for guests
  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }
      if (search.trim()) {
        params.set("search", search.trim());
      }

      const res = await fetch(`/api/designs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDbDesigns(data.designs || []);
        setIsGated(!!data.isGated);
        setTotalCount(data.totalCount || INITIAL_DESIGNS.length);
        setLockedCount(data.lockedCount || 0);
      } else {
        // Fallback to checking client auth
        const { data: { session } } = await supabase.auth.getSession();
        const authed = !!session;
        setIsGated(!authed);
        setDbDesigns(!authed ? (INITIAL_DESIGNS.slice(0, 6) as Design[]) : (INITIAL_DESIGNS as Design[]));
        setTotalCount(INITIAL_DESIGNS.length);
        setLockedCount(!authed ? INITIAL_DESIGNS.length - 6 : 0);
      }
    } catch {
      // Fallback
      const { data: { session } } = await supabase.auth.getSession();
      const authed = !!session;
      setIsGated(!authed);
      setDbDesigns(!authed ? (INITIAL_DESIGNS.slice(0, 6) as Design[]) : (INITIAL_DESIGNS as Design[]));
      setTotalCount(INITIAL_DESIGNS.length);
      setLockedCount(!authed ? INITIAL_DESIGNS.length - 6 : 0);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search, supabase]);

  useEffect(() => {
    const debounce = setTimeout(fetchDesigns, 250);
    return () => clearTimeout(debounce);
  }, [fetchDesigns]);

  // Category display order: Birthday → Marriage → Baby Shower
  const CATEGORY_ORDER: Record<string, number> = {
    Birthday: 0,
    Marriage: 1,
    "Baby Shower": 2,
  };

  const displayedDesigns = useMemo(() => {
    const sortByCat = (list: Design[]) =>
      [...list].sort(
        (a, b) =>
          (CATEGORY_ORDER[a.categories?.name ?? ""] ?? 99) -
          (CATEGORY_ORDER[b.categories?.name ?? ""] ?? 99)
      );

    if (dbDesigns && dbDesigns.length > 0) {
      return sortByCat(dbDesigns);
    }
    return [];
  }, [dbDesigns]);

  const activeCategoryObj = useMemo(() => {
    if (selectedCategory === "all") return null;
    return categories.find(
      (c) => c.id === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory, categories]);

  return (
    <div className="py-12 md:py-16 bg-ivory-100">
      <div className="page-container">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 max-w-2xl mx-auto">
          <div className="section-eyebrow">
            <Sparkles size={14} className="text-bronze" />
            <span>Handcrafted Puducherry Stage Décor</span>
          </div>
          <h1 className="section-heading-serif text-navy-950">
            Design Gallery
          </h1>
          <div className="gold-divider mx-auto mt-3 mb-4" />
          <p className="section-subtitle mx-auto">
            Browse our signature decoration stages for birthdays, marriages,
            baby showers, and all special events. Tap any image to view it full screen.
          </p>

          {/* Guest Teaser Notice Pill */}
          {isGated && (
            <div className="mt-4 inline-flex items-center gap-2 bg-gold-50 border border-gold-300 text-navy-900 text-xs px-4 py-1.5 rounded-full shadow-sm">
              <Lock size={12} className="text-gold-600" />
              <span>
                Previewing <strong>{displayedDesigns.length} of {totalCount}</strong> designs.
              </span>
              <button
                onClick={() =>
                  openAuthModal({
                    title: "Sign in to view full gallery",
                    description:
                      "Sign in or create a free account to browse all 30+ exclusive stage decorations.",
                    redirectUrl: "/gallery",
                  })
                }
                className="font-bold text-gold-700 underline hover:text-gold-900 ml-1"
              >
                Sign in to view all
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 md:mb-8 space-y-3">
          {/* Search */}
          <div className="relative w-full max-w-lg">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search designs (e.g. Birthday, Butterfly, Rose)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11 pr-10 bg-white w-full"
              id="gallery-search"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 p-1"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category filter pills */}
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                selectedCategory === "all"
                  ? "bg-navy-900 text-white shadow-md scale-105"
                  : "bg-white text-navy-700 border border-ivory-300 hover:border-gold-400 hover:text-navy-950"
              }`}
            >
              All Stages {isGated ? `(${displayedDesigns.length} Preview)` : `(${totalCount})`}
            </button>
            {categories.map((cat) => {
              const count = INITIAL_DESIGNS.filter(
                (d) => d.category_id === cat.id || d.categories?.name === cat.name
              ).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    selectedCategory === cat.id
                      ? "bg-navy-900 text-white shadow-md scale-105"
                      : "bg-white text-navy-700 border border-ivory-300 hover:border-gold-400 hover:text-navy-950"
                  }`}
                >
                  {cat.name} {count > 0 ? `(${count})` : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && displayedDesigns.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-ivory-300" />
                <div className="p-4">
                  <div className="h-4 bg-ivory-300 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedDesigns.length === 0 ? (
          /* Empty / Gated Category Filter State */
          <div className="text-center bg-white rounded-3xl border border-ivory-300 max-w-lg mx-auto p-8 md:p-10 shadow-sm my-6">
            {isGated && activeCategoryObj ? (
              <>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-500/10 border border-gold-400/30 flex items-center justify-center mb-4">
                  <Lock size={28} className="text-gold-600" />
                </div>
                <h3
                  className="text-xl font-bold text-navy-900 mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {activeCategoryObj.name} Stages Are Locked
                </h3>
                <p className="text-navy-600 text-sm mb-6 leading-relaxed">
                  Our complete {activeCategoryObj.name} collection is exclusive to registered
                  members. Sign in or create a free account to browse all themes and check availability.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() =>
                      openAuthModal({
                        title: `Sign in to unlock ${activeCategoryObj.name} stages`,
                        description: `Create a free account or sign in to browse all ${activeCategoryObj.name} designs and book directly.`,
                        redirectUrl: `/gallery?category=${activeCategoryObj.id}`,
                      })
                    }
                    className="btn-gold text-xs px-5 py-2.5 font-bold flex items-center justify-center gap-2"
                  >
                    <LogIn size={14} />
                    <span>Sign In to Unlock</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSearch("");
                    }}
                    className="btn-outline text-xs px-5 py-2.5"
                  >
                    View Teaser Stages
                  </button>
                </div>
              </>
            ) : (
              <>
                <SlidersHorizontal size={44} className="text-navy-300 mx-auto mb-4" />
                <h3
                  className="text-xl font-bold text-navy-900 mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  No designs matched
                </h3>
                <p className="text-navy-500 text-sm mb-6">
                  We couldn&apos;t find any stage design matching your current filter or search criteria.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearch("");
                  }}
                  className="btn-outline text-xs px-5 py-2.5"
                >
                  Reset Filters
                </button>
              </>
            )}
          </div>
        ) : (
          /* Results Grid */
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-navy-500 text-sm font-medium">
                Showing <span className="font-bold text-navy-900">{displayedDesigns.length}</span>{" "}
                stage design{displayedDesigns.length !== 1 ? "s" : ""}
                {isGated && (
                  <span className="text-gold-600 ml-1.5 font-semibold text-xs">
                    (Public Teaser Preview)
                  </span>
                )}
              </p>
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="text-xs text-gold-600 hover:text-gold-700 font-semibold underline underline-offset-4"
                >
                  View all categories
                </button>
              )}
            </div>

            {/* Design Cards (Teaser for guests, full catalog for members) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {displayedDesigns.map((design) => (
                <DesignCard key={design.id} design={design} />
              ))}
            </div>

            {/* SERVER-SIDE GATED TEASER LOCK SECTION FOR GUESTS */}
            {isGated && (
              <div className="mt-14 space-y-8" id="gallery-gated-section">
                {/* Visual Locked Preview Grid */}
                <div className="relative">
                  <div className="text-center mb-6">
                    <p className="text-xs uppercase tracking-widest text-bronze font-bold">
                      Restricted Access
                    </p>
                    <h2
                      className="text-xl md:text-2xl font-bold text-navy-950 mt-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      30+ More Signature Stages Locked
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                    {LOCKED_PREVIEWS.map((preview) => (
                      <div
                        key={preview.id}
                        onClick={() =>
                          openAuthModal({
                            title: "Sign in to view full gallery",
                            description:
                              "Sign in or create a complimentary account to unlock this stage and our complete collection of 30+ luxury designs.",
                            redirectUrl: "/gallery",
                          })
                        }
                        className="group relative rounded-2xl overflow-hidden border border-[#E8E2D5] bg-white shadow-md cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                      >
                        {/* Blurred Image */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-navy-950">
                          <Image
                            src={preview.image}
                            alt={preview.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover blur-md scale-105 opacity-55 transition-all duration-300 group-hover:scale-110 group-hover:opacity-40"
                          />
                          {/* Centered Lock Overlay */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-navy-950/80 border border-gold-400/60 flex items-center justify-center mb-2.5 shadow-lg group-hover:scale-110 group-hover:border-gold-300 transition-transform">
                              <Lock size={20} className="text-gold-400" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-300 bg-navy-950/80 px-2.5 py-0.5 rounded-full border border-gold-400/30">
                              Members Only
                            </span>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-4 bg-white flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">
                              {preview.category}
                            </span>
                            <h3 className="text-sm font-bold text-navy-900 group-hover:text-gold-700 transition-colors">
                              {preview.title}
                            </h3>
                          </div>
                          <span className="text-xs font-semibold text-gold-700 flex items-center gap-1 shrink-0">
                            Unlock <Lock size={12} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Royal Member Callout Card */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white p-8 sm:p-12 border border-gold-500/30 shadow-2xl text-center">
                  <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />

                  <div className="relative z-10 max-w-xl mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-gold-500/15 border border-gold-400/30 flex items-center justify-center mx-auto mb-4">
                      <Lock size={26} className="text-gold-400" />
                    </div>

                    <p className="text-xs uppercase tracking-[0.2em] text-gold-400 font-bold mb-2">
                      Exclusive Member Portfolio
                    </p>

                    <h2
                      className="text-2xl sm:text-3xl font-bold text-white mb-3"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Unlock All 30+ Grand Stage Designs
                    </h2>

                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto mb-4" />

                    <p className="text-ivory-300 text-sm sm:text-base leading-relaxed mb-8">
                      Sign in or create a complimentary account to access our complete gallery of
                      royal marriage mandapams, baby shower décors, transparent price breakdowns,
                      and direct event booking.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                      <button
                        onClick={() =>
                          openAuthModal({
                            title: "Sign in to unlock all 30+ stages",
                            description:
                              "Create a free account or sign in to browse our entire royal stage collection and view custom pricing.",
                            redirectUrl: "/gallery",
                          })
                        }
                        id="gallery-signin-unlock-btn"
                        className="btn-gold py-3.5 px-7 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
                      >
                        <LogIn size={16} />
                        <span>Sign In to Unlock Full Gallery</span>
                      </button>

                      <Link
                        href="/signup?redirectTo=/gallery"
                        id="gallery-signup-unlock-btn"
                        className="btn-outline border-gold-400/60 text-gold-300 hover:bg-gold-500/10 py-3.5 px-7 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <UserPlus size={16} />
                        <span>Create Free Account</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
