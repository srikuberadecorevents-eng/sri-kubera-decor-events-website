"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, X, SlidersHorizontal, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DesignCard from "@/components/ui/DesignCard";
import type { Design, Category } from "@/types";
import { INITIAL_DESIGNS, INITIAL_CATEGORIES } from "@/data/initialDesigns";

export default function GalleryPage() {
  const [dbDesigns, setDbDesigns] = useState<Design[] | null>(null);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check initial category query param if present
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get("category");
      if (catParam) setSelectedCategory(catParam);
    }

    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCategories(data);
        }
      });
  }, []);

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("designs")
        .select("*, categories(id, name, created_at)")
        .eq("status", "published")
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }
      if (search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        setDbDesigns(data as any);
      } else {
        setDbDesigns(null);
      }
    } catch {
      setDbDesigns(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchDesigns, 250);
    return () => clearTimeout(debounce);
  }, [fetchDesigns]);

  // Compute the active designs list: if DB returned results use them, otherwise filter fallback data
  const displayedDesigns = useMemo(() => {
    if (dbDesigns && dbDesigns.length > 0) {
      return dbDesigns;
    }
    // Filter INITIAL_DESIGNS
    let list = INITIAL_DESIGNS;
    if (selectedCategory !== "all") {
      list = list.filter(
        (d) =>
          d.category_id === selectedCategory ||
          d.categories?.name.toLowerCase() === selectedCategory.toLowerCase() ||
          d.categories?.id === selectedCategory
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.inclusions?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [dbDesigns, selectedCategory, search]);

  return (
    <div className="py-14 bg-ivory-100 min-h-screen">
      <div className="page-container">
        {/* Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={14} className="text-gold-500" />
            Handcrafted Puducherry Stage Décor
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Design Gallery
          </h1>
          <div className="gold-divider mx-auto mt-4 mb-5" />
          <p className="text-navy-600 text-base leading-relaxed">
            Browse our signature decoration stages for weddings, receptions,
            birthdays, housewarmings, and special events. Select any design to view details and enquire.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search stage designs (e.g. Mandap, Royal, Pastel)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11 pr-10 bg-white"
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
              All Stages ({INITIAL_DESIGNS.length})
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

        {/* Grid */}
        {loading && displayedDesigns.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-ivory-300" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-ivory-300 rounded w-3/4" />
                  <div className="h-3 bg-ivory-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedDesigns.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-ivory-300 max-w-lg mx-auto p-8 shadow-sm">
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
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-navy-500 text-sm font-medium">
                Showing <span className="font-bold text-navy-900">{displayedDesigns.length}</span> stage design{displayedDesigns.length !== 1 ? "s" : ""}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {displayedDesigns.map((design) => (
                <DesignCard key={design.id} design={design} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
