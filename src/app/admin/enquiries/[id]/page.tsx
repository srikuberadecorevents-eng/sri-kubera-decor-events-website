import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/ui/StatusBadge";
import type { BookingStatus } from "@/types";
import EnquiryStatusForm from "./EnquiryStatusForm";

export const metadata: Metadata = { title: "Enquiry Detail" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEnquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, profiles(name, email, phone, address, pincode), designs(title, image_url, price, categories(name))")
    .eq("id", id)
    .single();

  if (!booking) notFound();

  const customer = booking.profiles as any;
  const design = booking.designs as any;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/enquiries" className="btn-ghost">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">
            Enquiry {booking.enquiry_id}
          </h1>
        </div>
        <StatusBadge status={booking.status as BookingStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer info */}
        <div className="card p-6">
          <h2 className="font-serif font-bold text-navy-900 mb-4">Customer Details</h2>
          <dl className="space-y-3 text-sm">
            {[
              { label: "Name", value: customer?.name },
              { label: "Email", value: customer?.email },
              { label: "Phone", value: customer?.phone },
              { label: "Address", value: customer?.address },
              { label: "Pincode", value: customer?.pincode },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex gap-2">
                <dt className="text-navy-500 w-20 shrink-0">{label}</dt>
                <dd className="text-navy-800 font-medium">{value}</dd>
              </div>
            ) : null)}
          </dl>
        </div>

        {/* Design info */}
        <div className="card p-6">
          <h2 className="font-serif font-bold text-navy-900 mb-4">Design Details</h2>
          {design && (
            <div className="flex gap-4">
              {design.image_url && (
                <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0">
                  <img src={design.image_url} alt={design.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <p className="font-semibold text-navy-800">{design.title}</p>
                {design.categories?.name && (
                  <span className="badge bg-navy-100 text-navy-600 text-xs">{design.categories.name}</span>
                )}
                {design.price && (
                  <p className="text-gold-600 font-semibold text-sm mt-1">
                    Rs. {Number(design.price).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status update */}
      <div className="card p-6 mt-6">
        <h2 className="font-serif font-bold text-navy-900 mb-4">Update Status &amp; Notes</h2>
        <EnquiryStatusForm
          bookingId={booking.id}
          currentStatus={booking.status as BookingStatus}
          currentNotes={booking.admin_notes || ""}
        />
      </div>
    </div>
  );
}
