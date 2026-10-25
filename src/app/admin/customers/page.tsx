"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ArrowRight,
  ClipboardList,
  RefreshCw,
  X,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteAdminItem } from "@/app/actions/admin-delete";
import type { Profile } from "@/types";
import toast from "react-hot-toast";

interface CustomerWithBookings extends Profile {
  bookingsCount: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithBookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Delete & Bulk Action state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerWithBookings | null>(null);
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? customers.map((c) => c.id) : []);
  };

  const supabase = createClient();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, bookings(id)")
        .eq("role", "user")
        .order("created_at", { ascending: false });

      if (error) throw error;

      let list: CustomerWithBookings[] = (data || []).map((p: any) => ({
        ...p,
        bookingsCount: Array.isArray(p.bookings) ? p.bookings.length : 0,
      }));

      if (search.trim()) {
        const queryTerm = search.trim().toLowerCase();
        list = list.filter((c) => {
          const matchName = c.name?.toLowerCase().includes(queryTerm);
          const matchPhone = c.phone?.toLowerCase().includes(queryTerm);
          const matchEmail = c.email?.toLowerCase().includes(queryTerm);
          const matchPincode = c.pincode?.toLowerCase().includes(queryTerm);
          const matchAddress = c.address?.toLowerCase().includes(queryTerm);
          return (
            matchName ||
            matchPhone ||
            matchEmail ||
            matchPincode ||
            matchAddress
          );
        });
      }

      setCustomers(list);
    } catch (err) {
      console.error("Fetch customers error:", err);
      toast.error("Failed to load customer list");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const exportToCSV = () => {
    if (!customers.length) {
      toast.error("No customers to export");
      return;
    }

    const headers = [
      "Customer Name",
      "Phone",
      "Email",
      "Address",
      "Pincode",
      "Total Enquiries",
      "Joined Date",
    ];

    const rows = customers.map((c) => [
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${c.phone || ""}"`,
      `"${c.email || ""}"`,
      `"${(c.address || "").replace(/"/g, '""')}"`,
      `"${c.pincode || ""}"`,
      c.bookingsCount,
      `"${new Date(c.created_at).toLocaleDateString("en-IN")}"`,
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
      `sri_kubera_customers_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Customers CSV exported successfully");
  };

  const executeSingleDelete = async () => {
    if (!customerToDelete) return;
    const target = customerToDelete;
    const previous = [...customers];

    // Optimistic UI update
    setCustomers((prev) => prev.filter((c) => c.id !== target.id));
    setSelectedIds((prev) => prev.filter((id) => id !== target.id));
    setSingleDeleteOpen(false);
    setCustomerToDelete(null);
    setDeleting(true);

    try {
      const res = await deleteAdminItem({
        entity: "customers",
        id: target.id,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to delete customer");
      }

      toast.success(`Deleted customer "${target.name}" and related enquiries`);
    } catch (err: any) {
      console.error("Delete customer error:", err);
      toast.error(err.message || "Failed to delete customer");
      setCustomers(previous);
    } finally {
      setDeleting(false);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const previous = [...customers];
    const idsToDelete = [...selectedIds];

    // Optimistic UI update
    setCustomers((prev) => prev.filter((c) => !idsToDelete.includes(c.id)));
    setSelectedIds([]);
    setBulkDeleteOpen(false);
    setDeleting(true);

    try {
      const res = await deleteAdminItem({
        entity: "customers",
        ids: idsToDelete,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to delete customers");
      }

      toast.success(`Deleted ${count} customer accounts`);
    } catch (err: any) {
      console.error("Bulk delete customer error:", err);
      toast.error(err.message || "Failed to delete customers");
      setCustomers(previous);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
            Registered Customers
          </h1>
          <p className="text-sm text-[#5D6D67] mt-1">
            View customer contact records and their event booking histories.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setBulkDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              Delete Selected ({selectedIds.length})
            </button>
          )}

          <button
            type="button"
            onClick={exportToCSV}
            disabled={loading || customers.length === 0}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-white hover:bg-[#FAF6EC] text-[#17211E] text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            title="Export full customer roster to CSV"
          >
            <Download size={15} />
            Export Customers CSV
          </button>
        </div>
      </div>

      {/* Search Bar & Bulk Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by customer name, phone, email, pincode, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-[40px] text-xs pl-10 pr-9 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D6D67] hover:text-[#17211E] p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => fetchCustomers()}
            className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-[#E8E2D5] bg-white text-[#5D6D67] hover:text-[#17211E] flex items-center justify-center transition-colors cursor-pointer"
            title="Refresh"
            aria-label="Refresh customer list"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between text-xs text-[#5D6D67]">
            <span>{selectedIds.length} customer(s) selected</span>
            <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Tip: Export to CSV first if you need a permanent record before deleting.
            </span>
          </div>
        )}
      </div>

      {/* Customers List: Mobile Stacked Cards, Desktop Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Customers Found"
          description={
            search
              ? "No registered customers match your search query."
              : "No customer accounts have registered on the website yet."
          }
        />
      ) : (
        <>
          {/* Mobile Stacked Cards (< 768px) */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between px-1 text-xs text-[#5D6D67]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customers.length > 0 && selectedIds.length === customers.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0B4A3A] focus:ring-[#0B4A3A] border-[#E8E2D5]"
                />
                <span>Select All ({customers.length})</span>
              </label>
            </div>

            {customers.map((c) => {
              const isSelected = selectedIds.includes(c.id);
              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs space-y-2.5 transition-colors ${
                    isSelected ? "border-[#0B4A3A] ring-1 ring-[#0B4A3A]/30 bg-emerald-50/20" : "border-[#E8E2D5]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(c.id)}
                        className="w-4 h-4 rounded text-[#0B4A3A] focus:ring-[#0B4A3A] border-[#E8E2D5] cursor-pointer"
                        aria-label={`Select ${c.name}`}
                      />
                      <div className="w-8 h-8 rounded-full bg-[#0B4A3A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm text-[#17211E]">
                        {c.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF6EC] text-[#0B4A3A] border border-[#E8E2D5]">
                      {c.bookingsCount} booking{c.bookingsCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#5D6D67] pl-6">
                    <p className="flex items-center gap-1.5">
                      <Phone size={12} className="text-[#0B4A3A]" />
                      {c.phone || "No phone"}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail size={12} />
                      {c.email}
                    </p>
                    {c.address && (
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin size={12} />
                        {c.address}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D5] text-[11px] text-[#5D6D67]">
                    <span>Joined {new Date(c.created_at).toLocaleDateString("en-IN")}</span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="text-[#0B4A3A] font-medium hover:underline p-1.5"
                      >
                        Details &rarr;
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerToDelete(c);
                          setSingleDeleteOpen(true);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title={`Delete customer ${c.name}`}
                        aria-label={`Delete customer ${c.name}`}
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
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={customers.length > 0 && selectedIds.length === customers.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        aria-label="Select all customers"
                        className="w-4 h-4 rounded text-[#0B4A3A] focus:ring-[#0B4A3A] border-[#E8E2D5] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Enquiries</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {customers.map((c) => {
                    const isSelected = selectedIds.includes(c.id);
                    return (
                      <tr
                        key={c.id}
                        className={`transition-colors ${
                          isSelected ? "bg-emerald-50/40" : "hover:bg-[#FAF6EC]/50"
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(c.id)}
                            aria-label={`Select ${c.name}`}
                            className="w-4 h-4 rounded text-[#0B4A3A] focus:ring-[#0B4A3A] border-[#E8E2D5] cursor-pointer"
                          />
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-[#17211E]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#0B4A3A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{c.name}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs font-semibold text-[#0B4A3A]">
                          {c.phone || "—"}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-[#5D6D67] truncate max-w-[180px]">
                          {c.email}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-[#5D6D67]">
                          {c.address ? (
                            <span className="truncate max-w-[160px] block" title={c.address}>
                              {c.address}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0B4A3A] border border-emerald-200">
                            <ClipboardList size={12} />
                            {c.bookingsCount}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-[#5D6D67] whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString("en-IN")}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/customers/${c.id}`}
                              className="p-1.5 rounded-lg text-[#5D6D67] hover:text-[#0B4A3A] hover:bg-[#FAF6EC] transition-colors inline-flex items-center gap-1 text-xs font-medium"
                              title="View customer profile"
                            >
                              Details
                              <ArrowRight size={14} />
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setCustomerToDelete(c);
                                setSingleDeleteOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title={`Delete customer profile for ${c.name}`}
                              aria-label={`Delete customer ${c.name}`}
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

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={singleDeleteOpen}
        onClose={() => {
          setSingleDeleteOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={executeSingleDelete}
        title="Delete Customer Profile"
        description={`Are you sure you want to delete the customer profile for "${customerToDelete?.name}"? All related enquiries and requirements attached to this user will also be permanently removed. This cannot be undone.`}
        confirmLabel="Delete Customer"
        isDestructive
        isLoading={deleting}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={executeBulkDelete}
        title="Delete Selected Customers"
        description={`Are you sure you want to delete ${selectedIds.length} customer profiles and all their related bookings? Please ensure you have exported them to CSV if you need a backup. This cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.length} Customers`}
        isDestructive
        isLoading={deleting}
      />
    </div>
  );
}
