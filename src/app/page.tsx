import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Phone,
  CheckCircle,
  Star,
  Quote,
  Megaphone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DesignCard from "@/components/ui/DesignCard";
import HeroCounter from "@/components/ui/HeroCounter";
import PostRequirementSection from "@/components/sections/PostRequirementSection";
import type { HeroSlide } from "@/types";

export const revalidate = 60; // Cache with ISR; revalidated on admin actions

export const metadata: Metadata = {
  title: "Sri Kubera Decor & Events — We Decor Your Dreams",
  description:
    "Premium stage decorations for weddings, birthdays, surprise parties, and corporate events in Puducherry. Contact us at 7373876879.",
};

const defaultOccasions = [
  {
    id: "wedding",
    label: "Wedding",
    subtitle: "Grand romantic stages",
    image: "/assets/120000.jpeg",
    href: "/gallery",
  },
  {
    id: "birthday",
    label: "Birthday",
    subtitle: "Vibrant themed setups",
    image: "/assets/25000.jpeg",
    href: "/gallery",
  },
  {
    id: "surprise",
    label: "Surprise",
    subtitle: "Magical celebrations",
    image: "/assets/35000.jpeg",
    href: "/gallery",
  },
  {
    id: "corporate",
    label: "Corporate",
    subtitle: "Professional event polish",
    image: "/assets/85000.jpeg",
    href: "/gallery",
  },
];

const whyUsPoints = [
  "Specialized stage decoration expertise across Puducherry",
  "Fresh flowers, hand-crafted backdrops & premium ambient lighting",
  "Dedicated on-site coordination team ensuring seamless execution",
  "Bespoke designs tailored to your cultural traditions and venue space",
  "Transparent, direct pricing with zero hidden vendor markups",
];

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch all initial data concurrently in parallel
  const [
    { data: siteContentRows },
    { data: businessSettings },
    { data: publishedDesigns },
    { data: publishedTestimonials },
    { data: activeCategories },
  ] = await Promise.all([
    supabase.from("site_content").select("*"),
    supabase.from("business_settings").select("*").limit(1).maybeSingle(),
    supabase
      .from("designs")
      .select("*, categories(id, name, created_at)")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(4),
  ]);

  const siteContent: Record<string, any> = {};
  if (siteContentRows) {
    for (const row of siteContentRows) {
      siteContent[row.key] = row.value;
    }
  }

  const heroSlides: HeroSlide[] = Array.isArray(siteContent.hero_slides)
    ? siteContent.hero_slides
    : [];
  const activeSlide = heroSlides[0];

  const announcement = siteContent.announcement as
    | { text?: string; is_active?: boolean }
    | undefined;

  const statsData = siteContent.stats as
    | { events_done?: number | null; years?: number | null; happy_customers?: number | null }
    | undefined;

  const aboutData = siteContent.about as
    | { text?: string; proprietor?: string; years_in_business?: number | null }
    | undefined;

  // Build real dynamic stats (only show stats explicitly provided by the owner; no invented stats)
  const dynamicStats: { value: number; suffix: string; label: string }[] = [];
  if (statsData?.events_done && statsData.events_done > 0) {
    dynamicStats.push({ value: statsData.events_done, suffix: "+", label: "Events Decorated" });
  }
  if (statsData?.years && statsData.years > 0) {
    dynamicStats.push({ value: statsData.years, suffix: "+", label: "Years of Experience" });
  }
  if (statsData?.happy_customers && statsData.happy_customers > 0) {
    dynamicStats.push({ value: statsData.happy_customers, suffix: "+", label: "Happy Customers" });
  }

  const businessPhone = businessSettings?.phone || "7373876879";
  const businessWa = businessSettings?.whatsapp || "917373876879";

  return (
    <>
      {/* ─────────────────── ANNOUNCEMENT BAR (if active) ─────────────────── */}
      {announcement?.is_active && announcement?.text && (
        <div className="bg-[#0B4A3A] text-[#FAF6EC] px-4 py-2.5 text-center text-sm font-medium border-b border-[#C9A24B]/30 flex items-center justify-center gap-2">
          <Megaphone size={16} className="text-[#C9A24B] shrink-0" />
          <span>{announcement.text}</span>
        </div>
      )}

      {/* ─────────────────── HERO ─────────────────── */}
      <section
        className="relative min-h-[92svh] flex items-center justify-center overflow-hidden"
        aria-label="Hero"
      >
        {/* Background photo */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={activeSlide?.image_url || "/assets/120000.jpeg"}
            alt="Sri Kubera Decor & Events - Stage Decoration in Puducherry"
            fill
            priority
            sizes="100vw"
            className="object-cover animate-zoom-slow"
          />
          {/* Emerald-dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#06261E]/85 via-[#0B4A3A]/75 to-[#06261E]/90" />
          {/* subtle gold pattern */}
          <div
            className="absolute inset-0 opacity-10 mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A24B' fill-opacity='0.6'%3E%3Ccircle cx='24' cy='24' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="relative page-container text-center py-28 md:py-36">
          {/* Eye-brow */}
          <p className="section-label text-[#C9A24B] animate-fade-up mb-5">
            {businessSettings?.tagline || "Puducherry's Premier Decoration Studio"}
          </p>

          {/* H1 */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.08] mb-6 animate-fade-up delay-100"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {activeSlide?.headline ? (
              activeSlide.headline
            ) : (
              <>
                We Decor
                <br />
                <span className="text-gradient-gold">Your Dreams</span>
              </>
            )}
          </h1>

          {/* Sub-copy */}
          <p className="text-[#FAF6EC]/85 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up delay-200">
            {activeSlide?.subheadline ||
              "Crafting unforgettable stage decorations for weddings, birthdays, surprise parties, and corporate events across Puducherry."}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
            <Link href="/gallery" className="btn-gold px-9 py-4 text-base">
              Browse Our Gallery
              <ArrowRight size={18} />
            </Link>
            <a
              href={`tel:${businessPhone}`}
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full border-2 border-white/40 text-white hover:border-[#C9A24B] hover:text-[#C9A24B] font-bold text-base tracking-wide transition-all duration-200"
            >
              <Phone size={18} />
              Call {businessPhone}
            </a>
          </div>

          {/* Quick stats bar (rendered only if proprietor filled them in) */}
          {dynamicStats.length > 0 && (
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden max-w-2xl mx-auto animate-fade-up delay-400">
              {dynamicStats.map((s) => (
                <div key={s.label} className="bg-[#06261E]/70 backdrop-blur-sm px-4 py-5 text-center">
                  <HeroCounter target={s.value} suffix={s.suffix} />
                  <p className="text-white/70 text-xs mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up delay-600" aria-hidden="true">
          <span className="text-white/50 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* ─────────────────── OCCASION TILES ─────────────────── */}
      <section className="py-24 bg-[#FAF6EC]" aria-labelledby="occasions-heading">
        <div className="page-container">
          <div className="text-center mb-14">
            <p className="section-label mb-3">What We Do</p>
            <h2 id="occasions-heading" className="section-title">Every Occasion, Perfectly Decorated</h2>
            <div className="gold-divider mx-auto mt-5" />
            <p className="section-subtitle mx-auto mt-5">
              From grand wedding stages to intimate celebrations, we bring your vision to life with precision and artistry.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {(activeCategories && activeCategories.length > 0 ? activeCategories : defaultOccasions).map(
              (cat: any, i: number) => {
                const title = cat.name || cat.label;
                const cover = cat.cover_url || cat.image || "/assets/120000.jpeg";
                const sub = cat.subtitle || "Stage decoration";
                return (
                  <Link
                    key={cat.id || i}
                    href={`/gallery?category=${cat.id}`}
                    className="group relative overflow-hidden rounded-2xl aspect-[3/4] block animate-fade-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <Image
                      src={cover}
                      alt={`${title} decoration in Puducherry by Sri Kubera`}
                      fill
                      sizes="(max-width:640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06261E]/90 via-[#06261E]/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">
                        {sub}
                      </p>
                      <h3
                        className="text-white text-xl font-bold"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {title}
                      </h3>
                      <div className="mt-3 flex items-center gap-1.5 text-[#C9A24B] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        View Designs <ArrowRight size={13} />
                      </div>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────── FEATURED DESIGNS ─────────────────── */}
      {publishedDesigns && publishedDesigns.length > 0 && (
        <section className="py-24 bg-white" aria-labelledby="featured-heading">
          <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="section-label mb-3">Our Portfolio</p>
                <h2 id="featured-heading" className="section-title">Featured Stage Designs</h2>
                <div className="gold-divider mt-5" />
                <p className="section-subtitle mt-5">
                  A glimpse into our recent work — each design is crafted with care, creativity, and meticulous attention to detail.
                </p>
              </div>
              <Link href="/gallery" className="btn-outline shrink-0">
                View All Designs
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedDesigns.map((design, i) => (
                <div
                  key={design.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <DesignCard design={design as any} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────── WHY US / ABOUT ─────────────────── */}
      <section className="py-24 bg-gradient-to-br from-[#0B4A3A] to-[#06261E]" aria-labelledby="whyus-heading">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <div>
              <p className="section-label text-[#C9A24B] mb-3">Our Promise</p>
              <h2
                id="whyus-heading"
                className="text-3xl md:text-4xl font-bold text-white mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Why Choose Sri Kubera Decor?
              </h2>
              <div className="gold-divider mb-8" />

              {aboutData?.text ? (
                <div className="text-white/80 text-base leading-relaxed mb-8 whitespace-pre-line">
                  {aboutData.text}
                </div>
              ) : (
                <ul className="space-y-4 mb-8">
                  {whyUsPoints.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-[#C9A24B] mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="text-white/85 text-base leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {aboutData?.proprietor && (
                <div className="border-t border-white/10 pt-4 mb-8">
                  <p className="text-[#C9A24B] text-xs font-semibold uppercase tracking-wider">Proprietor</p>
                  <p className="text-white text-base font-bold">{aboutData.proprietor}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <Link href="/gallery" className="btn-gold">
                  Browse Designs
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-white/30 text-white hover:border-[#C9A24B] hover:text-[#C9A24B] font-bold text-sm tracking-wide transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Dynamic Stats Grid or Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {dynamicStats.length > 0 ? (
                dynamicStats.map((s, i) => (
                  <div
                    key={s.label}
                    className="bg-white/10 border border-white/15 rounded-2xl p-7 text-center backdrop-blur-sm"
                  >
                    <p className="text-5xl font-bold text-[#C9A24B] leading-none mb-2" style={{ fontFamily: "var(--font-display)" }}>
                      {s.value}{s.suffix}
                    </p>
                    <p className="text-white/80 text-sm">{s.label}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white/10 border border-white/15 rounded-2xl p-7 text-center backdrop-blur-sm">
                    <p className="text-xl font-bold text-white mb-2">Puducherry Based</p>
                    <p className="text-white/70 text-xs">Local expertise &amp; dedicated on-time venue setup</p>
                  </div>
                  <div className="bg-white/10 border border-white/15 rounded-2xl p-7 text-center backdrop-blur-sm">
                    <p className="text-xl font-bold text-white mb-2">Custom Themes</p>
                    <p className="text-white/70 text-xs">Floral, modern drapes, and traditional stage decor</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── TESTIMONIALS (rendered only if published) ─────────────────── */}
      {publishedTestimonials && publishedTestimonials.length > 0 && (
        <section className="py-24 bg-[#FAF6EC]" aria-labelledby="testimonials-heading">
          <div className="page-container">
            <div className="text-center mb-14">
              <p className="section-label mb-3">Client Stories</p>
              <h2 id="testimonials-heading" className="section-title">Stories from Happy Families</h2>
              <div className="gold-divider mx-auto mt-5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {publishedTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="card p-8 relative rounded-2xl bg-white shadow-sm border border-[#C9A24B]/20"
                >
                  <Quote size={28} className="text-[#C9A24B]/50 mb-3" aria-hidden="true" />
                  {t.rating && (
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: t.rating }).map((_, si) => (
                        <Star key={si} size={14} className="text-[#C9A24B] fill-[#C9A24B]" aria-hidden="true" />
                      ))}
                    </div>
                  )}
                  <p className="text-[#1F2925] text-sm leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="border-t border-[#FAF6EC] pt-4">
                    <p className="font-semibold text-[#06261E] text-sm">{t.customer_name}</p>
                    {t.event_type && <p className="text-[#5D6D67] text-xs mt-0.5">{t.event_type}</p>}
                  </div>
                  <div className="absolute top-0 left-8 w-8 h-0.5 bg-[#C9A24B] rounded-full" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────── POST YOUR REQUIREMENT ─────────────────── */}
      <PostRequirementSection />

      {/* ─────────────────── CTA BANNER ─────────────────── */}
      <section className="py-24 bg-white" aria-labelledby="cta-heading">
        <div className="page-container text-center">
          <p className="section-label mb-4">Ready to Begin?</p>
          <h2 id="cta-heading" className="section-title mb-5">
            Create Something Truly Beautiful
          </h2>
          <div className="gold-divider mx-auto mb-7" />
          <p className="section-subtitle mx-auto mb-10">
            Browse our design catalogue, pick a design you love, and raise an enquiry — it takes less than a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/gallery" className="btn-gold px-10 py-4 text-base">
              Explore the Gallery
              <ArrowRight size={18} />
            </Link>
            <a
              href={`https://wa.me/${businessWa}?text=${encodeURIComponent("Hello, I would like to enquire about your decoration services.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-10 py-4 text-base"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
