"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ClipboardList,
  Search,
  Download,
  Phone,
  MessageCircle,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useRealtimeBadges } from "@/components/admin/RealtimeBadgesProvider";
import { deleteAdminItem } from "@/app/actions/admin-delete";
import type { Booking, Category } from "@/types";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 20;

export function extractCustomerInfo(b: Booking) {
  let name = b.customer_name || b.profiles?.name;
  let phone = b.customer_phone || b.profiles?.phone;
  let designTitle = b.designs?.title;

  const notes = `${b.admin_notes || ""} ${b.message || ""}`;

  if (!name || name.trim().toLowerCase() === "customer" || name.trim().toLowerCase() === "guest visitor") {
    const nameMatch =
      notes.match(/Client:\s*([^.]+)\./i) ||
      notes.match(/My Name:\s*([^\n]+)/i) ||
      notes.match(/Name:\s*([^.\n]+)/i);
    if (nameMatch && nameMatch[1]?.trim()) {
      name = nameMatch[1].trim();
    }
  }

  if (!phone || phone.trim() === "") {
    const phoneMatch =
      notes.match(/Phone:\s*([0-9+\s-]{8,15})/i) ||
      notes.match(/Contact:\s*([0-9+\s-]{8,15})/i);
    if (phoneMatch && phoneMatch[1]?.trim()) {
      phone = phoneMatch[1].trim();
    }
  }

  if (!designTitle || designTitle.trim() === "") {
    const designMatch =
      notes.match(/Design:\s*([^.(]+)/i) ||
      notes.match(/Enquired design:\s*([^.\n]+)/i);
    if (designMatch && designMatch[1]?.trim()) {
      designTitle = designMatch[1].trim();
    }
  }

  return {
    name: name && name.trim() ? name.trim() : "Customer",
    phone: phone && phone.trim() ? phone.trim() : "No phone",
    rawPhone: phone && phone.trim() ? phone.replace(/\D/g, "") : "",
    designTitle: designTitle && designTitle.trim() ? designTitle.trim() : "Custom Decoration",
  };
}

export default function AdminEnquiriesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<"booking_date" | "event_date">("booking_date");
  const [currentPage, setCurrentPage] = useState(1);

  // Selection & Delete State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Booking | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();
  const { refresh: refreshBadges } = useRealtimeBadges();

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => setCategories((data || []) as { id: string; name: string }[]));
  }, [supabase]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("bookings")
        .select(
          "id, enquiry_id, customer_name, customer_phone, customer_email, message, admin_notes, status, booking_date, event_date, venue, user_id, design_id, profiles(id, name, phone, email, address, pincode), designs(id, title, image_url, price, category_id, categories(name)), booking_private(internal_notes, quoted_price)"
        );

      if (sortBy === "event_date") {
        query = query.order("event_date", { ascending: true, nullsFirst: false });
      } else {
        query = query.order("booking_date", { ascending: false });
      }

      if (status !== "all") {
        if (status === "pending" || status === "new") {
          query = query.in("status", ["pending", "new"]);
        } else {
          query = query.eq("status", status);
        }
      }

      if (dateFrom) {
        query = query.gte("booking_date", new Date(dateFrom).toISOString());
      }

      if (dateTo) {
        const toDateObj = new Date(dateTo);
        toDateObj.setHours(23, 59, 59, 999);
        query = query.lte("booking_date", toDateObj.toISOString());
      }

      const { data: initialData, error } = await query;
      let data = initialData;
      if (error && (error as any).code === "42703") {
        const fallbackQuery = supabase
          .from("bookings")
          .select(
            "id, enquiry_id, admin_notes, status, booking_date, event_date, venue, user_id, design_id, profiles(id, name, phone, email, address, pincode), designs(id, title, image_url, price, category_id, categories(name)), booking_private(internal_notes, quoted_price)"
          );

        if (sortBy === "event_date") {
          fallbackQuery.order("event_date", { ascending: true, nullsFirst: false });
        } else {
          fallbackQuery.order("booking_date", { ascending: false });
        }

        if (status !== "all") {
          if (status === "pending" || status === "new") {
            fallbackQuery.in("status", ["pending", "new"]);
          } else {
            fallbackQuery.eq("status", status);
          }
        }

        const fallbackRes = await fallbackQuery;
        if (fallbackRes.error) throw fallbackRes.error;
        data = fallbackRes.data as any;
      } else if (error) {
        throw error;
      }

      let list = ((data || []) as unknown) as Booking[];

      // Client-side category filter
      if (categoryFilter !== "all") {
        list = list.filter((b) => b.designs?.category_id === categoryFilter);
      }

      // Search filter with smart fallback search
      if (search.trim()) {
        const queryTerm = search.trim().toLowerCase();
        list = list.filter((b) => {
          const info = extractCustomerInfo(b);
          const matchId = b.enquiry_id?.toLowerCase().includes(queryTerm);
          const matchName = info.name.toLowerCase().includes(queryTerm);
          const matchPhone = info.phone.toLowerCase().includes(queryTerm);
          const matchDesign = info.designTitle.toLowerCase().includes(queryTerm);
          return matchId || matchName || matchPhone || matchDesign;
        });
      }

      setBookings(list);
      setSelectedIds([]);
      setCurrentPage(1);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  }, [supabase, status, categoryFilter, dateFrom, dateTo, sortBy, search]);

  useEffect(() => {
    const timer = setTimeout(fetchBookings, 250);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  // Pagination calculation
  const totalItems = bookings.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedBookings = bookings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === displayedBookings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedBookings.map((b) => b.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete Handlers
  const handleOpenSingleDelete = (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(booking);
    setIsBulkDelete(false);
    setConfirmDeleteOpen(true);
  };

  const handleOpenBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setIsBulkDelete(true);
    setItemToDelete(null);
    setConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    setDeleting(true);
    const targetIds = isBulkDelete
      ? selectedIds
      : itemToDelete
      ? [itemToDelete.id]
      : [];

    if (targetIds.length === 0) {
      setDeleting(false);
      setConfirmDeleteOpen(false);
      return;
    }

    // Optimistic UI update
    const previousBookings = [...bookings];
    setBookings((prev) => prev.filter((b) => !targetIds.includes(b.id)));

    try {
      const res = await deleteAdminItem({
        entity: "enquiries",
        ids: targetIds,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to delete enquiry");
      }

      toast.success(
        targetIds.length === 1
          ? "Enquiry deleted successfully"
          : `${targetIds.length} enquiries deleted successfully`
      );

      setSelectedIds([]);
      setConfirmDeleteOpen(false);
      setItemToDelete(null);
      await refreshBadges();
    } catch (err: any) {
      console.error("Delete enquiry error:", err);
      // Rollback on error
      setBookings(previousBookings);
      toast.error(err.message || "Failed to delete enquiry. Rolled back changes.");
    } finally {
      setDeleting(false);
    }
  };

  // CSV Export with UTF-8 BOM
  const exportToCSV = () => {
    if (!bookings.length) {
      toast.error("No enquiries to export.");
      return;
    }

    const headers = [
      "Enquiry ID",
      "Customer Name",
      "Phone",
      "Email",
      "Design Title",
      "Status",
      "Booking Date",
      "Event Date",
      "Venue",
      "Quoted Price",
      "Customer Note",
      "Internal Note",
    ];

    const rows = bookings.map((b) => {
      const info = extractCustomerInfo(b);
      return [
        `"${b.enquiry_id || ""}"`,
        `"${info.name.replace(/"/g, '""')}"`,
        `"${info.phone}"`,
        `"${b.customer_email || b.profiles?.email || ""}"`,
        `"${info.designTitle.replace(/"/g, '""')}"`,
        `"${b.status}"`,
        `"${b.booking_date ? new Date(b.booking_date).toLocaleDateString("en-IN") : ""}"`,
        `"${b.event_date ? new Date(b.event_date).toLocaleDateString("en-IN") : ""}"`,
        `"${(b.venue || "").replace(/"/g, '""')}"`,
        `"${b.booking_private?.quoted_price || ""}"`,
        `"${(b.admin_notes || b.message || "").replace(/"/g, '""')}"`,
        `"${(b.booking_private?.internal_notes || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "\uFEFF" +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sri_kubera_enquiries_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
            Customer Enquiries
          </h1>
          <p className="text-sm text-[#5D6D67] mt-1">
            Manage stage decoration booking requests, status workflows, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleOpenBulkDelete}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
              Delete Selected ({selectedIds.length})
            </button>
          )}

          <button
            type="button"
            onClick={exportToCSV}
            disabled={loading || bookings.length === 0}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-white hover:bg-[#FAF6EC] text-[#17211E] text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Download size={15} />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-4 shadow-xs space-y-3">
        {/* Top search & status row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search by ID / Name / Phone */}
          <div className="md:col-span-5 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by Enquiry ID (A1234), Name, Phone, or Design..."
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

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full min-h-[40px] text-xs px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending / New</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full min-h-[40px] text-xs px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full min-h-[40px] text-xs px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              aria-label="Sort by"
            >
              <option value="booking_date">Newest Enquiries</option>
              <option value="event_date">Upcoming Event Date</option>
            </select>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E8E2D5]/70 text-xs text-[#5D6D67]">
          <span className="font-semibold uppercase text-[11px] text-[#17211E]">
            Enquiry Date Range:
          </span>
          <div className="flex items-center gap-1.5">
            <span>From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[#E8E2D5] bg-white text-xs text-[#17211E]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span>To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[#E8E2D5] bg-white text-xs text-[#17211E]"
            />
          </div>

          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="text-xs text-[#0B4A3A] font-semibold hover:underline cursor-pointer"
            >
              Reset Dates
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-[#17211E] font-bold">
              {totalItems} result{totalItems !== 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={() => fetchBookings()}
              className="p-1.5 text-[#5D6D67] hover:text-[#17211E] rounded-lg hover:bg-[#FAF6EC] cursor-pointer"
              title="Refresh"
              aria-label="Refresh enquiries"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Enquiries Content */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : displayedBookings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Enquiries Found"
          description={
            search || status !== "all" || dateFrom || dateTo
              ? "No enquiries match your active filter options."
              : "No customer booking enquiries have been submitted yet."
          }
        />
      ) : (
        <>
          {/* Mobile Stacked Cards (< 768px) */}
          <div className="md:hidden space-y-3">
            {displayedBookings.map((b) => {
              const info = extractCustomerInfo(b);
              const waCleanPhone = info.rawPhone;
              const waNumber = waCleanPhone
                ? waCleanPhone.startsWith("91")
                  ? waCleanPhone
                  : `91${waCleanPhone}`
                : "917373876879";
              const waText = encodeURIComponent(
                `Hello ${info.name}, regarding your Sri Kubera Decor enquiry #${b.enquiry_id} for "${info.designTitle}": `
              );

              const isSelected = selectedIds.includes(b.id);

              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 transition-colors ${
                    isSelected ? "border-[#0B4A3A] bg-[#FAF6EC]/40" : "border-[#E8E2D5]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(b.id)}
                        className="text-[#0B4A3A] p-0.5"
                        aria-label="Select enquiry"
                      >
                        {isSelected ? (
                          <CheckSquare size={18} className="text-[#0B4A3A]" />
                        ) : (
                          <Square size={18} className="text-[#5D6D67]" />
                        )}
                      </button>
                      <span className="font-serif font-bold text-base text-[#0B4A3A] tracking-wider">
                        #{b.enquiry_id}
                      </span>
                    </div>
                    <StatusBadge status={b.status} size="sm" />
                  </div>

                  {/* Customer & Design */}
                  <div className="flex items-start gap-3">
                    {b.designs?.image_url && (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF6EC] shrink-0 border border-[#E8E2D5]">
                        <Image
                          src={b.designs.image_url}
                          alt={info.designTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#17211E] truncate">
                        {info.name}
                      </p>
                      <p className="text-xs text-[#5D6D67]">
                        {info.phone}
                      </p>
                      <p className="text-xs font-medium text-[#0B4A3A] truncate mt-0.5">
                        {info.designTitle}
                      </p>
                      {b.event_date && (
                        <p className="text-[11px] text-[#5D6D67] flex items-center gap-1 mt-0.5">
                          <Calendar size={12} />
                          Event: {new Date(b.event_date).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D5] text-xs">
                    <span className="text-[#5D6D67] text-[11px]">
                      {new Date(b.booking_date).toLocaleDateString("en-IN")}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {info.rawPhone ? (
                        <>
                          <a
                            href={`tel:${info.rawPhone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-[#0B4A3A] border border-emerald-200 font-semibold"
                            title="Call customer"
                            aria-label={`Call ${info.name}`}
                          >
                            <Phone size={13} />
                            Call
                          </a>
                          <a
                            href={`https://wa.me/${waNumber}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/30 font-semibold"
                            title="WhatsApp message"
                            aria-label={`WhatsApp ${info.name}`}
                          >
                            <MessageCircle size={13} />
                            WhatsApp
                          </a>
                        </>
                      ) : null}

                      <Link
                        href={`/admin/enquiries/${b.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0B4A3A] text-white font-medium"
                      >
                        <Eye size={13} />
                        View
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleOpenSingleDelete(b, e)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
                        title="Delete enquiry"
                        aria-label="Delete enquiry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF6EC]/80 border-b border-[#E8E2D5] text-xs font-semibold text-[#17211E] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-[#0B4A3A] hover:text-[#0E5A47] cursor-pointer"
                        aria-label="Select all enquiries on page"
                      >
                        {selectedIds.length > 0 &&
                        selectedIds.length === displayedBookings.length ? (
                          <CheckSquare size={17} className="text-[#0B4A3A]" />
                        ) : (
                          <Square size={17} className="text-[#5D6D67]" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4">Enquiry ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Design</th>
                    <th className="py-3 px-4">Enquiry Date</th>
                    <th className="py-3 px-4">Event Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Contact &amp; Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {displayedBookings.map((b) => {
                    const info = extractCustomerInfo(b);
                    const waCleanPhone = info.rawPhone;
                    const waNumber = waCleanPhone
                      ? waCleanPhone.startsWith("91")
                        ? waCleanPhone
                        : `91${waCleanPhone}`
                      : "917373876879";
                    const waText = encodeURIComponent(
                      `Hello ${info.name}, regarding your Sri Kubera Decor enquiry #${b.enquiry_id} for "${info.designTitle}": `
                    );

                    const isSelected = selectedIds.includes(b.id);

                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-[#FAF6EC]/50 transition-colors cursor-pointer group ${
                          isSelected ? "bg-[#FAF6EC]/60" : ""
                        }`}
                        onClick={() =>
                          (window.location.href = `/admin/enquiries/${b.id}`)
                        }
                      >
                        {/* Checkbox Column */}
                        <td
                          className="py-3.5 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(b.id)}
                            className="text-[#0B4A3A] p-1 cursor-pointer"
                            aria-label={`Select enquiry ${b.enquiry_id}`}
                          >
                            {isSelected ? (
                              <CheckSquare size={17} className="text-[#0B4A3A]" />
                            ) : (
                              <Square size={17} className="text-[#5D6D67]/80" />
                            )}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 font-serif font-bold text-[#0B4A3A] tracking-wider whitespace-nowrap">
                          #{b.enquiry_id}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-sm text-[#17211E] truncate max-w-[180px]">
                            {info.name}
                          </p>
                          <p className="text-xs text-[#5D6D67]">
                            {info.phone}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            {b.designs?.image_url && (
                              <div className="relative w-10 h-8 rounded-lg overflow-hidden bg-[#FAF6EC] shrink-0 border border-[#E8E2D5]">
                                <Image
                                  src={b.designs.image_url}
                                  alt={info.designTitle}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#17211E] truncate max-w-[200px]">
                                {info.designTitle}
                              </p>
                              {b.designs?.categories?.name && (
                                <span className="text-[10px] text-[#5D6D67]">
                                  {b.designs.categories.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-[#5D6D67] whitespace-nowrap">
                          {new Date(b.booking_date).toLocaleDateString("en-IN")}
                        </td>

                        <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                          {b.event_date ? (
                            <span className="font-medium text-[#0B4A3A] flex items-center gap-1">
                              <Calendar size={13} />
                              {new Date(b.event_date).toLocaleDateString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-[#5D6D67]/60">Not set</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={b.status} size="sm" />
                        </td>

                        {/* Quick Contact & Action Buttons: View, Call, WhatsApp, Delete */}
                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {info.rawPhone ? (
                              <>
                                <a
                                  href={`tel:${info.rawPhone}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#0B4A3A] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors text-xs font-semibold"
                                  title="Call customer"
                                  aria-label={`Call ${info.name}`}
                                >
                                  <Phone size={13} />
                                  <span>Call</span>
                                </a>
                                <a
                                  href={`https://wa.me/${waNumber}?text=${waText}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#075E54] bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-colors text-xs font-semibold"
                                  title="Send WhatsApp message"
                                  aria-label={`WhatsApp ${info.name}`}
                                >
                                  <MessageCircle size={13} />
                                  <span>WhatsApp</span>
                                </a>
                              </>
                            ) : null}

                            <Link
                              href={`/admin/enquiries/${b.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#17211E] bg-[#FAF6EC] hover:bg-[#E8E2D5] border border-[#E8E2D5] transition-colors text-xs font-medium"
                              title="View details"
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </Link>

                            <button
                              type="button"
                              onClick={(e) => handleOpenSingleDelete(b, e)}
                              className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete enquiry"
                              aria-label={`Delete enquiry #${b.enquiry_id}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[#5D6D67]">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of {totalItems}{" "}
            enquiries
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => {
          if (!deleting) setConfirmDeleteOpen(false);
        }}
        onConfirm={executeDelete}
        isLoading={deleting}
        isDestructive={true}
        title={
          isBulkDelete
            ? `Delete ${selectedIds.length} Selected Enquiries`
            : `Delete Enquiry #${itemToDelete?.enquiry_id}`
        }
        description={
          isBulkDelete
            ? `Are you sure you want to delete ${selectedIds.length} enquiries? Tip: You can download "Export to CSV" before deleting for your records. This cannot be undone.`
            : `Delete enquiry #${itemToDelete?.enquiry_id}? This cannot be undone.`
        }
        confirmLabel={deleting ? "Deleting..." : "Delete Permanently"}
        cancelLabel="Cancel"
      />
    </div>
  );
}
