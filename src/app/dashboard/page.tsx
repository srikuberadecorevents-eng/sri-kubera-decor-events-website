import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, User, ArrowRight, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: enquiries } = await supabase
    .from("bookings")
    .select("id, enquiry_id, status, booking_date, designs(title)")
    .eq("user_id", user.id)
    .order("booking_date", { ascending: false })
    .limit(5);

  const pending = enquiries?.filter((e) => e.status === "pending").length || 0;
  const confirmed = enquiries?.filter((e) => e.status === "confirmed").length || 0;

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="page-container max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-navy-900">
            Welcome back, {profile?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-navy-500 mt-1 text-sm">
            Browse our gallery, raise enquiries, and track your bookings all from here.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Enquiries", value: enquiries?.length || 0, color: "text-navy-900" },
            { label: "Pending", value: pending, color: "text-amber-600" },
            { label: "Confirmed", value: confirmed, color: "text-emerald-600" },
            { label: "Designs Available", value: "50+", color: "text-gold-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-5 text-center">
              <p className={`text-3xl font-serif font-bold ${color}`}>{value}</p>
              <p className="text-navy-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link href="/enquiries" className="card-hover p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center group-hover:bg-gold-100 transition-colors">
              <ClipboardList size={22} className="text-gold-600" />
            </div>
            <div>
              <h3 className="font-semibold text-navy-900 text-base">My Enquiries</h3>
              <p className="text-navy-500 text-xs">View all your design enquiries and statuses</p>
            </div>
            <ArrowRight size={16} className="text-navy-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link href="/profile" className="card-hover p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-navy-100 transition-colors">
              <User size={22} className="text-navy-600" />
            </div>
            <div>
              <h3 className="font-semibold text-navy-900 text-base">My Profile</h3>
              <p className="text-navy-500 text-xs">Update your contact details and preferences</p>
            </div>
            <ArrowRight size={16} className="text-navy-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Recent enquiries */}
        {enquiries && enquiries.length > 0 && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <h2 className="font-serif font-semibold text-navy-900">Recent Enquiries</h2>
              <Link href="/enquiries" className="text-gold-600 text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-cream-200">
              {enquiries.map((e) => (
                <Link
                  key={e.id}
                  href={`/enquiries/${e.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-cream-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-navy-800 text-sm tracking-wide">{e.enquiry_id}</p>
                    <p className="text-navy-500 text-xs mt-0.5">{(e.designs as any)?.title || "Design"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-navy-400 text-xs flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(e.booking_date).toLocaleDateString("en-IN")}
                    </span>
                    <span className={`badge text-xs ${
                      e.status === "pending" ? "badge-pending" :
                      e.status === "contacted" ? "badge-contacted" :
                      e.status === "confirmed" ? "badge-confirmed" : "badge-rejected"
                    }`}>
                      {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!enquiries?.length && (
          <div className="card p-10 text-center">
            <ClipboardList size={40} className="text-navy-200 mx-auto mb-3" />
            <h3 className="font-serif font-semibold text-navy-700 mb-2">No enquiries yet</h3>
            <p className="text-navy-400 text-sm mb-5">
              Browse our gallery and raise your first enquiry to get started.
            </p>
            <Link href="/gallery" className="btn-primary">Browse Gallery</Link>
          </div>
        )}
      </div>
    </div>
  );
}
