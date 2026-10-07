import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Palette,
  ClipboardList,
  Calendar,
  Sparkles,
  Users,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  MessageCircle,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Booking, Requirement } from "@/types";

export const metadata: Metadata = {
  title: "Admin Dashboard | Sri Kubera Decor & Events",
  robots: { index: false, follow: false },
};

const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024; // 1 GB free tier

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const todayStr = now.toISOString().split("T")[0];
  const next7DaysStr = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  // Fetch KPI statistics in parallel
  const [
    { count: publishedDesignsCount },
    { count: pendingEnquiriesCount },
    { count: confirmedThisMonthCount },
    { count: newRequirementsCount },
    { count: totalCustomersCount },
    { data: needsAttentionBookings },
    { data: needsAttentionReqs },
    { data: upcomingConfirmedBookings },
    { data: last30DaysEnquiries },
    { data: mediaRows },
  ] = await Promise.all([
    supabase
      .from("designs")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .is("deleted_at", null),

    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed")
      .gte("event_date", startOfMonth)
      .lte("event_date", endOfMonth),

    supabase
      .from("requirements")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),

    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "user"),

    // Pending enquiries older than 24h
    supabase
      .from("bookings")
      .select("id, enquiry_id, booking_date, profiles(name, phone), designs(title)")
      .eq("status", "pending")
      .lt("booking_date", twentyFourHoursAgo)
      .order("booking_date", { ascending: true })
      .limit(5),

    // New requirements not contacted
    supabase
      .from("requirements")
      .select("id, name, phone, place, event_type, created_at")
      .eq("status", "new")
      .order("created_at", { ascending: true })
      .limit(5),

    // Upcoming events next 7 days
    supabase
      .from("bookings")
      .select("id, enquiry_id, event_date, venue, profiles(name, phone), designs(title, image_url)")
      .eq("status", "confirmed")
      .gte("event_date", todayStr)
      .lte("event_date", next7DaysStr)
      .order("event_date", { ascending: true })
      .limit(5),

    // Last 30 days enquiries for SVG chart
    supabase
      .from("bookings")
      .select("booking_date")
      .gte("booking_date", thirtyDaysAgo),

    // Media rows for storage calculation
    supabase.from("media").select("bytes_total"),
  ]);

  // Calculate storage usage
  const totalBytesUsed = (mediaRows || []).reduce(
    (acc, m) => acc + (m.bytes_total || 0),
    0
  );
  const storagePercent = Math.min(
    100,
    Math.round((totalBytesUsed / STORAGE_LIMIT_BYTES) * 100)
  );

  // Group 30-day enquiry counts by day for lightweight SVG bar chart
  const dailyCountsMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyCountsMap[key] = 0;
  }

  last30DaysEnquiries?.forEach((b) => {
    if (b.booking_date) {
      const key = b.booking_date.split("T")[0];
      if (dailyCountsMap[key] !== undefined) {
        dailyCountsMap[key] = dailyCountsMap[key] + 1;
      }
    }
  });

  const chartData = Object.entries(dailyCountsMap).map(([date, count]) => ({
    date,
    count,
  }));
  const maxDailyCount = Math.max(1, ...chartData.map((d) => d.count));

  const kpiCards = [
    {
      label: "Published Designs",
      value: publishedDesignsCount || 0,
      icon: Palette,
      href: "/admin/designs",
      color: "text-[#0B4A3A]",
      bg: "bg-[#0B4A3A]/10",
    },
    {
      label: "New Enquiries",
      value: pendingEnquiriesCount || 0,
      icon: ClipboardList,
      href: "/admin/enquiries?status=pending",
      color: "text-amber-700",
      bg: "bg-amber-50",
      alert: (pendingEnquiriesCount || 0) > 0,
    },
    {
      label: "Confirmed This Month",
      value: confirmedThisMonthCount || 0,
      icon: Calendar,
      href: "/admin/calendar",
      color: "text-[#0B4A3A]",
      bg: "bg-emerald-50",
    },
    {
      label: "New Leads (Requirements)",
      value: newRequirementsCount || 0,
      icon: Sparkles,
      href: "/admin/requirements?status=new",
      color: "text-blue-700",
      bg: "bg-blue-50",
      alert: (newRequirementsCount || 0) > 0,
    },
    {
      label: "Registered Customers",
      value: totalCustomersCount || 0,
      icon: Users,
      href: "/admin/customers",
      color: "text-stone-700",
      bg: "bg-stone-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
            Executive Dashboard
          </h1>
          <p className="text-sm text-[#5D6D67] mt-1">
            Overview of Sri Kubera Decor events, pending enquiries, and website operations.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/designs/new"
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus size={15} />
            Add Design
          </Link>
          <Link
            href="/admin/enquiries?status=pending"
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-white hover:bg-[#FAF6EC] text-[#17211E] text-xs font-semibold shadow-xs transition-colors"
          >
            <ClipboardList size={15} />
            New Enquiries
          </Link>
          <a
            href="https://web.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] text-xs font-semibold shadow-xs transition-colors"
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="bg-white rounded-2xl border border-[#E8E2D5] p-4 shadow-xs hover:border-[#0B4A3A] hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}
                >
                  <Icon size={18} />
                </div>
                {kpi.alert && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <div>
                <p className="font-serif font-bold text-2xl text-[#17211E]">
                  {kpi.value}
                </p>
                <p className="text-xs text-[#5D6D67] mt-0.5 line-clamp-1">
                  {kpi.label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Attention List & 30-Day Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Needs Attention List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Needs Attention */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-600" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
                  Needs Immediate Attention
                </h2>
              </div>
              <span className="text-xs text-[#5D6D67]">
                {(needsAttentionBookings?.length || 0) +
                  (needsAttentionReqs?.length || 0)}{" "}
                item(s)
              </span>
            </div>

            {(!needsAttentionBookings?.length && !needsAttentionReqs?.length) ? (
              <div className="py-8 text-center text-xs text-[#5D6D67]">
                <CheckCircle2 size={28} className="text-[#0B4A3A] mx-auto mb-2" />
                All customer enquiries and leads have been responded to promptly!
              </div>
            ) : (
              <div className="space-y-3">
                {/* Pending Enquiries older than 24h */}
                {needsAttentionBookings?.map((b: any) => (
                  <Link
                    key={b.id}
                    href={`/admin/enquiries/${b.id}`}
                    className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors flex items-center justify-between gap-3 block"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs text-amber-900">
                          #{b.enquiry_id}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800">
                          Pending &gt; 24 hrs
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#17211E] mt-0.5">
                        {b.profiles?.name || "Customer"} &mdash; {b.designs?.title || "Decoration"}
                      </p>
                    </div>
                    <ArrowRight size={15} className="text-amber-700 shrink-0" />
                  </Link>
                ))}

                {/* New requirements not contacted */}
                {needsAttentionReqs?.map((r: any) => (
                  <Link
                    key={r.id}
                    href="/admin/requirements"
                    className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors flex items-center justify-between gap-3 block"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-blue-900">
                          {r.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-200/60 text-blue-800">
                          New Requirement Lead
                        </span>
                      </div>
                      <p className="text-xs text-[#17211E] mt-0.5">
                        {r.phone} • {r.event_type || "Event"} at {r.place}
                      </p>
                    </div>
                    <ArrowRight size={15} className="text-blue-700 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Card: Upcoming Events (Next 7 Days) */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#0B4A3A]" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
                  Upcoming Confirmed Events (Next 7 Days)
                </h2>
              </div>
              <Link
                href="/admin/calendar"
                className="text-xs font-semibold text-[#0B4A3A] hover:underline"
              >
                Open Calendar &rarr;
              </Link>
            </div>

            {!upcomingConfirmedBookings?.length ? (
              <p className="py-6 text-center text-xs text-[#5D6D67]">
                No confirmed events scheduled in the next 7 days.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingConfirmedBookings.map((b: any) => (
                  <Link
                    key={b.id}
                    href={`/admin/enquiries/${b.id}`}
                    className="p-3 rounded-xl border border-[#E8E2D5] hover:bg-[#FAF6EC]/60 transition-colors flex items-center justify-between gap-3 block"
                  >
                    <div className="flex items-center gap-3">
                      {b.designs?.image_url && (
                        <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-[#FAF6EC] shrink-0 border border-[#E8E2D5]">
                          <Image
                            src={b.designs.image_url}
                            alt={b.designs.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#0B4A3A]">
                            Event Date: {new Date(b.event_date).toLocaleDateString("en-IN")}
                          </span>
                          <span className="text-[10px] text-[#5D6D67]">
                            (#{b.enquiry_id})
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#17211E]">
                          {b.profiles?.name} &mdash; {b.designs?.title}
                        </p>
                        {b.venue && (
                          <p className="text-[11px] text-[#5D6D67] truncate max-w-[280px]">
                            Venue: {b.venue}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={15} className="text-[#5D6D67] shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): 30-Day SVG Chart & Storage Meter */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: 30-Day Enquiry Volume (Lightweight Inline SVG) */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs space-y-4">
            <div className="border-b border-[#E8E2D5] pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
                Enquiry Trend (Last 30 Days)
              </h2>
              <p className="text-[11px] text-[#5D6D67] mt-0.5">
                Total enquiries: {last30DaysEnquiries?.length || 0}
              </p>
            </div>

            {/* Inline SVG Chart */}
            <div className="pt-2">
              <div className="h-36 w-full flex items-end justify-between gap-1 px-1">
                {chartData.map((d, i) => {
                  const heightPercent = Math.max(
                    6,
                    Math.round((d.count / maxDailyCount) * 100)
                  );
                  const isCurrentDay = i === chartData.length - 1;

                  return (
                    <div
                      key={d.date}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-[#17211E] text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 transition-opacity">
                        {d.date}: {d.count}
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-sm transition-all ${
                          d.count > 0
                            ? isCurrentDay
                              ? "bg-[#C9A24B]"
                              : "bg-[#0B4A3A] group-hover:bg-[#0E5A47]"
                            : "bg-[#FAF6EC] border-t border-[#E8E2D5]"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#5D6D67] mt-2 border-t border-[#E8E2D5] pt-1">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Card: Storage Allocation Meter */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-[#0B4A3A]" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
                  Cloud Storage Meter
                </h2>
              </div>
              <Link
                href="/admin/media"
                className="text-xs font-semibold text-[#0B4A3A] hover:underline"
              >
                Media Library &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5D6D67]">
                  {(totalBytesUsed / (1024 * 1024)).toFixed(1)} MB of 1,024 MB
                </span>
                <span className="font-bold text-[#17211E]">{storagePercent}%</span>
              </div>

              <div className="w-full h-2.5 bg-[#FAF6EC] rounded-full overflow-hidden border border-[#E8E2D5]">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    storagePercent >= 90
                      ? "bg-red-600"
                      : storagePercent >= 70
                      ? "bg-amber-500"
                      : "bg-[#0B4A3A]"
                  }`}
                  style={{ width: `${Math.max(2, storagePercent)}%` }}
                />
              </div>

              {storagePercent >= 90 ? (
                <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertTriangle size={13} />
                  Storage exceeds 90%. Delete unused photos in Media Library.
                </p>
              ) : storagePercent >= 70 ? (
                <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                  <AlertTriangle size={13} />
                  Storage exceeds 70%. Consider cleaning up unused photos.
                </p>
              ) : (
                <p className="text-[11px] text-[#5D6D67]">
                  Healthy storage capacity on free Supabase tier.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
