"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  X,
  AlertTriangle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteAdminItem } from "@/app/actions/admin-delete";
import type { Profile, UserRole } from "@/types";
import toast from "react-hot-toast";

interface ProfileWithBookings extends Profile {
  bookingsCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ProfileWithBookings[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  // Role change modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<ProfileWithBookings | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>("user");
  const [updatingRole, setUpdatingRole] = useState(false);

  // Delete & Bulk Action state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [userToDelete, setUserToDelete] = useState<ProfileWithBookings | null>(null);
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? users.map((u) => u.id) : []);
  };

  const supabase = createClient();

  // Load current admin id
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentAdminId(data.user.id);
      }
    });
  }, [supabase]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, bookings(id)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      let list: ProfileWithBookings[] = (data || []).map((p: any) => ({
        ...p,
        bookingsCount: Array.isArray(p.bookings) ? p.bookings.length : 0,
      }));

      if (roleFilter !== "all") {
        list = list.filter((u) => u.role === roleFilter);
      }

      if (search.trim()) {
        const queryTerm = search.trim().toLowerCase();
        list = list.filter((u) => {
          const matchName = u.name?.toLowerCase().includes(queryTerm);
          const matchPhone = u.phone?.toLowerCase().includes(queryTerm);
          const matchEmail = u.email?.toLowerCase().includes(queryTerm);
          return matchName || matchPhone || matchEmail;
        });
      }

      setUsers(list);
    } catch (err) {
      console.error("Fetch users error:", err);
      toast.error("Failed to load user list");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, supabase]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleRoleChangeRequest = (user: ProfileWithBookings, newRole: UserRole) => {
    if (user.id === currentAdminId && newRole !== "admin") {
      toast.error("You cannot demote your own active administrator account.");
      return;
    }
    setTargetUser(user);
    setTargetRole(newRole);
    setRoleModalOpen(true);
  };

  const executeRoleChange = async () => {
    if (!targetUser) return;
    setUpdatingRole(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: targetRole })
        .eq("id", targetUser.id);

      if (error) throw error;

      // Log admin activity
      try {
        await supabase.from("activity_log").insert({
          action: "role_change",
          entity: "user",
          entity_id: targetUser.id,
          summary: `Changed role of ${targetUser.name || targetUser.email} from ${targetUser.role} to ${targetRole}`,
        });
      } catch {
        // Continue even if audit logging fails
      }

      toast.success(
        targetRole === "admin"
          ? `${targetUser.name} has been promoted to Administrator`
          : `${targetUser.name} administrator privileges revoked`
      );

      setRoleModalOpen(false);
      setTargetUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Role change error:", err);
      toast.error("Failed to update user role in database");
    } finally {
      setUpdatingRole(false);
    }
  };

  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.filter((u) => u.role === "user").length;

  const executeSingleDelete = async () => {
    if (!userToDelete) return;
    const target = userToDelete;
    if (target.id === currentAdminId) {
      toast.error("You cannot delete your own active administrator account.");
      return;
    }
    const previous = [...users];

    // Optimistic UI update
    setUsers((prev) => prev.filter((u) => u.id !== target.id));
    setSelectedIds((prev) => prev.filter((id) => id !== target.id));
    setSingleDeleteOpen(false);
    setUserToDelete(null);
    setDeleting(true);

    try {
      const res = await deleteAdminItem({
        entity: "users",
        id: target.id,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to delete user account");
      }

      toast.success(`Deleted account for "${target.name}"`);
    } catch (err: any) {
      console.error("Delete user error:", err);
      toast.error(err.message || "Failed to delete user account");
      setUsers(previous);
    } finally {
      setDeleting(false);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (currentAdminId && selectedIds.includes(currentAdminId)) {
      toast.error(
        "You cannot delete your own active administrator account. Please uncheck your account."
      );
      return;
    }
    const count = selectedIds.length;
    const previous = [...users];
    const idsToDelete = [...selectedIds];

    // Optimistic UI update
    setUsers((prev) => prev.filter((u) => !idsToDelete.includes(u.id)));
    setSelectedIds([]);
    setBulkDeleteOpen(false);
    setDeleting(true);

    try {
      const res = await deleteAdminItem({
        entity: "users",
        ids: idsToDelete,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to delete user accounts");
      }

      toast.success(`Deleted ${count} user accounts`);
    } catch (err: any) {
      console.error("Bulk delete user error:", err);
      toast.error(err.message || "Failed to delete user accounts");
      setUsers(previous);
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
            Users &amp; Team Roles
          </h1>
          <p className="text-sm text-[#5D6D67] mt-1">
            Manage system administrators, staff access, and registered customer accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setBulkDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              Delete Selected ({selectedIds.length})
            </button>
          )}

          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white hover:bg-[#FAF6EC] text-[#17211E] text-xs font-semibold shadow-xs transition-colors"
          >
            <Users size={14} />
            View Booking Histories
          </Link>
          <button
            type="button"
            onClick={() => fetchUsers()}
            className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-[#E8E2D5] bg-white text-[#5D6D67] hover:text-[#17211E] flex items-center justify-center transition-colors cursor-pointer"
            title="Refresh"
            aria-label="Refresh user list"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Role Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8E2D5] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5D6D67] uppercase">
              Total Accounts
            </span>
            <Users size={16} className="text-[#0B4A3A]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#17211E] mt-2">
            {users.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E2D5] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5D6D67] uppercase">
              Administrators
            </span>
            <Shield size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#0B4A3A] mt-2">
            {adminCount}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E2D5] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5D6D67] uppercase">
              Customer Accounts
            </span>
            <UserCheck size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#17211E] mt-2">
            {customerCount}
          </p>
        </div>
      </div>

      {/* Search and Role Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search users by name, email, or phone number..."
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === "all"
                ? "bg-[#0B4A3A] text-white"
                : "bg-white border border-[#E8E2D5] text-[#5D6D67] hover:bg-[#FAF6EC]"
            }`}
          >
            All Roles
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("admin")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === "admin"
                ? "bg-[#0B4A3A] text-white"
                : "bg-white border border-[#E8E2D5] text-[#5D6D67] hover:bg-[#FAF6EC]"
            }`}
          >
            Admins
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("user")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === "user"
                ? "bg-[#0B4A3A] text-white"
                : "bg-white border border-[#E8E2D5] text-[#5D6D67] hover:bg-[#FAF6EC]"
            }`}
          >
            Customers
          </button>
        </div>
      </div>

      {/* Users Table / Mobile Cards */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Users Found"
          description={
            search
              ? "No registered accounts match your search filter."
              : "No user accounts registered yet."
          }
        />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between px-1 text-xs text-[#5D6D67]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={users.length > 0 && selectedIds.length === users.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0B4A3A] focus:ring-[#0B4A3A] border-[#E8E2D5]"
                />
                <span>Select All ({users.length})</span>
              </label>
            </div>

            {users.map((u) => {
              const isAdmin = u.role === "admin";
              const isCurrentAdmin = u.id === currentAdminId;
              const isSelected = selectedIds.includes(u.id);

              return (
                <div
                  key={u.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 transition-colors ${
                    isSelected ? "border-[#0B4A3A] ring-1 ring-[#0B4A3A]/30 bg-emerald-50/20" : "border-[#E8E2D5]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(u.id)}
                        disabled={isCurrentAdmin}
                        className="w-4 h-4 rounded text-[#0B4A3A] focus:ring-[#0B4A3A] border-[#E8E2D5] cursor-pointer disabled:opacity-40"
                        aria-label={`Select ${u.name}`}
                      />
                      <div className="w-9 h-9 rounded-full bg-[#0B4A3A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {u.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#17211E]">
                          {u.name}
                          {isCurrentAdmin && (
                            <span className="ml-1.5 text-[10px] bg-emerald-100 text-[#0B4A3A] px-1.5 py-0.5 rounded font-medium">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-[#5D6D67]">{u.email}</p>
                      </div>
                    </div>
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                        <Shield size={12} />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Customer
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#5D6D67] space-y-1 pl-6">
                    <p className="flex items-center gap-1.5">
                      <Phone size={12} className="text-[#0B4A3A]" />
                      {u.phone || "No phone number"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      Joined {new Date(u.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between">
                    <Link
                      href={`/admin/customers/${u.id}`}
                      className="text-xs text-[#0B4A3A] font-semibold flex items-center gap-1 hover:underline"
                    >
                      History ({u.bookingsCount}) &rarr;
                    </Link>

                    <div className="flex items-center gap-2">
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleRoleChangeRequest(u, "user")}
                          disabled={isCurrentAdmin}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Revoke Admin
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRoleChangeRequest(u, "admin")}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#0B4A3A]/30 bg-[#0B4A3A]/10 text-[#0B4A3A] hover:bg-[#0B4A3A]/20 transition-colors cursor-pointer"
                        >
                          Make Admin
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserToDelete(u);
                          setSingleDeleteOpen(true);
                        }}
                        disabled={isCurrentAdmin}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title={
                          isCurrentAdmin
                            ? "Cannot delete your own admin account"
                            : `Delete account for ${u.name}`
                        }
                        aria-label={`Delete account for ${u.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF6EC]/80 border-b border-[#E8E2D5] text-xs font-semibold text-[#17211E] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={users.length > 0 && selectedIds.length === users.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        aria-label="Select all users"
                        className="w-4 h-4 rounded text-[#0B4A3A] focus:ring-[#0B4A3A] border-[#E8E2D5] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">User Account</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Bookings</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {users.map((u) => {
                    const isAdmin = u.role === "admin";
                    const isCurrentAdmin = u.id === currentAdminId;
                    const isSelected = selectedIds.includes(u.id);

                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          isSelected ? "bg-emerald-50/40" : "hover:bg-[#FAF6EC]/50"
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(u.id)}
                            disabled={isCurrentAdmin}
                            aria-label={`Select ${u.name}`}
                            className="w-4 h-4 rounded text-[#0B4A3A] focus:ring-[#0B4A3A] border-[#E8E2D5] cursor-pointer disabled:opacity-40"
                          />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#0B4A3A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {u.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-[#17211E]">
                                {u.name}
                                {isCurrentAdmin && (
                                  <span className="ml-1.5 text-[10px] bg-emerald-100 text-[#0B4A3A] px-1.5 py-0.5 rounded font-semibold">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-[#5D6D67]">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                              <Shield size={12} />
                              Administrator
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              Customer
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs font-semibold text-[#0B4A3A]">
                          {u.phone || "—"}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <Link
                            href={`/admin/customers/${u.id}`}
                            className="text-[#0B4A3A] font-semibold hover:underline"
                          >
                            {u.bookingsCount} booking{u.bookingsCount !== 1 ? "s" : ""}
                          </Link>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-[#5D6D67] whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString("en-IN")}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isAdmin ? (
                              <button
                                type="button"
                                onClick={() => handleRoleChangeRequest(u, "user")}
                                disabled={isCurrentAdmin}
                                title={
                                  isCurrentAdmin
                                    ? "Cannot revoke your own active admin session"
                                    : "Demote to customer role"
                                }
                                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Revoke Admin
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRoleChangeRequest(u, "admin")}
                                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#0B4A3A]/30 bg-[#0B4A3A]/10 text-[#0B4A3A] hover:bg-[#0B4A3A]/20 transition-colors cursor-pointer"
                              >
                                Make Admin
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setUserToDelete(u);
                                setSingleDeleteOpen(true);
                              }}
                              disabled={isCurrentAdmin}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title={
                                isCurrentAdmin
                                  ? "Cannot delete your own admin account"
                                  : `Delete user account for ${u.name}`
                              }
                              aria-label={`Delete account for ${u.name}`}
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

      {/* Role Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        onConfirm={executeRoleChange}
        title={
          targetRole === "admin"
            ? `Grant Administrator Privileges to ${targetUser?.name || "User"}?`
            : `Revoke Administrator Access from ${targetUser?.name || "User"}?`
        }
        description={
          targetRole === "admin"
            ? "This will give full administrative access to edit website designs, view all enquiries, change quotation prices, and manage business settings."
            : "This user will lose access to the /admin control panel immediately. They will still be able to access customer bookings as a regular user."
        }
        confirmLabel={
          targetRole === "admin" ? "Confirm Promote to Admin" : "Confirm Revoke Admin"
        }
        isDestructive={targetRole === "user"}
        isLoading={updatingRole}
      />

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={singleDeleteOpen}
        onClose={() => {
          setSingleDeleteOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={executeSingleDelete}
        title="Delete User Account"
        description={`Are you sure you want to delete the user account for "${userToDelete?.name}"? All related enquiries and account data will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete User"
        isDestructive
        isLoading={deleting}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={executeBulkDelete}
        title="Delete Selected Users"
        description={`Are you sure you want to delete ${selectedIds.length} user accounts? Any related enquiries will also be permanently removed. This cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.length} Users`}
        isDestructive
        isLoading={deleting}
      />
    </div>
  );
}
