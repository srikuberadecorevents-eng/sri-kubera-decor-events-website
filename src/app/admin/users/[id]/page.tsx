import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Hash } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/ui/StatusBadge";
import type { BookingStatus } from "@/types";

export const metadata: Metadata = { title: "User Detail" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, designs(title, image_url)")
    .eq("user_id", id)
    .order("booking_date", { ascending: false });

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/users" className="btn-ghost"><ArrowLeft size={16} /></Link>
        <h1 className="text-2xl font-serif font-bold text-navy-900">{profile.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Avatar card */}
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-navy-gradient flex items-center justify-center mb-3">
            <span className="text-white text-3xl font-serif font-bold">{profile.name.charAt(0)}</span>
          </div>
          <h2 className="font-serif font-bold text-navy-900 text-lg">{profile.name}</h2>
          <span className="badge bg-navy-100 text-navy-700 mt-1">{profile.role}</span>
          {profile.gender && <p className="text-navy-500 text-xs mt-1 capitalize">{profile.gender}</p>}
          <p className="text-navy-400 text-xs mt-2">
            Joined {new Date(profile.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
          </p>
        </div>

        {/* Contact details */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-serif font-semibold text-navy-900 mb-4">Contact Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail size={15} className="text-gold-500 shrink-0" />
              <span className="text-navy-700">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={15} className="text-gold-500 shrink-0" />
              <span className="text-navy-700">{profile.phone}</span>
            </div>
            {profile.address && (
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-gold-500 shrink-0 mt-0.5" />
                <span className="text-navy-700">{profile.address}</span>
              </div>
            )}
            {profile.pincode && (
              <div className="flex items-center gap-3">
                <Hash size={15} className="text-gold-500 shrink-0" />
                <span className="text-navy-700">{profile.pincode}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enquiry history */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200">
          <h3 className="font-serif font-semibold text-navy-900">Enquiry History ({bookings?.length || 0})</h3>
        </div>
        {!bookings?.length ? (
          <div className="p-8 text-center text-navy-400 text-sm">No enquiries from this customer yet.</div>
        ) : (
          <div className="divide-y divide-cream-200">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/admin/enquiries/${b.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-cream-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {(b.designs as any)?.image_url && (
                    <img src={(b.designs as any).image_url} alt="" className="w-10 h-8 rounded object-cover" />
                  )}
                  <div>
                    <p className="font-serif font-bold text-navy-800 text-sm tracking-wider">{b.enquiry_id}</p>
                    <p className="text-navy-500 text-xs">{(b.designs as any)?.title || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-navy-400 text-xs">{new Date(b.booking_date).toLocaleDateString("en-IN")}</span>
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
