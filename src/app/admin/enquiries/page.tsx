"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Phone,
  MessageCircle,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Clock,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import type { Booking, BookingStatus, Category } from "@/types";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 20;

export default function AdminEnquiriesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<"booking_date" | "event_date">("booking_date");
  const [currentPage, setCurrentPage] = useState(1);

  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("bookings")
        .select(
          "*, profiles(name, phone, email, address, pincode), designs(title, image_url, price, category_id, categories(name)), booking_private(internal_notes, quoted_price)"
        );

      if (sortBy === "event_date") {
        query = query.order("event_date", { ascending: true, nullsFirst: false });
      } else {
        query = query.order("booking_date", { ascending: false });
      }

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (dateFrom) {
        query = query.gte("booking_date", new Date(dateFrom).toISOString());
      }

      if (dateTo) {
        const toDateObj = new Date(dateTo);
        toDateObj.setHours(23, 59, 59, 999);
        query = query.lte("booking_date", toDateObj.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      let list = (data || []) as Booking[];

      // Client-side category filter (via designs.category_id)
      if (categoryFilter !== "all") {
        list = list.filter((b) => b.designs?.category_id === categoryFilter);
      }

      // Search filter (enquiry_id, customer name, customer phone)
      if (search.trim()) {
        const queryTerm = search.trim().toLowerCase();
        list = list.filter((b) => {
          const matchId = b.enquiry_id?.toLowerCase().includes(queryTerm);
          const matchName = b.profiles?.name?.toLowerCase().includes(queryTerm);
          const matchPhone = b.profiles?.phone?.toLowerCase().includes(queryTerm);
          const matchDesign = b.designs?.title?.toLowerCase().includes(queryTerm);
          return matchId || matchName || matchPhone || matchDesign;
        });
      }

      setBookings(list);
      setCurrentPage(1);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  }, [status, categoryFilter, dateFrom, dateTo, sortBy, search]);

  useEffect(() => {
    const timer = setTimeout(fetchBookings, 300);
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

    const rows = bookings.map((b) => [
      `"${b.enquiry_id || ""}"`,
      `"${(b.profiles?.name || "").replace(/"/g, '""')}"`,
      `"${b.profiles?.phone || ""}"`,
      `"${b.profiles?.email || ""}"`,
      `"${(b.designs?.title || "").replace(/"/g, '""')}"`,
      `"${b.status}"`,
      `"${b.booking_date ? new Date(b.booking_date).toLocaleDateString("en-IN") : ""}"`,
      `"${b.event_date ? new Date(b.event_date).toLocaleDateString("en-IN") : ""}"`,
      `"${(b.venue || "").replace(/"/g, '""')}"`,
      `"${b.booking_private?.quoted_price || ""}"`,
      `"${(b.admin_notes || "").replace(/"/g, '""')}"`,
      `"${(b.booking_private?.internal_notes || "").replace(/"/g, '""')}"`,
    ]);

    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens unicode/Tamil characters properly
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
              placeholder="Search by Enquiry ID (A1234), Name, or Phone..."
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
              <option value="pending">Pending</option>
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

      {/* Enquiries Content: Stacked Cards on Mobile, Table on Desktop */}
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
              const waCleanPhone = b.profiles?.phone?.replace(/\D/g, "") || "";
              const waNumber = waCleanPhone.startsWith("91")
                ? waCleanPhone
                : `91${waCleanPhone}`;
              const waText = encodeURIComponent(
                `Hello ${b.profiles?.name || ""}, regarding your Sri Kubera Decor enquiry #${b.enquiry_id} for "${b.designs?.title || "stage decoration"}": `
              );

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-[#E8E2D5] p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-base text-[#0B4A3A] tracking-wider">
                      #{b.enquiry_id}
                    </span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>

                  {/* Customer & Design */}
                  <div className="flex items-start gap-3">
                    {b.designs?.image_url && (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF6EC] shrink-0 border border-[#E8E2D5]">
                        <Image
                          src={b.designs.image_url}
                          alt={b.designs.title || "Design"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#17211E] truncate">
                        {b.profiles?.name || "Customer"}
                      </p>
                      <p className="text-xs text-[#5D6D67] truncate">
                        {b.designs?.title || "Custom Decoration"}
                      </p>
                      {b.event_date && (
                        <p className="text-[11px] text-[#0B4A3A] font-medium flex items-center gap-1 mt-0.5">
                          <Calendar size={12} />
                          Event: {new Date(b.event_date).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date and Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D5] text-xs">
                    <span className="text-[#5D6D67] text-[11px]">
                      {new Date(b.booking_date).toLocaleDateString("en-IN")}
                    </span>

                    <div className="flex items-center gap-2">
                      {b.profiles?.phone && (
                        <>
                          <a
                            href={`tel:${b.profiles.phone}`}
                            className="p-2 rounded-lg bg-emerald-50 text-[#0B4A3A] border border-emerald-200"
                            title="Call customer"
                            aria-label={`Call ${b.profiles?.name}`}
                          >
                            <Phone size={14} />
                          </a>
                          <a
                            href={`https://wa.me/${waNumber}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/30"
                            title="WhatsApp message"
                            aria-label={`WhatsApp ${b.profiles?.name}`}
                          >
                            <MessageCircle size={14} />
                          </a>
                        </>
                      )}

                      <Link
                        href={`/admin/enquiries/${b.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#0B4A3A] text-white font-medium text-xs flex items-center gap-1"
                      >
                        <Eye size={13} />
                        View
                      </Link>
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
                    <th className="py-3 px-4">Enquiry ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Design</th>
                    <th className="py-3 px-4">Enquiry Date</th>
                    <th className="py-3 px-4">Event Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {displayedBookings.map((b) => {
                    const waCleanPhone =
                      b.profiles?.phone?.replace(/\D/g, "") || "";
                    const waNumber = waCleanPhone.startsWith("91")
                      ? waCleanPhone
                      : `91${waCleanPhone}`;
                    const waText = encodeURIComponent(
                      `Hello ${b.profiles?.name || ""}, regarding your Sri Kubera Decor enquiry #${b.enquiry_id} for "${b.designs?.title || "stage decoration"}": `
                    );

                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-[#FAF6EC]/50 transition-colors cursor-pointer group"
                        onClick={() =>
                          (window.location.href = `/admin/enquiries/${b.id}`)
                        }
                      >
                        <td className="py-3.5 px-4 font-serif font-bold text-[#0B4A3A] tracking-wider whitespace-nowrap">
                          #{b.enquiry_id}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-sm text-[#17211E] truncate max-w-[180px]">
                            {b.profiles?.name || "Customer"}
                          </p>
                          <p className="text-xs text-[#5D6D67]">
                            {b.profiles?.phone || "No phone"}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            {b.designs?.image_url && (
                              <div className="relative w-10 h-8 rounded-lg overflow-hidden bg-[#FAF6EC] shrink-0 border border-[#E8E2D5]">
                                <Image
                                  src={b.designs.image_url}
                                  alt={b.designs.title || "Design"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#17211E] truncate max-w-[200px]">
                                {b.designs?.title || "—"}
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

                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {b.profiles?.phone && (
                              <>
                                <a
                                  href={`tel:${b.profiles.phone}`}
                                  className="p-1.5 rounded-lg text-[#0B4A3A] hover:bg-emerald-50 transition-colors"
                                  title="Call customer"
                                  aria-label={`Call ${b.profiles?.name}`}
                                >
                                  <Phone size={15} />
                                </a>
                                <a
                                  href={`https://wa.me/${waNumber}?text=${waText}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                                  title="Send WhatsApp message"
                                  aria-label={`WhatsApp ${b.profiles?.name}`}
                                >
                                  <MessageCircle size={15} />
                                </a>
                              </>
                            )}

                            <Link
                              href={`/admin/enquiries/${b.id}`}
                              className="p-1.5 rounded-lg text-[#5D6D67] hover:text-[#17211E] hover:bg-[#FAF6EC] transition-colors"
                              title="View details"
                            >
                              <Eye size={15} />
                            </Link>
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
    </div>
  );
}
