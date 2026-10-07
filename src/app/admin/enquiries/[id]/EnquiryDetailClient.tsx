"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Copy,
  Calendar,
  MapPin,
  Clock,
  User,
  Mail,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Save,
  Check,
  History,
  FileText,
  DollarSign,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  Booking,
  BookingStatus,
  BookingStatusHistory,
  BookingPrivate,
} from "@/types";
import toast from "react-hot-toast";

interface EnquiryDetailClientProps {
  initialBooking: Booking & {
    booking_status_history?: BookingStatusHistory[];
    booking_private?: BookingPrivate | null;
  };
}

const STATUS_STEPS: { status: BookingStatus; label: string; desc: string }[] = [
  {
    status: "pending",
    label: "Pending",
    desc: "Newly received from customer",
  },
  {
    status: "contacted",
    label: "Contacted",
    desc: "Customer reached via Phone/WhatsApp",
  },
  {
    status: "confirmed",
    label: "Confirmed",
    desc: "Stage booking locked in for event date",
  },
  {
    status: "rejected",
    label: "Rejected",
    desc: "Declined by customer or unavailable",
  },
];

export function EnquiryDetailClient({
  initialBooking,
}: EnquiryDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [booking, setBooking] = useState(initialBooking);
  const [status, setStatus] = useState<BookingStatus>(initialBooking.status);
  const [eventDate, setEventDate] = useState(initialBooking.event_date || "");
  const [venue, setVenue] = useState(initialBooking.venue || "");
  const [adminNotes, setAdminNotes] = useState(initialBooking.admin_notes || "");

  // Private internal data
  const [internalNotes, setInternalNotes] = useState(
    initialBooking.booking_private?.internal_notes || ""
  );
  const [quotedPrice, setQuotedPrice] = useState(
    initialBooking.booking_private?.quoted_price?.toString() || ""
  );

  // Status change note
  const [statusChangeNote, setStatusChangeNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Clash check state
  const [clashingBookings, setClashingBookings] = useState<any[]>([]);
  const [checkingClash, setCheckingClash] = useState(false);

  // Check for event date clash
  useEffect(() => {
    if (!eventDate) {
      setClashingBookings([]);
      return;
    }

    const checkDateClash = async () => {
      setCheckingClash(true);
      try {
        const { data } = await supabase
          .from("bookings")
          .select("id, enquiry_id, status, profiles(name)")
          .eq("event_date", eventDate)
          .eq("status", "confirmed")
          .neq("id", booking.id);

        setClashingBookings(data || []);
      } catch {
        // ignore
      } finally {
        setCheckingClash(false);
      }
    };

    checkDateClash();
  }, [eventDate, booking.id]);

  const handleCopyEnquiryId = () => {
    navigator.clipboard.writeText(booking.enquiry_id);
    setCopied(true);
    toast.success(`Copied #${booking.enquiry_id}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAll = async (targetStatus?: BookingStatus) => {
    const newStatus = targetStatus || status;
    const hasStatusChanged = newStatus !== booking.status;

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. Update bookings table (customer-visible data)
      const { error: bookingErr } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
          event_date: eventDate || null,
          venue: venue.trim() || null,
          admin_notes: adminNotes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (bookingErr) throw bookingErr;

      // 2. Upsert booking_private table (admin-only separation)
      const { error: privateErr } = await supabase
        .from("booking_private")
        .upsert({
          booking_id: booking.id,
          internal_notes: internalNotes.trim() || null,
          quoted_price: quotedPrice ? parseFloat(quotedPrice) : null,
        });

      if (privateErr) throw privateErr;

      // 3. If status changed, record in booking_status_history and activity_log
      if (hasStatusChanged) {
        await supabase.from("booking_status_history").insert({
          booking_id: booking.id,
          from_status: booking.status,
          to_status: newStatus,
          note: statusChangeNote.trim() || null,
          changed_by: user?.id || null,
        });

        await supabase.from("activity_log").insert({
          actor_id: user?.id || null,
          action: "status_change",
          entity: "booking",
          entity_id: booking.id,
          summary: `Updated enquiry #${booking.enquiry_id} from ${booking.status} to ${newStatus}`,
        });
      }

      toast.success("Enquiry details saved successfully");
      setStatus(newStatus);
      setStatusChangeNote("");
      router.refresh();
    } catch (err: any) {
      console.error("Save enquiry error:", err);
      toast.error(err.message || "Failed to update enquiry");
    } finally {
      setSaving(false);
    }
  };

  const customer = booking.profiles;
  const design = booking.designs;

  const waCleanPhone = customer?.phone?.replace(/\D/g, "") || "";
  const waNumber = waCleanPhone.startsWith("91")
    ? waCleanPhone
    : `91${waCleanPhone}`;
  const waText = encodeURIComponent(
    `Hello ${customer?.name || ""}, regarding your Sri Kubera Decor enquiry #${booking.enquiry_id} for "${design?.title || "stage decoration"}": `
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/enquiries"
            className="p-2 text-[#5D6D67] hover:text-[#17211E] rounded-xl hover:bg-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-[#E8E2D5]"
            aria-label="Back to enquiries"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
                Enquiry #{booking.enquiry_id}
              </h1>
              <button
                type="button"
                onClick={handleCopyEnquiryId}
                className="p-1.5 rounded-lg border border-[#E8E2D5] bg-white text-[#5D6D67] hover:text-[#17211E] transition-colors"
                title="Copy Enquiry ID"
                aria-label="Copy Enquiry ID"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs text-[#5D6D67] mt-1">
              Received on {new Date(booking.booking_date).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {customer?.phone && (
            <>
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[#0B4A3A] text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                <Phone size={14} />
                Call Customer
              </a>
              <a
                href={`https://wa.me/${waNumber}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 text-[#075E54] text-xs font-semibold hover:bg-[#25D366]/20 transition-colors"
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
            </>
          )}

          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#C9A24B]" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Date Clash Warning Banner */}
      {clashingBookings.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex items-start gap-3 shadow-xs">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Date Clash Warning:</span> There is already{" "}
            <strong>{clashingBookings.length} confirmed event</strong> scheduled on{" "}
            <strong>{new Date(eventDate).toLocaleDateString("en-IN")}</strong> (
            {clashingBookings
              .map((b) => `#${b.enquiry_id} - ${b.profiles?.name || "Customer"}`)
              .join(", ")}
            ). Setting this booking to confirmed will mean multiple stage setups on the same day.
          </div>
        </div>
      )}

      {/* Status Workflow Stepper */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] mb-4">
          Status Workflow
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATUS_STEPS.map((step) => {
            const isActive = status === step.status;
            return (
              <button
                key={step.status}
                type="button"
                onClick={() => setStatus(step.status)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0B4A3A] text-white border-[#0B4A3A] shadow-xs"
                    : "bg-[#FAF6EC]/50 hover:bg-[#FAF6EC] border-[#E8E2D5] text-[#17211E]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{step.label}</span>
                  {isActive && <CheckCircle2 size={14} className="text-[#C9A24B]" />}
                </div>
                <p
                  className={`text-[11px] leading-tight ${
                    isActive ? "text-[#FAF6EC]/80" : "text-[#5D6D67]"
                  }`}
                >
                  {step.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Optional note when status is changed */}
        {status !== booking.status && (
          <div className="mt-4 pt-4 border-t border-[#E8E2D5]">
            <label
              htmlFor="status-note"
              className="block text-xs font-semibold text-[#17211E] mb-1"
            >
              Note for this status change (recorded in audit history):
            </label>
            <input
              id="status-note"
              type="text"
              placeholder="e.g. Spoke with customer, agreed on Rs. 35,000 for Muthiyal Pettai hall"
              value={statusChangeNote}
              onChange={(e) => setStatusChangeNote(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            />
          </div>
        )}
      </div>

      {/* Main Grid: Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Event Details & Notes */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Event Logistics & Pricing */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] border-b border-[#E8E2D5] pb-3">
              Event Logistics &amp; Pricing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Event Date */}
              <div>
                <label
                  htmlFor="enquiry-event-date"
                  className="block text-xs font-semibold uppercase text-[#17211E] mb-1.5"
                >
                  Event Date (Customer Visible)
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none"
                  />
                  <input
                    id="enquiry-event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full min-h-[44px] text-xs pl-10 pr-3.5 py-2 rounded-xl border border-[#E8E2D5] text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
                  />
                </div>
              </div>

              {/* Quoted Price (Private) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="quoted-price"
                    className="block text-xs font-semibold uppercase text-[#17211E]"
                  >
                    Quoted Final Price (Private)
                  </label>
                  <span className="text-[10px] text-[#0B4A3A] font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Admin Only
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] font-semibold text-xs">
                    Rs.
                  </span>
                  <input
                    id="quoted-price"
                    type="number"
                    step="500"
                    placeholder="e.g. 40000"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    className="w-full min-h-[44px] text-xs pl-10 pr-3.5 py-2 rounded-xl border border-[#E8E2D5] text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
                  />
                </div>
              </div>
            </div>

            {/* Venue Location */}
            <div>
              <label
                htmlFor="enquiry-venue"
                className="block text-xs font-semibold uppercase text-[#17211E] mb-1.5"
              >
                Event Venue / Marriage Hall (Customer Visible)
              </label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none"
                />
                <input
                  id="enquiry-venue"
                  type="text"
                  placeholder="e.g. Anandha Inn Convention Centre, S.V. Patel Salai, Puducherry"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full min-h-[44px] text-xs pl-10 pr-3.5 py-2 rounded-xl border border-[#E8E2D5] text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
                />
              </div>
            </div>
          </div>

          {/* Card: Customer-Visible Note vs Private Internal Notes */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] border-b border-[#E8E2D5] pb-3">
              Notes &amp; Communication
            </h2>

            {/* Customer-Visible Note */}
            <div>
              <label
                htmlFor="admin-notes"
                className="block text-xs font-semibold uppercase text-[#17211E] mb-1.5"
              >
                Note to Customer (Visible in Customer Dashboard / Receipt)
              </label>
              <textarea
                id="admin-notes"
                rows={2}
                placeholder="e.g. Booking confirmed. Team will arrive at 7:00 AM on the event morning."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#E8E2D5] text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] leading-relaxed"
              />
            </div>

            {/* Admin Private Note (booking_private) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="internal-notes"
                  className="block text-xs font-semibold uppercase text-[#17211E]"
                >
                  Internal Admin Note (Never shown to customer)
                </label>
                <span className="text-[10px] text-[#0B4A3A] font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Admin Only
                </span>
              </div>
              <textarea
                id="internal-notes"
                rows={2}
                placeholder="e.g. Advance paid Rs. 10,000 cash on 15th. Balance Rs. 25,000 due after stage setup completion."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/30 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] leading-relaxed"
              />
            </div>
          </div>

          {/* Card: Status Change Timeline History */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E8E2D5] pb-3">
              <History size={16} className="text-[#0B4A3A]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
                Status Change History Timeline
              </h2>
            </div>

            {(!booking.booking_status_history ||
              booking.booking_status_history.length === 0) ? (
              <p className="text-xs text-[#5D6D67] italic">
                Initial status: {booking.status}. No status changes recorded yet.
              </p>
            ) : (
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E2D5]">
                {booking.booking_status_history.map((hist) => (
                  <div key={hist.id} className="relative">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#0B4A3A] ring-4 ring-white" />
                    <div className="bg-[#FAF6EC]/50 p-3 rounded-xl border border-[#E8E2D5] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#17211E]">
                          Status changed to &ldquo;{hist.to_status}&rdquo;
                        </span>
                        <span className="text-[11px] text-[#5D6D67]">
                          {new Date(hist.changed_at).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {hist.note && (
                        <p className="text-[#5D6D67] italic">&ldquo;{hist.note}&rdquo;</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Customer Profile & Design Preview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Customer Profile */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] border-b border-[#E8E2D5] pb-2 flex items-center gap-1.5">
              <User size={14} className="text-[#0B4A3A]" />
              Customer Profile
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#5D6D67] block text-[11px]">Full Name</span>
                <span className="font-bold text-sm text-[#17211E]">
                  {customer?.name || "Customer"}
                </span>
              </div>

              <div>
                <span className="text-[#5D6D67] block text-[11px]">Phone Number</span>
                <span className="font-semibold text-xs text-[#0B4A3A]">
                  {customer?.phone || "—"}
                </span>
              </div>

              <div>
                <span className="text-[#5D6D67] block text-[11px]">Email Address</span>
                <span className="text-xs text-[#17211E] break-all">
                  {customer?.email || "—"}
                </span>
              </div>

              {customer?.address && (
                <div>
                  <span className="text-[#5D6D67] block text-[11px]">Address</span>
                  <span className="text-xs text-[#17211E]">
                    {customer.address}
                    {customer.pincode ? ` - ${customer.pincode}` : ""}
                  </span>
                </div>
              )}
            </div>

            {customer?.id && (
              <div className="pt-2 border-t border-[#E8E2D5]">
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="text-xs text-[#0B4A3A] font-semibold hover:underline block"
                >
                  View full customer booking history &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Card: Selected Design */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] border-b border-[#E8E2D5] pb-2">
              Selected Stage Design
            </h2>

            {design ? (
              <div className="space-y-3">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF6EC] border border-[#E8E2D5]">
                  <Image
                    src={design.image_url}
                    alt={design.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-[#17211E]">
                    {design.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#0B4A3A] mt-0.5">
                    {design.price_on_request || !design.price
                      ? "Price on Request"
                      : `Standard Price: Rs. ${Number(design.price).toLocaleString("en-IN")}`}
                  </p>
                </div>

                {design.id && (
                  <Link
                    href={`/admin/designs/${design.id}`}
                    className="text-xs text-[#5D6D67] hover:text-[#0B4A3A] font-medium block"
                  >
                    Edit design catalog entry &rarr;
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#5D6D67] italic">
                Custom enquiry without a catalog design linked.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
