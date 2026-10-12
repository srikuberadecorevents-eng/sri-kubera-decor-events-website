"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Copy,
  Check,
  MessageCircle,
  Download,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ClipboardList,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import StatusBadge from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import type { BookingStatus } from "@/types";

interface BookingItem {
  id: string;
  enquiry_id: string;
  status: BookingStatus;
  booking_date: string;
  event_date?: string | null;
  venue?: string | null;
  admin_notes?: string | null;
  designs?: {
    title: string;
    image_url: string;
    categories?: {
      name: string;
    } | null;
  } | null;
}

interface Props {
  bookings: BookingItem[];
  initialError?: string | null;
  userId?: string;
}

export default function EnquiriesClient({ bookings, initialError, userId }: Props) {
  const [items, setItems] = useState<BookingItem[]>(bookings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [activeTab, setActiveTab] = useState<"all" | BookingStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const waNumber = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "919486064769";

  useEffect(() => {
    setItems(bookings);
  }, [bookings]);

  useEffect(() => {
    if (initialError) {
      setError(initialError);
      toast.error(`Unable to load enquiries: ${initialError}`);
    }
  }, [initialError]);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase
        .from("bookings")
        .select("*, designs(title, image_url, categories(name))")
        .order("booking_date", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) {
        setError(fetchErr.message);
        toast.error(`Failed to refresh enquiries: ${fetchErr.message}`);
      } else {
        setItems(data || []);
        toast.success("Enquiries refreshed successfully");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load enquiries");
      toast.error("Failed to load enquiries. Please click retry.");
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = items.length;
    const pending = items.filter((b) => b.status === "pending").length;
    const contacted = items.filter((b) => b.status === "contacted").length;
    const confirmed = items.filter((b) => b.status === "confirmed").length;
    return { total, pending, contacted, confirmed };
  }, [items]);

  // Filtered list
  const filteredBookings = useMemo(() => {
    return items.filter((b) => {
      const matchesTab = activeTab === "all" || b.status === activeTab;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesTab;

      const matchesQuery =
        b.enquiry_id.toLowerCase().includes(query) ||
        (b.designs?.title && b.designs.title.toLowerCase().includes(query)) ||
        (b.designs?.categories?.name &&
          b.designs.categories.name.toLowerCase().includes(query)) ||
        (b.venue && b.venue.toLowerCase().includes(query));

      return matchesTab && matchesQuery;
    });
  }, [items, activeTab, searchQuery]);

  const handleCopyId = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success(`Enquiry ID ${id} copied!`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy Enquiry ID");
    }
  };

  const getStepProgress = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return 3;
      case "contacted":
        return 2;
      case "pending":
      default:
        return 1;
    }
  };

  return (
    <div className="pb-12 md:pb-14 bg-[#FAF7F2]">
      {/* Luxury Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#06261E] via-[#0B3D30] to-[#06261E] text-white py-8 md:py-10 border-b border-[#C9A24B]/30">
        <div
          className="absolute inset-0 opacity-10 bg-repeat pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#C9A24B 1px, transparent 1px), radial-gradient(#C9A24B 1px, #06261E 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="page-container max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A24B]/20 border border-[#C9A24B]/40 text-[#ECC870] text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles size={13} className="text-[#C9A24B]" />
                Event Coordination Portal
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
                My Enquiries &amp; Bookings
              </h1>
              <p className="text-ivory-200 text-xs md:text-sm mt-1.5 max-w-xl leading-relaxed">
                Track your decoration requests, status updates, and quotation details in real time.
              </p>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#C9A24B] to-[#E2C375] hover:from-[#B8923A] hover:to-[#D4B567] text-navy-950 font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all self-start md:self-auto"
            >
              <Sparkles size={15} />
              Browse More Designs
            </Link>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <p className="text-ivory-300 text-xs font-medium">Total Requests</p>
              <p className="text-2xl md:text-3xl font-serif font-bold text-white mt-1">
                {metrics.total}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <p className="text-amber-200 text-xs font-medium">Pending Review</p>
              <p className="text-2xl md:text-3xl font-serif font-bold text-amber-300 mt-1">
                {metrics.pending}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <p className="text-blue-200 text-xs font-medium">In Discussion</p>
              <p className="text-2xl md:text-3xl font-serif font-bold text-blue-300 mt-1">
                {metrics.contacted}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <p className="text-emerald-200 text-xs font-medium">Confirmed Bookings</p>
              <p className="text-2xl md:text-3xl font-serif font-bold text-emerald-300 mt-1">
                {metrics.confirmed}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Listing Section */}
      <div className="page-container max-w-6xl mx-auto mt-6">
        {/* Filter and Search Bar */}
        <div className="bg-white rounded-3xl p-4 md:p-5 border border-ivory-300 shadow-sm mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "all"
                    ? "bg-navy-900 text-white shadow-xs"
                    : "bg-ivory-100 text-navy-700 hover:bg-ivory-200"
                }`}
              >
                All Requests ({metrics.total})
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "pending"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-ivory-100 text-navy-700 hover:bg-ivory-200"
                }`}
              >
                Pending ({metrics.pending})
              </button>
              <button
                onClick={() => setActiveTab("contacted")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "contacted"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-ivory-100 text-navy-700 hover:bg-ivory-200"
                }`}
              >
                In Discussion ({metrics.contacted})
              </button>
              <button
                onClick={() => setActiveTab("confirmed")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "confirmed"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-ivory-100 text-navy-700 hover:bg-ivory-200"
                }`}
              >
                Confirmed ({metrics.confirmed})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search by ID or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50/70 text-navy-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error ? (
          <div className="bg-white rounded-3xl p-10 border border-red-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-navy-950">
              Unable to Load Enquiries
            </h3>
            <p className="text-navy-600 text-sm leading-relaxed max-w-md mx-auto">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetry}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Retry Loading
              </button>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ivory-100 hover:bg-ivory-200 text-navy-800 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Browse Gallery
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-ivory-200 animate-pulse space-y-4">
                <div className="h-6 bg-ivory-200 rounded w-1/4" />
                <div className="h-24 bg-ivory-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-ivory-300 shadow-sm text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600 mx-auto mb-4">
              <ClipboardList size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-navy-950 mb-2">
              {items.length === 0 ? "You have no enquiries yet" : "No Matching Enquiries"}
            </h3>
            <p className="text-navy-500 text-sm mb-6 leading-relaxed">
              {items.length === 0
                ? "You haven't requested any stage decoration quotes yet. Explore our portfolio of wedding stages, reception themes, and floral mandaps."
                : "No enquiries match your current filter or search criteria. Try clearing the search or changing the tab."}
            </p>
            {items.length === 0 ? (
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#C9A24B] to-[#E2C375] text-navy-950 font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles size={15} />
                Explore Design Gallery
              </Link>
            ) : (
              <button
                onClick={() => {
                  setActiveTab("all");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-800 font-semibold text-xs transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 md:space-y-5">
            {filteredBookings.map((booking) => {
              const step = getStepProgress(booking.status);
              const waText = encodeURIComponent(
                `Hello Sri Kubera Decor team, I am checking the status of my Enquiry ID ${booking.enquiry_id} for "${booking.designs?.title || "Decoration Design"}". Please assist me.`
              );

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl p-5 md:p-6 border border-ivory-300 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                >
                  {/* Top Bar: Enquiry ID & Status Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ivory-200">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-lg bg-navy-950 text-gold-400 font-mono font-bold text-sm tracking-widest border border-gold-500/30">
                        {booking.enquiry_id}
                      </div>
                      <button
                        onClick={(e) => handleCopyId(booking.enquiry_id, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ivory-100 hover:bg-gold-50 text-navy-700 hover:text-gold-700 text-xs font-semibold transition-colors"
                        title="Copy Enquiry ID"
                      >
                        {copiedId === booking.enquiry_id ? (
                          <>
                            <Check size={13} className="text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Design Thumbnail & Info */}
                    <div className="md:col-span-6 flex gap-4 items-center">
                      {booking.designs?.image_url ? (
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-ivory-300 bg-ivory-100">
                          <Image
                            src={booking.designs.image_url}
                            alt={booking.designs.title || "Decoration Design"}
                            fill
                            sizes="96px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-ivory-200 flex items-center justify-center text-navy-400 shrink-0">
                          <ClipboardList size={32} />
                        </div>
                      )}

                      <div className="min-w-0">
                        {booking.designs?.categories?.name && (
                          <span className="inline-block text-[11px] font-bold text-gold-700 uppercase tracking-wider mb-1">
                            {booking.designs.categories.name}
                          </span>
                        )}
                        <h4 className="text-lg font-serif font-bold text-navy-950 truncate">
                          {booking.designs?.title || "Custom Decoration Request"}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-navy-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-gold-600" />
                            {new Date(booking.booking_date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {booking.event_date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-navy-400" />
                              Event: {booking.event_date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Step Bar */}
                    <div className="md:col-span-6 bg-ivory-50/70 rounded-2xl p-4 border border-ivory-200">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-navy-500 mb-2">
                        Status Progress
                      </p>
                      <div className="grid grid-cols-3 gap-2 relative">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-colors ${
                              step >= 1
                                ? "bg-emerald-600 text-white"
                                : "bg-ivory-300 text-navy-600"
                            }`}
                          >
                            <Check size={14} />
                          </div>
                          <span className="text-[10px] font-semibold text-navy-800 leading-tight">
                            Submitted
                          </span>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-colors ${
                              step >= 2
                                ? "bg-emerald-600 text-white"
                                : "bg-ivory-300 text-navy-600"
                            }`}
                          >
                            {step >= 2 ? <Check size={14} /> : "2"}
                          </div>
                          <span className="text-[10px] font-semibold text-navy-800 leading-tight">
                            Discussion
                          </span>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-colors ${
                              step >= 3
                                ? "bg-emerald-600 text-white"
                                : "bg-ivory-300 text-navy-600"
                            }`}
                          >
                            {step >= 3 ? <Check size={14} /> : "3"}
                          </div>
                          <span className="text-[10px] font-semibold text-navy-800 leading-tight">
                            Confirmed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Notes if available */}
                  {booking.admin_notes && (
                    <div className="mb-5 p-3.5 rounded-xl bg-gold-50/70 border border-gold-200/80 flex items-start gap-2.5 text-xs text-navy-800">
                      <Sparkles size={15} className="text-gold-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-navy-950">Team Note: </span>
                        {booking.admin_notes}
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-ivory-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${waNumber}?text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-colors shadow-2xs"
                      >
                        <MessageCircle size={14} />
                        WhatsApp Concierge
                      </a>

                      <a
                        href={`/api/receipt/${booking.id}`}
                        download={`enquiry-${booking.enquiry_id}.pdf`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-navy-800 text-xs font-semibold transition-colors"
                        title="Download PDF Receipt"
                      >
                        <Download size={13} />
                        <span className="hidden sm:inline">Receipt PDF</span>
                      </a>
                    </div>

                    <Link
                      href={`/enquiries/${booking.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider transition-all ml-auto group-hover:bg-[#06261E]"
                    >
                      View Full Details
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
