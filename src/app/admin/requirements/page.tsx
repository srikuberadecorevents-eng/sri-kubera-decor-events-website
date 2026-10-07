"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Search,
  Filter,
  Download,
  Phone,
  MessageCircle,
  Calendar,
  MapPin,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { Modal } from "@/components/admin/Modal";
import type { Requirement, RequirementStatus } from "@/types";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 20;

const REQUIREMENT_STATUSES: { value: RequirementStatus; label: string }[] = [
  { value: "new", label: "New Lead" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted to Booking" },
  { value: "closed", label: "Closed / Lost" },
];

export default function AdminRequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Quick edit modal
  const [selectedLead, setSelectedLead] = useState<Requirement | null>(null);
  const [editStatus, setEditStatus] = useState<RequirementStatus>("new");
  const [editNotes, setEditNotes] = useState("");
  const [savingLead, setSavingLead] = useState(false);

  const supabase = createClient();

  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("requirements")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (search.trim()) {
        const term = search.trim();
        query = query.or(
          `name.ilike.%${term}%,phone.ilike.%${term}%,place.ilike.%${term}%,event_type.ilike.%${term}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      setRequirements(data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Fetch requirements error:", err);
      toast.error("Failed to load customer leads");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(fetchRequirements, 300);
    return () => clearTimeout(timer);
  }, [fetchRequirements]);

  // Pagination calculation
  const totalItems = requirements.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedRequirements = requirements.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Open Lead Detail Modal
  const openLeadDetail = (lead: Requirement) => {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.admin_notes || "");
  };

  // Save Lead Updates
  const handleSaveLead = async () => {
    if (!selectedLead) return;
    setSavingLead(true);
    try {
      const { error } = await supabase
        .from("requirements")
        .update({
          status: editStatus,
          admin_notes: editNotes.trim() || null,
        })
        .eq("id", selectedLead.id);

      if (error) throw error;
      toast.success("Lead status and notes updated");
      setSelectedLead(null);
      fetchRequirements();
    } catch (err) {
      console.error("Update requirement error:", err);
      toast.error("Failed to update lead");
    } finally {
      setSavingLead(false);
    }
  };

  // Export CSV with UTF-8 BOM
  const exportToCSV = () => {
    if (!requirements.length) {
      toast.error("No leads to export.");
      return;
    }

    const headers = [
      "Name",
      "Phone",
      "Email",
      "Event Type",
      "Event Date",
      "Place",
      "Message",
      "Status",
      "Admin Notes",
      "Created At",
    ];

    const rows = requirements.map((r) => [
      `"${(r.name || "").replace(/"/g, '""')}"`,
      `"${r.phone || ""}"`,
      `"${r.email || ""}"`,
      `"${(r.event_type || "").replace(/"/g, '""')}"`,
      `"${r.event_date ? new Date(r.event_date).toLocaleDateString("en-IN") : ""}"`,
      `"${(r.place || "").replace(/"/g, '""')}"`,
      `"${(r.message || "").replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${(r.admin_notes || "").replace(/"/g, '""')}"`,
      `"${new Date(r.created_at).toLocaleString("en-IN")}"`,
    ]);

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
      `sri_kubera_leads_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Leads CSV exported successfully");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
            Requirements Inbox
          </h1>
          <p className="text-sm text-[#5D6D67] mt-1">
            Incoming direct decoration inquiries from the &ldquo;Post Your Requirement&rdquo; form.
          </p>
        </div>

        <button
          type="button"
          onClick={exportToCSV}
          disabled={loading || requirements.length === 0}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-white hover:bg-[#FAF6EC] text-[#17211E] text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Download size={15} />
          Export Leads CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by customer name, phone, place, event type..."
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[40px] text-xs px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            aria-label="Filter by status"
          >
            <option value="all">All Lead Statuses</option>
            <option value="new">New Leads</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted to Booking</option>
            <option value="closed">Closed / Lost</option>
          </select>

          <button
            type="button"
            onClick={() => fetchRequirements()}
            className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-[#E8E2D5] bg-white text-[#5D6D67] hover:text-[#17211E] flex items-center justify-center transition-colors cursor-pointer"
            title="Refresh"
            aria-label="Refresh requirements list"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Leads Content: Mobile Stacked Cards, Desktop Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : displayedRequirements.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Requirements Found"
          description={
            search || statusFilter !== "all"
              ? "No leads match your active filters."
              : "No customer requirements submitted yet."
          }
        />
      ) : (
        <>
          {/* Mobile Stacked Cards (< 768px) */}
          <div className="md:hidden space-y-3">
            {displayedRequirements.map((lead) => {
              const waCleanPhone = lead.phone?.replace(/\D/g, "") || "";
              const waNumber = waCleanPhone.startsWith("91")
                ? waCleanPhone
                : `91${waCleanPhone}`;
              const waText = encodeURIComponent(
                `Hello ${lead.name}, regarding your stage decoration requirement for ${lead.event_type || "your celebration"} at ${lead.place}: `
              );

              return (
                <div
                  key={lead.id}
                  className="bg-white rounded-2xl border border-[#E8E2D5] p-4 shadow-xs space-y-3 cursor-pointer hover:bg-[#FAF6EC]/40"
                  onClick={() => openLeadDetail(lead)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#17211E]">
                        {lead.name}
                      </h3>
                      <p className="text-xs text-[#0B4A3A] font-semibold mt-0.5">
                        {lead.phone}
                      </p>
                    </div>
                    <StatusBadge status={lead.status} size="sm" />
                  </div>

                  <div className="space-y-1 text-xs text-[#5D6D67]">
                    <p className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#0B4A3A]" />
                      <strong>Place:</strong> {lead.place}
                    </p>
                    {lead.event_type && (
                      <p>
                        <strong>Event:</strong> {lead.event_type}
                      </p>
                    )}
                    {lead.event_date && (
                      <p className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <strong>Date:</strong> {new Date(lead.event_date).toLocaleDateString("en-IN")}
                      </p>
                    )}
                  </div>

                  {lead.message && (
                    <p className="text-xs text-[#17211E] bg-[#FAF6EC] p-2.5 rounded-xl border border-[#E8E2D5]/70 line-clamp-2">
                      &ldquo;{lead.message}&rdquo;
                    </p>
                  )}

                  <div
                    className="flex items-center justify-between pt-2 border-t border-[#E8E2D5]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[11px] text-[#5D6D67]">
                      {new Date(lead.created_at).toLocaleDateString("en-IN")}
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${lead.phone}`}
                        className="p-2 rounded-lg bg-emerald-50 text-[#0B4A3A] border border-emerald-200"
                        title="Call"
                        aria-label={`Call ${lead.name}`}
                      >
                        <Phone size={14} />
                      </a>
                      <a
                        href={`https://wa.me/${waNumber}?text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/30"
                        title="WhatsApp"
                        aria-label={`WhatsApp ${lead.name}`}
                      >
                        <MessageCircle size={14} />
                      </a>
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
                    <th className="py-3 px-4">Lead Customer</th>
                    <th className="py-3 px-4">Event &amp; Place</th>
                    <th className="py-3 px-4">Event Date</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {displayedRequirements.map((lead) => {
                    const waCleanPhone =
                      lead.phone?.replace(/\D/g, "") || "";
                    const waNumber = waCleanPhone.startsWith("91")
                      ? waCleanPhone
                      : `91${waCleanPhone}`;
                    const waText = encodeURIComponent(
                      `Hello ${lead.name}, regarding your stage decoration requirement for ${lead.event_type || "your event"} at ${lead.place}: `
                    );

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => openLeadDetail(lead)}
                        className="hover:bg-[#FAF6EC]/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-sm text-[#17211E]">
                            {lead.name}
                          </p>
                          <p className="text-xs text-[#0B4A3A] font-medium">
                            {lead.phone}
                          </p>
                          {lead.email && (
                            <p className="text-[11px] text-[#5D6D67] truncate max-w-[160px]">
                              {lead.email}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-medium text-xs text-[#17211E]">
                            {lead.event_type || "Stage Decoration"}
                          </p>
                          <p className="text-xs text-[#5D6D67] flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="text-[#0B4A3A] shrink-0" />
                            {lead.place}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                          {lead.event_date ? (
                            <span className="font-medium text-[#0B4A3A] flex items-center gap-1">
                              <Calendar size={13} />
                              {new Date(lead.event_date).toLocaleDateString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-[#5D6D67]/60">Not specified</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-[#5D6D67] whitespace-nowrap">
                          {new Date(lead.created_at).toLocaleDateString("en-IN")}
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={lead.status} size="sm" />
                        </td>

                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1.5 rounded-lg text-[#0B4A3A] hover:bg-emerald-50 transition-colors"
                              title="Call lead"
                              aria-label={`Call ${lead.name}`}
                            >
                              <Phone size={15} />
                            </a>
                            <a
                              href={`https://wa.me/${waNumber}?text=${waText}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                              title="WhatsApp lead"
                              aria-label={`WhatsApp ${lead.name}`}
                            >
                              <MessageCircle size={15} />
                            </a>
                            <button
                              type="button"
                              onClick={() => openLeadDetail(lead)}
                              className="p-1.5 rounded-lg text-[#5D6D67] hover:text-[#17211E] hover:bg-[#FAF6EC] transition-colors"
                              title="View details & notes"
                              aria-label="View lead details"
                            >
                              <Eye size={15} />
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
            leads
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

      {/* Lead Detail & Status Modal */}
      {selectedLead && (
        <Modal
          isOpen={Boolean(selectedLead)}
          onClose={() => setSelectedLead(null)}
          title={`Lead: ${selectedLead.name}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Customer Details Box */}
            <div className="bg-[#FAF6EC]/60 rounded-2xl border border-[#E8E2D5] p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#5D6D67] block text-[11px]">Phone Number</span>
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="font-bold text-sm text-[#0B4A3A] hover:underline"
                >
                  {selectedLead.phone}
                </a>
              </div>
              <div>
                <span className="text-[#5D6D67] block text-[11px]">Place / City</span>
                <span className="font-semibold text-xs text-[#17211E]">
                  {selectedLead.place}
                </span>
              </div>
              {selectedLead.email && (
                <div>
                  <span className="text-[#5D6D67] block text-[11px]">Email Address</span>
                  <span className="text-xs text-[#17211E]">
                    {selectedLead.email}
                  </span>
                </div>
              )}
              {selectedLead.event_type && (
                <div>
                  <span className="text-[#5D6D67] block text-[11px]">Event Type</span>
                  <span className="font-semibold text-xs text-[#17211E]">
                    {selectedLead.event_type}
                  </span>
                </div>
              )}
              {selectedLead.event_date && (
                <div>
                  <span className="text-[#5D6D67] block text-[11px]">Target Event Date</span>
                  <span className="font-semibold text-xs text-[#0B4A3A]">
                    {new Date(selectedLead.event_date).toLocaleDateString("en-IN")}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[#5D6D67] block text-[11px]">Submission Time</span>
                <span className="text-xs text-[#5D6D67]">
                  {new Date(selectedLead.created_at).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Requirement Message */}
            {selectedLead.message && (
              <div>
                <label className="block text-xs font-semibold uppercase text-[#17211E] mb-1">
                  Customer Requirements Message:
                </label>
                <div className="p-3.5 bg-white rounded-xl border border-[#E8E2D5] text-xs leading-relaxed text-[#17211E]">
                  {selectedLead.message}
                </div>
              </div>
            )}

            {/* Status Selector */}
            <div>
              <label
                htmlFor="lead-status-select"
                className="block text-xs font-semibold uppercase text-[#17211E] mb-1.5"
              >
                Lead Status
              </label>
              <select
                id="lead-status-select"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as RequirementStatus)}
                className="w-full min-h-[44px] text-xs px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              >
                {REQUIREMENT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin Internal Notes */}
            <div>
              <label
                htmlFor="lead-notes"
                className="block text-xs font-semibold uppercase text-[#17211E] mb-1.5"
              >
                Admin Follow-up Notes
              </label>
              <textarea
                id="lead-notes"
                rows={3}
                placeholder="e.g. Called customer on WhatsApp, shared photos of Wedding stage 25000-1. They will visit shop tomorrow."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#E8E2D5] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-[#17211E] bg-white border border-[#E8E2D5] rounded-xl hover:bg-[#FAF6EC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLead}
                disabled={savingLead}
                className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-[#0B4A3A] hover:bg-[#0E5A47] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {savingLead ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#C9A24B]" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
