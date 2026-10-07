"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Palette,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Pencil,
  Archive,
  RotateCcw,
  Trash2,
  Star,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { CardGridSkeleton, TableSkeleton } from "@/components/admin/Skeleton";
import type { Design, Category, DesignStatus } from "@/types";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 20;

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | DesignStatus>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Delete dialogs
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);
  const [activeDesign, setActiveDesign] = useState<Design | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [enquiryCountForActive, setEnquiryCountForActive] = useState<number>(0);

  const supabase = createClient();

  // Fetch categories
  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  // Fetch designs
  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("designs")
        .select("*, categories(name, slug)")
        .order("created_at", { ascending: false });

      if (categoryFilter !== "all") {
        query = query.eq("category_id", categoryFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDesigns(data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Fetch designs error:", err);
      toast.error("Failed to load designs");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(fetchDesigns, 300);
    return () => clearTimeout(timer);
  }, [fetchDesigns]);

  // Pagination calculation
  const totalItems = designs.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedDesigns = designs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Selection toggle
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedDesigns.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedDesigns.map((d) => d.id));
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = async (targetStatus: DesignStatus) => {
    if (!selectedIds.length) return;
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("designs")
        .update({
          status: targetStatus,
          deleted_at: targetStatus === "archived" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .in("id", selectedIds);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/", "/gallery"]);

      toast.success(
        `Updated ${selectedIds.length} design(s) to ${targetStatus}`
      );
      setSelectedIds([]);
      fetchDesigns();
    } catch (err) {
      console.error("Bulk action error:", err);
      toast.error("Failed to update selected designs");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkCategoryChange = async (targetCatId: string) => {
    if (!selectedIds.length || !targetCatId) return;
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("designs")
        .update({
          category_id: targetCatId,
          updated_at: new Date().toISOString(),
        })
        .in("id", selectedIds);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/", "/gallery"]);

      const catName = categories.find((c) => c.id === targetCatId)?.name;
      toast.success(
        `Assigned ${selectedIds.length} design(s) to "${catName}"`
      );
      setSelectedIds([]);
      fetchDesigns();
    } catch (err) {
      console.error("Bulk category error:", err);
      toast.error("Failed to update category");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Soft Archive Handler
  const requestArchive = (design: Design) => {
    setActiveDesign(design);
    setArchiveDialogOpen(true);
  };

  const executeArchive = async () => {
    if (!activeDesign) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("designs")
        .update({
          status: "archived",
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeDesign.id);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/", "/gallery"]);

      toast.success(`"${activeDesign.title}" has been archived`);
      setArchiveDialogOpen(false);
      setActiveDesign(null);
      fetchDesigns();
    } catch (err) {
      console.error("Archive error:", err);
      toast.error("Failed to archive design");
    } finally {
      setDeleting(false);
    }
  };

  // Restore Handler (from Archived view)
  const handleRestore = async (design: Design) => {
    try {
      const { error } = await supabase
        .from("designs")
        .update({
          status: "published",
          deleted_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", design.id);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/", "/gallery"]);

      toast.success(`"${design.title}" restored and published`);
      fetchDesigns();
    } catch {
      toast.error("Failed to restore design");
    }
  };

  // Hard Delete Handler (guarded)
  const requestHardDelete = async (design: Design) => {
    setActiveDesign(design);

    // Check if enquiries exist
    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("design_id", design.id);

    setEnquiryCountForActive(count || 0);
    setHardDeleteDialogOpen(true);
  };

  const executeHardDelete = async () => {
    if (!activeDesign) return;
    if (enquiryCountForActive > 0) {
      toast.error(
        `Cannot permanently delete: ${enquiryCountForActive} booking enquiries reference this design.`
      );
      return;
    }

    setDeleting(true);
    try {
      // 1. Delete associated design_images
      await supabase.from("design_images").delete().eq("design_id", activeDesign.id);

      // 2. Delete the design row
      const { error } = await supabase
        .from("designs")
        .delete()
        .eq("id", activeDesign.id);

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/", "/gallery"]);

      toast.success(`Permanently deleted "${activeDesign.title}"`);
      setHardDeleteDialogOpen(false);
      setActiveDesign(null);
      fetchDesigns();
    } catch (err) {
      console.error("Hard delete error:", err);
      toast.error("Failed to delete design");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
            Designs
          </h1>
          <p className="text-sm text-[#5D6D67] mt-1">
            Manage stage decorations, pricing, inclusions, and photo galleries.
          </p>
        </div>

        <Link
          href="/admin/designs/new"
          className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-sm font-semibold transition-all shadow-sm shrink-0"
        >
          <Plus size={16} />
          Add New Design
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search designs by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-[40px] text-xs pl-10 pr-9 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D6D67] hover:text-[#17211E] p-1"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-h-[40px] text-xs px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="min-h-[40px] text-xs px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* View Mode Toggle (Grid/List) */}
          <div className="flex items-center gap-1 border border-[#E8E2D5] p-1 rounded-xl bg-[#FAF6EC]/50 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#0B4A3A] shadow-xs"
                  : "text-[#5D6D67] hover:text-[#17211E]"
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-[#0B4A3A] shadow-xs"
                  : "text-[#5D6D67] hover:text-[#17211E]"
              }`}
              title="List view"
              aria-label="List view"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar (appears when items are selected) */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E2D5] bg-[#FAF6EC]/60 -mx-4 -mb-4 p-4 rounded-b-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0B4A3A]">
                {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-[#5D6D67] hover:underline ml-2"
              >
                Clear selection
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkStatusChange("published")}
                disabled={bulkActionLoading}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-[#0B4A3A] border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                Publish Selected
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("draft")}
                disabled={bulkActionLoading}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200 transition-colors"
              >
                Draft Selected
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("archived")}
                disabled={bulkActionLoading}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                Archive Selected
              </button>

              {/* Set Category dropdown */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkCategoryChange(e.target.value);
                    e.target.value = "";
                  }
                }}
                disabled={bulkActionLoading}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-[#E8E2D5] bg-white text-[#17211E]"
                aria-label="Set category for selected"
              >
                <option value="">Move to Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Grid or List */}
      {loading ? (
        viewMode === "grid" ? (
          <CardGridSkeleton count={6} />
        ) : (
          <TableSkeleton rows={8} />
        )
      ) : displayedDesigns.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No Designs Found"
          description={
            search || categoryFilter !== "all" || statusFilter !== "all"
              ? "No stage decorations match your active filter criteria."
              : "Start by creating your first stage decoration design."
          }
          actionLabel="Add Design"
          actionHref="/admin/designs/new"
        />
      ) : viewMode === "grid" ? (
        /* ── Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedDesigns.map((design) => {
            const isSelected = selectedIds.includes(design.id);

            return (
              <div
                key={design.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group ${
                  isSelected
                    ? "border-[#0B4A3A] ring-2 ring-[#0B4A3A]/20"
                    : "border-[#E8E2D5]"
                }`}
              >
                {/* Photo Header */}
                <div className="relative aspect-[4/3] bg-[#FAF6EC]">
                  <Image
                    src={design.image_url}
                    alt={design.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />

                  {/* Selection Checkbox */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <button
                      type="button"
                      onClick={() => toggleSelect(design.id)}
                      className="w-6 h-6 rounded-md bg-white/90 shadow-sm flex items-center justify-center text-[#0B4A3A] hover:bg-white cursor-pointer"
                      aria-label="Select design"
                    >
                      {isSelected ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} className="text-[#5D6D67]" />
                      )}
                    </button>
                  </div>

                  {/* Status & Featured badges */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                    {design.is_featured && (
                      <span className="bg-[#C9A24B] text-[#05241C] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <Star size={10} className="fill-[#05241C]" />
                        Featured
                      </span>
                    )}
                    <StatusBadge status={design.status || "published"} size="sm" />
                  </div>

                  {/* Category pill */}
                  {design.categories && (
                    <span className="absolute bottom-2.5 left-2.5 bg-[#0B4A3A]/90 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      {design.categories.name}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-serif font-bold text-base text-[#17211E] line-clamp-1 mb-1"
                      title={design.title}
                    >
                      {design.title}
                    </h3>

                    <p className="text-xs font-semibold text-[#0B4A3A] mb-2">
                      {design.price_on_request || !design.price
                        ? "Price on Request"
                        : `Rs. ${Number(design.price).toLocaleString("en-IN")}`}
                    </p>

                    {design.description && (
                      <p className="text-xs text-[#5D6D67] line-clamp-2 leading-relaxed mb-3">
                        {design.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#E8E2D5] mt-2">
                    <Link
                      href={`/admin/designs/${design.id}`}
                      className="flex-1 min-h-[36px] px-3 py-1.5 bg-[#FAF6EC] hover:bg-[#E8E2D5] text-[#17211E] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Pencil size={13} />
                      Edit
                    </Link>

                    {design.status === "archived" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRestore(design)}
                          className="min-h-[36px] px-2.5 py-1.5 bg-emerald-50 text-[#0B4A3A] hover:bg-emerald-100 text-xs font-medium rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                          title="Restore and publish"
                        >
                          <RotateCcw size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestHardDelete(design)}
                          className="min-h-[36px] px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                          title="Permanent delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => requestArchive(design)}
                        className="min-h-[36px] px-2.5 py-1.5 text-[#5D6D67] hover:text-amber-700 hover:bg-amber-50 text-xs font-medium rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                        title="Archive (hide from website)"
                      >
                        <Archive size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── List / Table View ── */
        <div className="bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF6EC]/80 border-b border-[#E8E2D5] text-xs font-semibold text-[#17211E] uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-10">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-[#0B4A3A] cursor-pointer"
                      aria-label="Select all designs on page"
                    >
                      {selectedIds.length === displayedDesigns.length ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Design</th>
                  <th className="py-3 px-4 hidden md:table-cell">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {displayedDesigns.map((design) => {
                  const isSelected = selectedIds.includes(design.id);

                  return (
                    <tr
                      key={design.id}
                      className={`hover:bg-[#FAF6EC]/50 transition-colors ${
                        isSelected ? "bg-[#FAF6EC]/80" : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(design.id)}
                          className="w-4 h-4 rounded text-[#0B4A3A] focus:ring-[#0B4A3A] cursor-pointer"
                          aria-label={`Select ${design.title}`}
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-[#FAF6EC] shrink-0 border border-[#E8E2D5]">
                            <Image
                              src={design.image_url}
                              alt={design.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#17211E] line-clamp-1">
                              {design.title}
                            </p>
                            {design.is_featured && (
                              <span className="text-[10px] text-[#C9A24B] font-bold flex items-center gap-1">
                                <Star size={10} className="fill-[#C9A24B]" />
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 hidden md:table-cell text-xs text-[#5D6D67]">
                        {design.categories?.name || "Uncategorised"}
                      </td>

                      <td className="py-3 px-4 text-xs font-semibold text-[#0B4A3A]">
                        {design.price_on_request || !design.price
                          ? "On Request"
                          : `Rs. ${Number(design.price).toLocaleString("en-IN")}`}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={design.status || "published"} size="sm" />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/designs/${design.id}`}
                            className="p-1.5 rounded-lg text-[#5D6D67] hover:text-[#17211E] hover:bg-[#FAF6EC] transition-colors"
                            title="Edit design"
                          >
                            <Pencil size={15} />
                          </Link>

                          {design.status === "archived" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRestore(design)}
                                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="Restore"
                              >
                                <RotateCcw size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => requestHardDelete(design)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Permanent Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => requestArchive(design)}
                              className="p-1.5 rounded-lg text-[#5D6D67] hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Archive design"
                            >
                              <Archive size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[#5D6D67]">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of {totalItems}{" "}
            designs
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FAF6EC] cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#E8E2D5] text-[#17211E]">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FAF6EC] cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Soft Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={archiveDialogOpen}
        onClose={() => {
          setArchiveDialogOpen(false);
          setActiveDesign(null);
        }}
        onConfirm={executeArchive}
        title="Archive Design"
        description={`Archive "${activeDesign?.title}"? It will be immediately hidden from the public website gallery. You can restore it from the Archived filter at any time.`}
        confirmLabel="Archive Design"
        isDestructive={false}
        isLoading={deleting}
      />

      {/* Hard Delete Confirmation Dialog (requires typed confirmation "DELETE" and guarded if enquiries exist) */}
      <ConfirmDialog
        isOpen={hardDeleteDialogOpen}
        onClose={() => {
          setHardDeleteDialogOpen(false);
          setActiveDesign(null);
        }}
        onConfirm={executeHardDelete}
        title="Permanently Delete Design"
        description={
          enquiryCountForActive > 0
            ? `Cannot permanently delete: This design has ${enquiryCountForActive} customer enquiry record(s) linked to it. It must remain in the Archive to maintain historical records.`
            : `Are you absolutely sure you want to permanently delete "${activeDesign?.title}" and all its photo records? This action CANNOT be reversed.`
        }
        confirmLabel="Delete Forever"
        isDestructive
        typedConfirmationText={enquiryCountForActive > 0 ? undefined : "DELETE"}
        isLoading={deleting}
      />
    </div>
  );
}
