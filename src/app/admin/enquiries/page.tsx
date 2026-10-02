"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Booking, BookingStatus } from "@/types";

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Contacted", value: "contacted" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Rejected", value: "rejected" },
];

export default function AdminEnquiriesPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("bookings")
      .select("*, profiles(name, phone), designs(title)")
      .order("booking_date", { ascending: false });

    if (status !== "all") query = query.eq("status", status);
    if (search.trim()) query = query.ilike("enquiry_id", `%${search.trim()}%`);

    const { data } = await query;
    setBookings(data || []);
    setLoading(false);
  }, [status, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchBookings, 300);
    return () => clearTimeout(debounce);
  }, [fetchBookings]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-navy-900">Enquiries</h1>
        <p className="text-navy-500 text-sm mt-1">{bookings.length} result{bookings.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="search"
            placeholder="Search by Enquiry ID (e.g. A1203)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 pr-10"
            id="enquiry-search"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400">
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-field w-auto"
          id="enquiry-status-filter"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card p-8 space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-cream-200 rounded" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-10 text-center text-navy-400 text-sm">No enquiries found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-100 text-left">
                    <th className="px-5 py-3 font-semibold text-navy-700 text-xs uppercase tracking-wide">Enquiry ID</th>
                    <th className="px-5 py-3 font-semibold text-navy-700 text-xs uppercase tracking-wide">Customer</th>
                    <th className="px-5 py-3 font-semibold text-navy-700 text-xs uppercase tracking-wide hidden md:table-cell">Design</th>
                    <th className="px-5 py-3 font-semibold text-navy-700 text-xs uppercase tracking-wide hidden sm:table-cell">Date</th>
                    <th className="px-5 py-3 font-semibold text-navy-700 text-xs uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-cream-50 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/admin/enquiries/${b.id}`}
                    >
                      <td className="px-5 py-3.5 font-serif font-bold text-navy-900 tracking-wider">{b.enquiry_id}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-navy-800">{b.profiles?.name || "—"}</p>
                        <p className="text-navy-400 text-xs">{b.profiles?.phone || ""}</p>
                      </td>
                      <td className="px-5 py-3.5 text-navy-600 hidden md:table-cell">{b.designs?.title || "—"}</td>
                      <td className="px-5 py-3.5 text-navy-400 text-xs hidden sm:table-cell">
                        {new Date(b.booking_date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={b.status as BookingStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
