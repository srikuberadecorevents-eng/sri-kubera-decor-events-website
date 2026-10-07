"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  Filter,
  User,
  Clock,
  Sparkles,
  ClipboardList,
  Palette,
  Image as ImageIcon,
  Settings,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import type { ActivityLog } from "@/types";
import toast from "react-hot-toast";

const ENTITY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  booking: ClipboardList,
  design: Palette,
  media: ImageIcon,
  requirement: Sparkles,
  settings: Settings,
};

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("all");

  const supabase = createClient();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("activity_log")
        .select("*, profiles(name, email)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (entityFilter !== "all") {
        query = query.eq("entity", entityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Fetch activity error:", err);
      toast.error("Failed to load activity log");
    } finally {
      setLoading(false);
    }
  }, [entityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
            Activity Audit Log
          </h1>
          <p className="text-sm text-[#5D6D67] mt-1">
            Chronological record of administrative operations, design modifications, and status changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="min-h-[40px] text-xs px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
          >
            <option value="all">All Operations</option>
            <option value="booking">Enquiry Changes</option>
            <option value="design">Design Catalog</option>
            <option value="media">Photo Uploads</option>
            <option value="requirement">Requirements</option>
            <option value="settings">Settings Updates</option>
          </select>

          <button
            type="button"
            onClick={() => fetchLogs()}
            className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-[#E8E2D5] bg-white text-[#5D6D67] hover:text-[#17211E] flex items-center justify-center transition-colors cursor-pointer"
            title="Refresh logs"
            aria-label="Refresh logs"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden shadow-xs">
        {loading ? (
          <TableSkeleton rows={8} />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={History}
            title="No Activity Logged"
            description={
              entityFilter !== "all"
                ? "No administrative activity recorded under this filter."
                : "Activity entries will appear here automatically as updates, uploads, and status changes are made."
            }
          />
        ) : (
          <div className="divide-y divide-[#E8E2D5]">
            {logs.map((log) => {
              const Icon = ENTITY_ICONS[log.entity] || History;

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-[#FAF6EC]/40 transition-colors flex items-start gap-3.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FAF6EC] text-[#0B4A3A] flex items-center justify-center shrink-0 border border-[#E8E2D5] mt-0.5">
                    <Icon size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <p className="text-xs font-bold text-[#17211E]">
                        {log.summary || `${log.action} on ${log.entity}`}
                      </p>
                      <span className="text-[11px] text-[#5D6D67] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#5D6D67]">
                      <span className="capitalize font-semibold text-[#0B4A3A] bg-[#0B4A3A]/10 px-2 py-0.5 rounded-full">
                        {log.entity}
                      </span>
                      <span>•</span>
                      <span>Action: {log.action}</span>
                      {log.profiles?.name && (
                        <>
                          <span>•</span>
                          <span>By: {log.profiles.name}</span>
                        </>
                      )}
                    </div>
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
