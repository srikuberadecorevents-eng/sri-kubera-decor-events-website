"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Sparkles,
  Search,
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
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useRealtimeBadges } from "@/components/admin/RealtimeBadgesProvider";
import { deleteAdminItem } from "@/app/actions/admin-delete";
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

  // Selection & Delete state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Requirement | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Lightbox for reference image
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const supabase = createClient();
  const { refresh: refreshBadges } = useRealtimeBadges();

  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("requirements")
        .select("id, name, email, phone, event_type, event_date, place, message, status, admin_notes, created_at, budget, image_url")
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

      const { data: initialData, error } = await query;
      let data = initialData;
      if (error && (error as any).code === "42703") {
        const fallbackQuery = supabase
          .from("requirements")
          .select("id, name, email, phone, event_type, event_date, place, message, status, admin_notes, created_at")
          .order("created_at", { ascending: false });

        if (statusFilter !== "all") {
          fallbackQuery.eq("status", statusFilter);
        }

        const fallbackRes = await fallbackQuery;
        if (fallbackRes.error) throw fallbackRes.error;
        data = fallbackRes.data as any;
      } else if (error) {
        throw error;
      }

      setRequirements(data || []);
      setSelectedIds([]);
      setCurrentPage(1);
    } catch (err) {
      console.error("Fetch requirements error:", err);
      toast.error("Failed to load customer leads");
    } finally {
      setLoading(false);
    }
  }, [supabase, statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(fetchRequirements, 250);
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

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === displayedRequirements.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedRequirements.map((r) => r.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Open single delete
  const handleOpenSingleDelete = (lead: Requirement, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(lead);
    setIsBulkDelete(false);
    setConfirmDeleteOpen(true);
  };

  // Open bulk delete
  const handleOpenBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setIsBulkDelete(true);
    setItemToDelete(null);
    setConfirmDeleteOpen(true);
  };

  // Execute delete with optimistic update & rollback
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

    const previousRequirements = [...requirements];
    setRequirements((prev) => prev.filter((r) => !targetIds.includes(r.id)));

    try {
      const res = await deleteAdminItem({
        entity: "requirements",
        ids: targetIds,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to delete lead");
      }

      toast.success(
        targetIds.length === 1
          ? "Requirement lead deleted successfully"
          : `${targetIds.length} requirement leads deleted successfully`
      );

      setSelectedIds([]);
      setConfirmDeleteOpen(false);
      setItemToDelete(null);
      if (selectedLead && targetIds.includes(selectedLead.id)) {
        setSelectedLead(null);
      }
      await refreshBadges();
    } catch (err: any) {
      console.error("Delete requirement error:", err);
      setRequirements(previousRequirements);
      toast.error(err.message || "Failed to delete lead. Rolled back changes.");
    } finally {
      setDeleting(false);
    }
  };

  const openLeadDetail = (lead: Requirement) => {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.admin_notes || "");
  };

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

      toast.success("Lead status updated successfully");
      setRequirements((prev) =>
        prev.map((r) =>
          r.id === selectedLead.id
            ? { ...r, status: editStatus, admin_notes: editNotes.trim() || null }
            : r
        )
      );
      setSelectedLead(null);
      await refreshBadges();
    } catch (err: any) {
      console.error("Update lead error:", err);
      toast.error(err.message || "Failed to save lead updates");
    } finally {
      setSavingLead(false);
    }
  };

  // CSV Export with UTF-8 BOM
  const exportToCSV = () => {
    if (!requirements.length) {
      toast.error("No requirement leads to export.");
      return;
    }

    const headers = [
      "Customer Name",
      "Phone",
      "Email",
      "Place / Location",
      "Event Type",
      "Event Date",
      "Budget",
      "Status",
      "Submission Date",
      "Customer Message",
      "Admin Notes",
    ];

    const rows = requirements.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.phone}"`,
      `"${r.email || ""}"`,
      `"${r.place.replace(/"/g, '""')}"`,
      `"${(r.event_type || "").replace(/"/g, '""')}"`,
      `"${r.event_date ? new Date(r.event_date).toLocaleDateString("en-IN") : ""}"`,
      `"${r.budget || ""}"`,
      `"${r.status}"`,
      `"${new Date(r.created_at).toLocaleDateString("en-IN")}"`,
      `"${(r.message || "").replace(/"/g, '""')}"`,
      `"${(r.admin_notes || "").replace(/"/g, '""')}"`,
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
    toast.success("Leads CSV downloaded successfully");
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
            disabled={loading || requirements.length === 0}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-white hover:bg-[#FAF6EC] text-[#17211E] text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Download size={15} />
            Export Leads CSV
          </button>
        </div>
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

      {/* Leads Content */}
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

              const isSelected = selectedIds.includes(lead.id);

              return (
                <div
                  key={lead.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 cursor-pointer transition-colors ${
                    isSelected ? "border-[#0B4A3A] bg-[#FAF6EC]/40" : "border-[#E8E2D5]"
                  }`}
                  onClick={() => openLeadDetail(lead)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(lead.id);
                        }}
                        className="text-[#0B4A3A] p-0.5"
                        aria-label="Select lead"
                      >
                        {isSelected ? (
                          <CheckSquare size={18} className="text-[#0B4A3A]" />
                        ) : (
                          <Square size={18} className="text-[#5D6D67]" />
                        )}
                      </button>
                      <h3 className="font-bold text-sm text-[#17211E]">
                        {lead.name}
                      </h3>
                    </div>
                    <StatusBadge status={lead.status} size="sm" />
                  </div>

                  <div className="space-y-1 text-xs text-[#5D6D67]">
                    <p className="text-xs text-[#0B4A3A] font-semibold">
                      {lead.phone}
                    </p>
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
                      <p className="flex items-center gap-1.5 text-[#0B4A3A] font-medium">
                        <Calendar size={12} />
                        Event: {new Date(lead.event_date).toLocaleDateString("en-IN")}
                      </p>
                    )}
                    {lead.budget && (
                      <p className="text-[#0B4A3A] font-semibold">
                        Budget: {lead.budget}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center justify-between pt-2 border-t border-[#E8E2D5] text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[#5D6D67] text-[11px]">
                      {new Date(lead.created_at).toLocaleDateString("en-IN")}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-[#0B4A3A] border border-emerald-200 font-semibold"
                        title="Call lead"
                        aria-label={`Call ${lead.name}`}
                      >
                        <Phone size={13} />
                        Call
                      </a>
                      <a
                        href={`https://wa.me/${waNumber}?text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/30 font-semibold"
                        title="Send WhatsApp message"
                        aria-label={`WhatsApp ${lead.name}`}
                      >
                        <MessageCircle size={13} />
                        WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => openLeadDetail(lead)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0B4A3A] text-white font-medium"
                      >
                        <Eye size={13} />
                        Review
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleOpenSingleDelete(lead, e)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
                        title="Delete lead"
                        aria-label="Delete lead"
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
                        aria-label="Select all requirements"
                      >
                        {selectedIds.length > 0 &&
                        selectedIds.length === displayedRequirements.length ? (
                          <CheckSquare size={17} className="text-[#0B4A3A]" />
                        ) : (
                          <Square size={17} className="text-[#5D6D67]" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4">Lead Customer</th>
                    <th className="py-3 px-4">Event &amp; Place</th>
                    <th className="py-3 px-4">Event Date</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Contact &amp; Actions</th>
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

                    const isSelected = selectedIds.includes(lead.id);

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => openLeadDetail(lead)}
                        className={`hover:bg-[#FAF6EC]/50 transition-colors cursor-pointer ${
                          isSelected ? "bg-[#FAF6EC]/60" : ""
                        }`}
                      >
                        <td
                          className="py-3.5 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(lead.id)}
                            className="text-[#0B4A3A] p-1 cursor-pointer"
                            aria-label={`Select lead ${lead.name}`}
                          >
                            {isSelected ? (
                              <CheckSquare size={17} className="text-[#0B4A3A]" />
                            ) : (
                              <Square size={17} className="text-[#5D6D67]/80" />
                            )}
                          </button>
                        </td>

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
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#0B4A3A] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors text-xs font-semibold"
                              title="Call lead"
                              aria-label={`Call ${lead.name}`}
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
                              aria-label={`WhatsApp ${lead.name}`}
                            >
                              <MessageCircle size={13} />
                              <span>WhatsApp</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => openLeadDetail(lead)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#17211E] bg-[#FAF6EC] hover:bg-[#E8E2D5] border border-[#E8E2D5] transition-colors text-xs font-medium cursor-pointer"
                              title="Review lead details"
                            >
                              <Eye size={13} />
                              <span>Review</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleOpenSingleDelete(lead, e)}
                              className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete requirement"
                              aria-label={`Delete requirement from ${lead.name}`}
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
              {selectedLead.budget && (
                <div>
                  <span className="text-[#5D6D67] block text-[11px]">Customer Target Budget</span>
                  <span className="font-bold text-xs text-[#0B4A3A]">
                    {selectedLead.budget}
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

            {/* Uploaded Reference Photo (Lightbox enabled) */}
            {selectedLead.image_url && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase text-[#17211E]">
                    Uploaded Inspiration Photo
                  </label>
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(selectedLead.image_url || null)}
                    className="text-xs text-[#0B4A3A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={13} />
                    View Fullscreen Lightbox
                  </button>
                </div>
                <div
                  className="relative aspect-video rounded-xl overflow-hidden border border-[#E8E2D5] bg-[#FAF6EC] cursor-pointer group"
                  onClick={() => setLightboxUrl(selectedLead.image_url || null)}
                >
                  <Image
                    src={selectedLead.image_url}
                    alt="Customer inspiration photo"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5">
                    <Eye size={16} /> Click to expand
                  </div>
                </div>
              </div>
            )}

            {/* Customer Message */}
            {selectedLead.message && (
              <div>
                <label className="block text-xs font-semibold uppercase text-[#17211E] mb-1.5">
                  Customer Requirement Message
                </label>
                <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D5] text-xs text-[#17211E] whitespace-pre-wrap leading-relaxed">
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
                Lead Follow-up Status
              </label>
              <select
                id="lead-status-select"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as RequirementStatus)}
                className="w-full min-h-[44px] text-xs px-3.5 py-2 rounded-xl border border-[#E8E2D5] text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              >
                {REQUIREMENT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Internal Admin Follow-up Notes */}
            <div>
              <label
                htmlFor="lead-admin-notes"
                className="block text-xs font-semibold uppercase text-[#17211E] mb-1.5"
              >
                Internal Notes &amp; Call Summary
              </label>
              <textarea
                id="lead-admin-notes"
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Record customer discussion, quotation provided, or venue details..."
                className="w-full text-xs p-3 rounded-xl border border-[#E8E2D5] text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E8E2D5]">
              <button
                type="button"
                onClick={() => {
                  setItemToDelete(selectedLead);
                  setIsBulkDelete(false);
                  setConfirmDeleteOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                Delete Lead
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  disabled={savingLead}
                  className="px-4 py-2 text-xs font-semibold text-[#5D6D67] hover:text-[#17211E] rounded-xl hover:bg-[#FAF6EC] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLead}
                  disabled={savingLead}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {savingLead ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#C9A24B]" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      Save Status
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Lightbox Modal for reference image */}
      {lightboxUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white hover:text-red-400 p-2 rounded-full bg-black/40 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxUrl}
              alt="Requirement inspiration photo"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
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
            ? `Delete ${selectedIds.length} Selected Leads`
            : `Delete Lead: ${itemToDelete?.name}`
        }
        description={
          isBulkDelete
            ? `Delete ${selectedIds.length} requirement leads? Associated uploaded reference photos will also be permanently removed from storage. This cannot be undone.`
            : `Delete requirement lead from "${itemToDelete?.name}"? Any uploaded reference photos will also be deleted from storage. This cannot be undone.`
        }
        confirmLabel={deleting ? "Deleting..." : "Delete Permanently"}
        cancelLabel="Cancel"
      />
    </div>
  );
}
