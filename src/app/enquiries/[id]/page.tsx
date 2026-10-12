import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  MessageCircle,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/ui/StatusBadge";
import type { BookingStatus } from "@/types";
import { CopyButton } from "@/components/ui/CopyButton";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Enquiry Details - Sri Kubera Decor & Events",
  robots: { index: false, follow: false },
};

export default async function EnquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  let user = null;

  if (process.env.NODE_ENV !== "production") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const testCookie = cookieStore.get("test_auth_user")?.value;
    if (testCookie) {
      try {
        user = JSON.parse(decodeURIComponent(testCookie));
      } catch {}
    }
  }

  if (!user) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  }

  if (!user) redirect("/login");

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "*, designs(title, image_url, description, price, inclusions, categories(name)), profiles(name, email, phone)"
    )
    .eq("id", id)
    .single();

  if (!booking) notFound();
  if (booking.user_id !== user.id) notFound();

  const design = booking.designs as any;
  const profile = booking.profiles as any;

  const waNumber = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "919486064769";
  const waText = encodeURIComponent(
    `Hello Sri Kubera Decor team, I am inquiring regarding my Enquiry ID ${booking.enquiry_id} for "${design?.title || "Decoration Design"}". Please assist me with further details and booking confirmation.`
  );

  const getStepProgress = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return 3;
      case "contacted":
        return 2;
      case "pending":
      default:
        return 1;
    }
  };

  const step = getStepProgress(booking.status as BookingStatus);

  return (
    <div className="py-10 md:py-14 bg-[#FAF7F2]">
      <div className="page-container max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-navy-500 mb-3">
          <Link href="/enquiries" className="hover:text-gold-600 transition-colors">
            My Enquiries
          </Link>
          <span>/</span>
          <span className="text-navy-900 font-mono">{booking.enquiry_id}</span>
        </div>

        {/* Back Link */}
        <Link
          href="/enquiries"
          className="inline-flex items-center gap-2 text-navy-600 hover:text-navy-900 text-xs font-bold uppercase tracking-wider mb-5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to All Enquiries
        </Link>

        {/* Hero Card with Enquiry ID & Stepper */}
        <div className="bg-gradient-to-br from-[#06261E] via-[#0B3D30] to-[#06261E] rounded-3xl p-6 md:p-8 mb-6 text-white border border-[#C9A24B]/30 shadow-lg relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 bg-repeat pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#C9A24B 1px, transparent 1px), radial-gradient(#C9A24B 1px, #06261E 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A24B]/20 text-[#ECC870] text-xs font-bold uppercase tracking-widest mb-3 border border-[#C9A24B]/30">
              <Sparkles size={13} />
              Enquiry Tracking Reference
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-widest my-2">
              {booking.enquiry_id}
            </h1>
            <div className="flex items-center justify-center gap-3 mt-2 mb-6">
              <StatusBadge status={booking.status as BookingStatus} />
              <CopyButton text={booking.enquiry_id} />
            </div>

            {/* Stepper Progress Bar */}
            <div className="w-full max-w-xl bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 mt-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                      step >= 1 ? "bg-emerald-500 text-white" : "bg-white/20 text-white/60"
                    }`}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-xs font-bold text-white">Enquiry Placed</span>
                  <span className="text-[10px] text-ivory-300">Received by team</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                      step >= 2 ? "bg-emerald-500 text-white" : "bg-white/20 text-white/60"
                    }`}
                  >
                    {step >= 2 ? <CheckCircle2 size={16} /> : "2"}
                  </div>
                  <span className="text-xs font-bold text-white">In Discussion</span>
                  <span className="text-[10px] text-ivory-300">Review &amp; Quote</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                      step >= 3 ? "bg-emerald-500 text-white" : "bg-white/20 text-white/60"
                    }`}
                  >
                    {step >= 3 ? <CheckCircle2 size={16} /> : "3"}
                  </div>
                  <span className="text-xs font-bold text-white">Confirmed</span>
                  <span className="text-[10px] text-ivory-300">Date reserved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Left Column: Design Specification */}
          <div className="lg:col-span-7 space-y-6">
            {design && (
              <div className="bg-white rounded-3xl p-5 md:p-7 border border-ivory-300 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-700 mb-3">
                  <Sparkles size={14} />
                  Selected Decoration Concept
                </div>
                <h2 className="text-2xl font-serif font-bold text-navy-950 mb-4">
                  {design.title}
                </h2>

                {design.image_url && (
                  <div className="relative w-full h-72 md:h-80 rounded-2xl overflow-hidden mb-6 border border-ivory-300 bg-ivory-100">
                    <Image
                      src={design.image_url}
                      alt={design.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    {design.categories?.name && (
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-gold-300 text-xs font-bold border border-gold-500/30">
                        {design.categories.name}
                      </div>
                    )}
                  </div>
                )}

                {design.description && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-navy-500 mb-1.5">
                      Description &amp; Overview
                    </h3>
                    <p className="text-navy-700 text-sm leading-relaxed whitespace-pre-line">
                      {design.description}
                    </p>
                  </div>
                )}

                {design.inclusions && Array.isArray(design.inclusions) && design.inclusions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-navy-500 mb-2">
                      Standard Package Inclusions
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-navy-800">
                      {design.inclusions.map((inc: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 bg-ivory-50 p-2.5 rounded-xl border border-ivory-200">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Team Notes */}
            {booking.admin_notes && (
              <div className="bg-gold-50/70 rounded-3xl p-6 border border-gold-300 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-800 mb-2">
                  <Sparkles size={14} className="text-gold-600" />
                  Notes from Sri Kubera Decor Team
                </div>
                <p className="text-navy-900 text-sm leading-relaxed whitespace-pre-line">
                  {booking.admin_notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Coordination Info & Actions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Booking Information Card */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-ivory-300 shadow-sm">
              <h3 className="text-lg font-serif font-bold text-navy-950 mb-4 pb-3 border-b border-ivory-200">
                Enquiry Information
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-navy-400 font-semibold uppercase tracking-wider text-[10px]">
                      Submitted On
                    </span>
                    <span className="text-navy-900 font-bold text-sm">
                      {new Date(booking.booking_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {booking.event_date && (
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-gold-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-navy-400 font-semibold uppercase tracking-wider text-[10px]">
                        Target Event Date
                      </span>
                      <span className="text-navy-900 font-bold text-sm">
                        {booking.event_date}
                      </span>
                    </div>
                  </div>
                )}

                {booking.venue && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gold-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-navy-400 font-semibold uppercase tracking-wider text-[10px]">
                        Venue Location
                      </span>
                      <span className="text-navy-900 font-bold text-sm">
                        {booking.venue}
                      </span>
                    </div>
                  </div>
                )}

                <div className="h-px bg-ivory-200 my-2" />

                <div className="flex items-start gap-3">
                  <User size={16} className="text-navy-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-navy-400 font-semibold uppercase tracking-wider text-[10px]">
                      Contact Name
                    </span>
                    <span className="text-navy-900 font-semibold">
                      {profile?.name || "Customer"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-navy-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-navy-400 font-semibold uppercase tracking-wider text-[10px]">
                      Registered Phone
                    </span>
                    <span className="text-navy-900 font-semibold">
                      {profile?.phone || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Action Card */}
            <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900 mb-2">
                Actions &amp; Documentation
              </h3>

              <a
                href={`https://wa.me/${waNumber}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm transition-colors shadow-sm"
              >
                <MessageCircle size={18} />
                WhatsApp About This Enquiry
              </a>

              <a
                href={`/api/receipt/${booking.id}`}
                download={`enquiry-${booking.enquiry_id}.pdf`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-ivory-100 hover:bg-ivory-200 text-navy-900 font-bold text-sm border border-ivory-300 transition-colors"
              >
                <Download size={18} className="text-gold-600" />
                Download Official PDF Receipt
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
