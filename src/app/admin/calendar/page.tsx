"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PhoneCall,
  User,
  ArrowRight,
  X,
  Filter,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Drawer } from "@/components/admin/Drawer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Booking } from "@/types";
import toast from "react-hot-toast";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"confirmed_only" | "all">(
    "all"
  );

  // Selected date modal/drawer
  const [selectedDayEvents, setSelectedDayEvents] = useState<Booking[] | null>(
    null
  );
  const [selectedDateLabel, setSelectedDateLabel] = useState("");

  const supabase = createClient();

  const fetchEventsForMonth = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Start of month - 7 days buffer and end of month + 7 days buffer
      const startBuffer = new Date(year, month, -7).toISOString().split("T")[0];
      const endBuffer = new Date(year, month + 1, 14)
        .toISOString()
        .split("T")[0];

      let query = supabase
        .from("bookings")
        .select("*, profiles(name, phone), designs(title, image_url)")
        .not("event_date", "is", null)
        .gte("event_date", startBuffer)
        .lte("event_date", endBuffer);

      if (statusFilter === "confirmed_only") {
        query = query.eq("status", "confirmed");
      } else {
        query = query.in("status", ["confirmed", "contacted", "pending"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEvents((data as unknown as Booking[]) || []);
    } catch (err) {
      console.error("Fetch calendar events error:", err);
      toast.error("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  }, [currentDate, statusFilter]);

  useEffect(() => {
    fetchEventsForMonth();
  }, [fetchEventsForMonth]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Prev month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Next month navigation
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Today button
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Map events by 'YYYY-MM-DD'
  const eventsByDate = events.reduce<Record<string, Booking[]>>((acc, b) => {
    if (b.event_date) {
      acc[b.event_date] = acc[b.event_date] || [];
      acc[b.event_date].push(b);
    }
    return acc;
  }, {});

interface CalendarCell {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  events: Booking[];
}

  // Build grid calendar cells
  const calendarCells: CalendarCell[] = [];

  // 1. Previous month leading days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, day);
    const dateStr = dateObj.toISOString().split("T")[0];
    calendarCells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      events: eventsByDate[dateStr] || [],
    });
  }

  // 2. Current month days
  const todayStr = new Date().toISOString().split("T")[0];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toISOString().split("T")[0];
    calendarCells.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      events: eventsByDate[dateStr] || [],
    });
  }

  // 3. Next month trailing days to complete grid (42 cells: 6 rows)
  const remaining = 42 - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    const dateObj = new Date(year, month + 1, d);
    const dateStr = dateObj.toISOString().split("T")[0];
    calendarCells.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: false,
      events: eventsByDate[dateStr] || [],
    });
  }

  const handleCellClick = (cell: (typeof calendarCells)[0]) => {
    if (cell.events.length > 0) {
      setSelectedDayEvents(cell.events);
      setSelectedDateLabel(
        new Date(cell.dateStr).toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    }
  };

  const monthName = currentDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
            Events Calendar
          </h1>
          <p className="text-sm text-[#5D6D67] mt-1">
            Month schedule of stage decorations, confirmed events, and potential date clashes.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="min-h-[40px] text-xs px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
          >
            <option value="all">Confirmed &amp; Contacted Events</option>
            <option value="confirmed_only">Confirmed Only</option>
          </select>
        </div>
      </div>

      {/* Month Navigator Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-xl border border-[#E8E2D5] hover:bg-[#FAF6EC] text-[#17211E] transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-xl border border-[#E8E2D5] hover:bg-[#FAF6EC] text-[#17211E] transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl border border-[#E8E2D5] text-xs font-semibold text-[#0B4A3A] hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>

        <h2 className="font-serif font-bold text-lg sm:text-xl text-[#17211E]">
          {monthName}
        </h2>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-[#5D6D67]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B4A3A]" />
            Confirmed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            Contacted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Clash (2+)
          </span>
        </div>
      </div>

      {/* Calendar Month Grid */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden shadow-xs">
        {/* Day of Week Header */}
        <div className="grid grid-cols-7 border-b border-[#E8E2D5] bg-[#FAF6EC]/80 text-center">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="py-2.5 text-xs font-bold uppercase tracking-wider text-[#17211E]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#E8E2D5]">
          {calendarCells.map((cell, idx) => {
            const hasEvents = cell.events.length > 0;
            const hasClash = cell.events.filter((e) => e.status === "confirmed").length > 1;

            return (
              <div
                key={idx}
                onClick={() => handleCellClick(cell)}
                className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth
                    ? "bg-white"
                    : "bg-[#FAF6EC]/30 text-[#5D6D67]/40"
                } ${hasEvents ? "cursor-pointer hover:bg-[#FAF6EC]/60" : ""} ${
                  cell.isToday ? "bg-amber-50/50" : ""
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                      cell.isToday
                        ? "bg-[#0B4A3A] text-white"
                        : cell.isCurrentMonth
                        ? "text-[#17211E]"
                        : "text-[#5D6D67]/50"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {hasClash && (
                    <span
                      className="text-amber-600 bg-amber-100 p-0.5 rounded"
                      title="Multiple confirmed bookings on this day"
                    >
                      <AlertTriangle size={12} />
                    </span>
                  )}
                </div>

                {/* Event Tags in Day Cell */}
                <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                  {cell.events.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className={`text-[10px] sm:text-[11px] font-medium px-1.5 py-0.5 rounded truncate border leading-tight ${
                        ev.status === "confirmed"
                          ? "bg-emerald-50 text-[#0B4A3A] border-emerald-200"
                          : ev.status === "contacted"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                      title={`#${ev.enquiry_id} - ${ev.profiles?.name || "Customer"}: ${ev.designs?.title || "Decoration"}`}
                    >
                      #{ev.enquiry_id} {ev.profiles?.name || ""}
                    </div>
                  ))}

                  {cell.events.length > 2 && (
                    <span className="text-[9px] font-bold text-[#5D6D67] block pl-1">
                      +{cell.events.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Events Drawer */}
      <Drawer
        isOpen={Boolean(selectedDayEvents)}
        onClose={() => setSelectedDayEvents(null)}
        title={`Events on ${selectedDateLabel}`}
        width="md"
      >
        <div className="space-y-4">
          {selectedDayEvents?.map((ev) => (
            <div
              key={ev.id}
              className="bg-[#FAF6EC]/60 rounded-2xl border border-[#E8E2D5] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-[#0B4A3A]">
                  #{ev.enquiry_id}
                </span>
                <StatusBadge status={ev.status} size="sm" />
              </div>

              <div className="space-y-1 text-xs text-[#17211E]">
                <p>
                  <strong>Customer:</strong> {ev.profiles?.name || "Customer"} (
                  {ev.profiles?.phone || "No phone"})
                </p>
                <p>
                  <strong>Design:</strong> {ev.designs?.title || "Custom Stage"}
                </p>
                {ev.venue && (
                  <p className="text-[#5D6D67]">
                    <strong>Venue:</strong> {ev.venue}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between">
                {ev.profiles?.phone && (
                  <a
                    href={`tel:${ev.profiles.phone}`}
                    className="text-xs font-semibold text-[#0B4A3A] hover:underline flex items-center gap-1"
                  >
                    <PhoneCall size={13} />
                    Call
                  </a>
                )}
                <Link
                  href={`/admin/enquiries/${ev.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B4A3A] hover:underline ml-auto"
                >
                  Open Enquiry Details
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
