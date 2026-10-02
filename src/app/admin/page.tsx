import type { Metadata } from "next";
import Link from "next/link";
import { Images, ClipboardList, Users, Clock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/ui/StatusBadge";
import type { BookingStatus } from "@/types";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalDesigns },
    { count: totalEnquiries },
    { count: pendingEnquiries },
    { count: totalUsers },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from("designs").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
    supabase
      .from("bookings")
      .select("id, enquiry_id, status, booking_date, profiles(name), designs(title)")
      .order("booking_date", { ascending: false })
      .limit(8),
  ]);

  const stats = [
    { label: "Total Designs", value: totalDesigns || 0, icon: Images, href: "/admin/gallery", color: "text-gold-600", bg: "bg-gold-50" },
    { label: "Total Enquiries", value: totalEnquiries || 0, icon: ClipboardList, href: "/admin/enquiries", color: "text-navy-700", bg: "bg-navy-50" },
    { label: "Pending Enquiries", value: pendingEnquiries || 0, icon: Clock, href: "/admin/enquiries?status=pending", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Registered Users", value: totalUsers || 0, icon: Users, href: "/admin/users", color: "text-emerald-700", bg: "bg-emerald-50" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-navy-900">Dashboard</h1>
        <p className="text-navy-500 text-sm mt-1">Welcome to the Sri Kubera admin panel.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link key={label} href={href} className="card-hover p-5 group">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-3xl font-serif font-bold text-navy-900">{value}</p>
            <p className="text-navy-500 text-xs mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent enquiries */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
          <h2 className="font-serif font-semibold text-navy-900">Recent Enquiries</h2>
          <Link href="/admin/enquiries" className="text-gold-600 text-sm hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {!recentBookings?.length ? (
          <div className="px-6 py-10 text-center text-navy-400 text-sm">No enquiries yet.</div>
        ) : (
          <div className="divide-y divide-cream-200">
            {recentBookings.map((b) => (
              <Link
                key={b.id}
                href={`/admin/enquiries/${b.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-cream-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-navy-800 text-sm tracking-wide">{b.enquiry_id}</p>
                  <p className="text-navy-500 text-xs">
                    {(b.profiles as any)?.name || "—"} &mdash; {(b.designs as any)?.title || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-navy-400 text-xs hidden sm:block">
                    {new Date(b.booking_date).toLocaleDateString("en-IN")}
                  </span>
                  <StatusBadge status={b.status as BookingStatus} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
