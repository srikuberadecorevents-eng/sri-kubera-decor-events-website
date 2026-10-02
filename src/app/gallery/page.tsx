"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DesignCard from "@/components/ui/DesignCard";
import type { Design, Category } from "@/types";

export default function GalleryPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("designs")
      .select("*, categories(id, name, created_at)")
      .order("created_at", { ascending: false });

    if (selectedCategory !== "all") {
      query = query.eq("category_id", selectedCategory);
    }
    if (search.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    const { data } = await query;
    setDesigns((data as any) || []);
    setLoading(false);
  }, [selectedCategory, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchDesigns, 300);
    return () => clearTimeout(debounce);
  }, [fetchDesigns]);

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="page-container">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="section-title">Design Gallery</h1>
          <div className="gold-divider mx-auto mt-4 mb-4" />
          <p className="section-subtitle mx-auto">
            Browse our collection of decoration designs, filter by occasion, and
            raise an enquiry on any design you love.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="search"
              placeholder="Search designs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 pr-10"
              id="gallery-search"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-navy-900 text-cream-100"
                  : "bg-white text-navy-700 border border-cream-300 hover:border-navy-300"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-navy-900 text-cream-100"
                    : "bg-white text-navy-700 border border-cream-300 hover:border-navy-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-cream-300" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-cream-300 rounded w-3/4" />
                  <div className="h-3 bg-cream-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-24">
            <SlidersHorizontal size={48} className="text-navy-200 mx-auto mb-4" />
            <h3 className="font-serif font-semibold text-navy-700 text-xl mb-2">
              No designs found
            </h3>
            <p className="text-navy-400 text-sm">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <>
            <p className="text-navy-500 text-sm mb-5">
              Showing {designs.length} design{designs.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <DesignCard key={design.id} design={design} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
