import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IndianRupee,
  CheckCircle,
  MessageCircle,
  ArrowLeft,
  Calendar,
  Sparkles,
  Phone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { INITIAL_DESIGNS } from "@/data/initialDesigns";
import type { Design } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

async function getDesign(id: string): Promise<Design | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("designs")
      .select("*, categories(id, name, created_at)")
      .eq("id", id)
      .maybeSingle();

    if (data) return data as Design;
  } catch {
    // DB lookup error, fall through to fallback
  }

  const fallback = INITIAL_DESIGNS.find((d) => d.id === id);
  return fallback || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const design = await getDesign(id);

  if (!design) {
    return {
      title: "Design Not Found — Sri Kubera Decor & Events",
    };
  }

  return {
    title: `${design.title} — Sri Kubera Decor & Events Puducherry`,
    description:
      design.description ||
      "View stage decoration details, inclusions, and book via WhatsApp or online enquiry.",
  };
}

export default async function DesignDetailPage({ params }: Props) {
  const { id } = await params;
  const design = await getDesign(id);

  if (!design) notFound();

  const inclusions = design.inclusions
    ? design.inclusions.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const waNumber = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";
  const priceFormatted = design.price ? `₹${Number(design.price).toLocaleString("en-IN")}` : "Price on enquiry";
  const waText = encodeURIComponent(
    `Hello Sri Kubera Decor & Events, I would like to enquire about the design "${design.title}" (${priceFormatted}). Please share availability and details.`
  );

  return (
    <div className="py-12 bg-ivory-100 min-h-screen">
      <div className="page-container">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-900 text-sm mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Back to Gallery
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-ivory-200 border border-ivory-300">
            <Image
              src={design.image_url}
              alt={`${design.title} — Sri Kubera Decor & Events Puducherry`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {design.categories && (
              <span className="absolute top-4 left-4 badge bg-navy-900/90 text-ivory-100 backdrop-blur-md px-3.5 py-1 text-xs">
                {design.categories.name}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-ivory-200">
            <div className="inline-flex items-center gap-1.5 text-xs text-gold-600 font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Sri Kubera Signature Collection
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold text-navy-900 mb-4 leading-snug"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {design.title}
            </h1>

            {design.price ? (
              <div className="flex items-baseline gap-2 mb-6">
                <div className="flex items-center gap-1 text-3xl font-extrabold text-gold-600">
                  <IndianRupee size={26} />
                  <span>{Number(design.price).toLocaleString("en-IN")}</span>
                </div>
                <span className="text-xs text-navy-400 font-medium">(Inclusive of setup & lighting)</span>
              </div>
            ) : (
              <div className="text-xl font-bold text-gold-600 mb-6 italic">Price on Enquiry</div>
            )}

            {design.description && (
              <p className="text-navy-600 leading-relaxed text-sm md:text-base mb-8">
                {design.description}
              </p>
            )}

            {inclusions.length > 0 && (
              <div className="mb-8 p-5 bg-ivory-50 rounded-2xl border border-ivory-200">
                <h2 className="font-bold text-navy-900 mb-3 text-xs uppercase tracking-widest">
                  What&apos;s Included In This Setup
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {inclusions.map((item: string) => (
                    <li key={item} className="flex items-start gap-2 text-xs md:text-sm text-navy-700">
                      <CheckCircle size={15} className="text-gold-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-navy-400 mb-8">
              <Calendar size={13} />
              Sri Kubera Decor & Events &bull; Puducherry
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <a
                href={`https://wa.me/${waNumber}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-600/25 active:scale-95 text-base"
              >
                <MessageCircle size={20} />
                Instant WhatsApp Enquiry
              </a>

              <EnquireButton designId={design.id} />

              <a
                href="tel:7373876879"
                className="btn-outline w-full text-center text-xs py-3 justify-center"
              >
                <Phone size={14} />
                Call Directly: 7373876879 / 9486064769
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server-side enquire button that checks auth
async function EnquireButton({ designId }: { designId: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href={`/login?redirectTo=/gallery/${designId}`}
        className="btn-primary w-full text-center text-sm py-3.5 justify-center"
      >
        Login to Book / Save Enquiry
      </Link>
    );
  }

  return (
    <Link
      href={`/gallery/${designId}/enquire`}
      className="btn-primary w-full text-center text-sm py-3.5 justify-center"
    >
      <MessageCircle size={17} />
      Raise Portal Booking Request
    </Link>
  );
}
