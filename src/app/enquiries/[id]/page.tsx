import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  MessageCircle,
  Calendar,
  Copy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/ui/StatusBadge";
import type { BookingStatus } from "@/types";
import CopyButton from "./CopyButton";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Enquiry Detail" };

export default async function EnquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, designs(title, image_url, description, price, inclusions, categories(name)), profiles(name, email, phone)")
    .eq("id", id)
    .single();

  if (!booking) notFound();
  if (booking.user_id !== user.id) notFound();

  const design = booking.designs as any;
  const waNumber = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";
  const waText = encodeURIComponent(
    `Hello, I have raised an enquiry for the design "${design?.title || "your design"}". My Enquiry ID is ${booking.enquiry_id}. Please help me with the booking.`
  );

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="page-container max-w-3xl mx-auto">
        <Link
          href="/enquiries"
          className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-800 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to My Enquiries
        </Link>

        {/* Enquiry ID card */}
        <div className="bg-navy-900 rounded-2xl p-8 mb-6 text-center">
          <p className="text-gold-400 text-xs uppercase tracking-widest mb-3">
            Enquiry ID
          </p>
          <p className="text-6xl font-serif font-bold text-white tracking-widest mb-4">
            {booking.enquiry_id}
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <StatusBadge status={booking.status as BookingStatus} />
          </div>
          <CopyButton text={booking.enquiry_id} />
        </div>

        {/* Design info */}
        {design && (
          <div className="card p-6 mb-6">
            <h2 className="font-serif font-bold text-navy-900 text-lg mb-4">Design Details</h2>
            <div className="flex gap-4">
              {design.image_url && (
                <div className="relative w-28 h-24 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={design.image_url}
                    alt={design.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-navy-800 mb-1">{design.title}</h3>
                {design.categories?.name && (
                  <span className="badge bg-navy-100 text-navy-600 mb-2">{design.categories.name}</span>
                )}
                {design.price && (
                  <p className="text-gold-600 font-semibold text-sm mt-1">
                    Starting from Rs. {Number(design.price).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Booking info */}
        <div className="card p-6 mb-6">
          <h2 className="font-serif font-bold text-navy-900 text-lg mb-4">Enquiry Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={15} className="text-gold-500 shrink-0" />
              <span className="text-navy-500">Submitted on:</span>
              <span className="text-navy-800 font-medium">
                {new Date(booking.booking_date).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-navy-500 ml-5.5">Current status:</span>
              <StatusBadge status={booking.status as BookingStatus} />
            </div>
          </div>

          {booking.admin_notes && (
            <div className="mt-4 p-4 bg-cream-100 rounded-xl border border-cream-300">
              <p className="text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">
                Notes from our team
              </p>
              <p className="text-navy-700 text-sm leading-relaxed">{booking.admin_notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`/api/receipt/${booking.id}`}
            download={`enquiry-${booking.enquiry_id}.pdf`}
            className="btn-secondary flex items-center gap-2 justify-center"
          >
            <Download size={16} />
            Download Receipt (PDF)
          </a>
          <a
            href={`https://wa.me/${waNumber}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 justify-center px-6 py-3 rounded-lg bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1ebe5b] transition-colors"
          >
            <MessageCircle size={16} />
            Message on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
