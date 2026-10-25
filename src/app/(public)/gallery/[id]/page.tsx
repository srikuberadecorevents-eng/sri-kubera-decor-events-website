import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle,
  ArrowLeft,
  Calendar,
  Sparkles,
  Phone,
  Lock,
  LogIn,
  UserPlus,
} from "lucide-react";
import { createPublicClient, createClient } from "@/lib/supabase/server";
import { INITIAL_DESIGNS } from "@/data/initialDesigns";
import { getPublicFeaturedDesigns, isFeaturedDesign } from "@/lib/designs";
import type { Design } from "@/types";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import GalleryEnquireButton from "@/components/ui/GalleryEnquireButton";
import WhatsAppEnquireDetailButton from "@/components/ui/WhatsAppEnquireDetailButton";

export const revalidate = 300;

export async function generateStaticParams() {
  const featured = await getPublicFeaturedDesigns();
  return featured.map((d) => ({ id: d.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

async function getDesign(id: string): Promise<Design | null> {
  try {
    const supabase = createPublicClient();
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

  const isPublic = await isFeaturedDesign(design.id);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://srikuberadecorevents.in";
  const rawImage = design.image_url || "/images/hero.jpg";
  const ogImageUrl = rawImage.startsWith("http")
    ? rawImage
    : `${siteUrl}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;
  const canonicalUrl = `${siteUrl}/gallery/${design.id}`;
  const categoryName = design.categories?.name || "Stage Decoration";

  const description =
    design.description ||
    `Explore ${design.title} (${categoryName}) by Sri Kubera Decor & Events Puducherry. Custom stage decoration, backdrops, and floral arrangements. Enquire on WhatsApp for booking and custom pricing.`;

  return {
    title: `${design.title} — Sri Kubera Decor & Events Puducherry`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isPublic
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: `${design.title} | Sri Kubera Decor Puducherry`,
      description,
      url: canonicalUrl,
      siteName: "Sri Kubera Decor & Events",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${design.title} — Sri Kubera Decor & Events`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${design.title} | Sri Kubera Decor Puducherry`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function DesignDetailPage({ params }: Props) {
  const { id } = await params;
  const design = await getDesign(id);

  if (!design) notFound();

  // Authentication & Gating:
  // First 6 designs are available with full content for guests and search engines (HTTP 200).
  // Gated designs beyond the first 6 display an in-page sign-in prompt for guests (HTTP 200, no redirect).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicFeatured = await isFeaturedDesign(design.id);

  if (!user && !isPublicFeatured) {
    return (
      <div className="py-12 md:py-16 bg-ivory-100 min-h-[70vh] flex items-center">
        <div className="page-container max-w-2xl mx-auto">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-900 text-sm mb-6 transition-colors font-medium"
          >
            <ArrowLeft size={16} />
            Back to Gallery
          </Link>

          <div className="luxury-card p-8 md:p-12 text-center border border-gold-300/40 shadow-xl bg-white rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-gold-500/15 border border-gold-400/40 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Lock size={30} className="text-gold-600" />
            </div>

            <div className="section-eyebrow justify-center mb-2">
              <Sparkles size={14} className="text-bronze" />
              <span>Exclusive Member Collection</span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold text-navy-950 mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Sign In to View This Design
            </h1>

            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto mb-4" />

            <p className="text-navy-600 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
              This signature stage decoration is part of our private member portfolio.
              Sign in or create a complimentary account to explore full photos,
              customized pricing, and direct booking options.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center mb-8">
              <Link
                href={`/login?redirectTo=${encodeURIComponent(`/gallery/${design.id}`)}`}
                className="btn-gold py-3.5 px-8 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <LogIn size={16} />
                <span>Sign In to Unlock</span>
              </Link>

              <Link
                href={`/signup?redirectTo=${encodeURIComponent(`/gallery/${design.id}`)}`}
                className="btn-outline py-3.5 px-8 text-sm font-bold flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                <span>Create Free Account</span>
              </Link>
            </div>

            <div className="pt-6 border-t border-ivory-300 text-xs text-navy-500 flex flex-col sm:flex-row items-center justify-center gap-4">
              <span>Need immediate assistance?</span>
              <a
                href="tel:7373876879"
                className="inline-flex items-center gap-1.5 font-bold text-navy-800 hover:text-gold-700 transition-colors"
              >
                <Phone size={13} className="text-bronze" />
                <span>Call 7373876879 / 9486064769</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inclusions = design.inclusions
    ? design.inclusions.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="py-10 md:py-14 bg-ivory-100">
      <div className="page-container">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-900 text-sm mb-4 md:mb-5 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Back to Gallery
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-ivory-200 border border-ivory-300">
            <ResponsiveImage
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
          <div className="luxury-card p-6 md:p-8 flex flex-col">
            <div className="section-eyebrow self-start">
              <Sparkles size={14} className="text-bronze" />
              <span>Sri Kubera Signature Collection</span>
            </div>

            <h1
              className="section-heading-serif text-navy-950 mb-3"
            >
              {design.title}
            </h1>

            {design.description && (
              <p className="text-navy-600 leading-relaxed text-sm md:text-base mb-6">
                {design.description}
              </p>
            )}

            {inclusions.length > 0 && (
              <div className="mb-6 p-5 bg-ivory-50 rounded-2xl border border-ivory-200">
                <h2 className="font-bold text-navy-900 mb-3 text-xs uppercase tracking-widest">
                  What&apos;s Included In This Setup
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {inclusions.map((item: string) => (
                    <li key={item} className="flex items-start gap-2 text-xs md:text-sm text-navy-800">
                      <CheckCircle size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-navy-500 mb-6 font-medium">
              <Calendar size={13} className="text-bronze" />
              <span>Sri Kubera Decor &amp; Events &bull; Muthiyal Pettai, Puducherry</span>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <WhatsAppEnquireDetailButton
                design={{
                  id: design.id,
                  title: design.title,
                  category: design.categories?.name,
                  image_url: design.image_url,
                }}
              />

              <GalleryEnquireButton designId={design.id} />

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

