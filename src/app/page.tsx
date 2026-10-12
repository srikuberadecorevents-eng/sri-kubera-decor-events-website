import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Phone,
  CheckCircle,
  Star,
  Quote,
  Sparkles,
  Award,
  Shield,
  MessageCircle,
  Clock,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { createPublicClient } from "@/lib/supabase/server";
import DesignCard from "@/components/ui/DesignCard";
import OccasionCard from "@/components/ui/OccasionCard";
import HeroSlideshow from "@/components/sections/HeroSlideshow";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { HeroSlide } from "@/types";
import { INITIAL_DESIGNS } from "@/data/initialDesigns";

import GatedGalleryLink from "@/components/ui/GatedGalleryLink";
import DynamicPostRequirement from "@/components/sections/DynamicPostRequirement";

export const revalidate = 60; // Cache with ISR; revalidated on admin actions

export const metadata: Metadata = {
  title: "Sri Kubera Decor & Events — We Decor Your Dreams",
  description:
    "Premium stage decorations for birthdays, marriages, baby showers, and special events in Puducherry. Contact us at 7373876879.",
};

const CATEGORY_META: Record<string, { subtitle: string; image: string }> = {
  Birthday: {
    subtitle: "Vibrant themed setups & celebrations",
    image: "/assets/birthday-01.jpeg",
  },
  Marriage: {
    subtitle: "Grand romantic & royal stages",
    image: "/assets/marriage-01.jpeg",
  },
  "Baby Shower": {
    subtitle: "Joyful & memorable family celebrations",
    image: "/assets/babyshower-01.jpeg",
  },
};

const CATEGORY_ORDER: Record<string, number> = {
  Birthday: 0,
  Marriage: 1,
  "Baby Shower": 2,
};

const defaultOccasions = [
  {
    id: "15f8dad9-3d1d-4c37-9b5b-cbf9bfbc1c94",
    name: "Birthday",
    subtitle: "Vibrant themed setups & celebrations",
    image: "/assets/birthday-01.jpeg",
  },
  {
    id: "492383f7-b261-4bf2-a0e4-5ad2e04159b0",
    name: "Marriage",
    subtitle: "Grand romantic & royal stages",
    image: "/assets/marriage-01.jpeg",
  },
  {
    id: "eada5ea5-9fc8-4e67-8f59-897dd86b2280",
    name: "Baby Shower",
    subtitle: "Joyful & memorable family celebrations",
    image: "/assets/babyshower-01.jpeg",
  },
];

export default async function HomePage() {
  const supabase = createPublicClient();

  let siteContentRows: any[] | null = null;
  let businessSettings: any = null;
  let publishedDesigns: any[] | null = null;
  let publishedTestimonials: any[] | null = null;
  let activeCategories: any[] | null = null;

  try {
    const results = await Promise.all([
      supabase.from("site_content").select("key, value"),
      supabase.from("business_settings").select("*").limit(1).maybeSingle(),
      supabase
        .from("designs")
        .select("id, title, image_url, category_id, is_featured, sort_order, categories(id, name)")
        .eq("status", "published")
        .is("deleted_at", null)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(16),
      supabase
        .from("testimonials")
        .select("id, customer_name, event_type, rating, quote, sort_order")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .limit(6),
      supabase
        .from("categories")
        .select("id, name, cover_url, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(4),
    ]);

    siteContentRows = results[0].data;
    businessSettings = results[1].data;
    publishedDesigns = results[2].data;
    publishedTestimonials = results[3].data;
    activeCategories = results[4].data;
  } catch (err) {
    console.warn("HomePage: Database fetch warning, using built-in fallbacks:", err);
  }

  const siteContent: Record<string, any> = {};
  if (siteContentRows) {
    for (const row of siteContentRows) {
      siteContent[row.key] = row.value;
    }
  }

  const heroSlides: HeroSlide[] = Array.isArray(siteContent.hero_slides)
    ? siteContent.hero_slides
    : [];

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
    dynamicStats.push({ value: statsData.happy_customers, suffix: "+", label: "Happy Families" });
  }

  const businessPhone = businessSettings?.phone || "7373876879";
  const businessWa = businessSettings?.whatsapp || "917373876879";

  // Curate 6 featured designs representing all categories (Birthday, Marriage, Baby Shower)
  const allDesigns =
    publishedDesigns && publishedDesigns.length > 0
      ? publishedDesigns
      : INITIAL_DESIGNS;

  const birthdayDesigns = allDesigns.filter(
    (d: any) => d.categories?.name === "Birthday"
  );
  const marriageDesigns = allDesigns.filter(
    (d: any) => d.categories?.name === "Marriage"
  );
  const babyShowerDesigns = allDesigns.filter(
    (d: any) => d.categories?.name === "Baby Shower"
  );

  const curatedFeatured: any[] = [
    ...birthdayDesigns.slice(0, 2),
    ...marriageDesigns.slice(0, 3),
    ...babyShowerDesigns.slice(0, 1),
  ];

  if (curatedFeatured.length < 6) {
    for (const d of allDesigns) {
      if (!curatedFeatured.some((c) => c.id === d.id)) {
        curatedFeatured.push(d);
        if (curatedFeatured.length >= 6) break;
      }
    }
  }

  const categoriesToDisplay =
    activeCategories && activeCategories.length > 0
      ? [...activeCategories].sort((a: any, b: any) => {
          const orderA = CATEGORY_ORDER[a.name] ?? 99;
          const orderB = CATEGORY_ORDER[b.name] ?? 99;
          return orderA - orderB;
        })
      : defaultOccasions;

  return (
    <>
      {/* ─────────────────── HERO WITH DYNAMIC IMAGE SLIDESHOW ─────────────────── */}
      <HeroSlideshow
        dbSlides={heroSlides}
        businessPhone={businessPhone}
        dynamicStats={dynamicStats}
        announcement={announcement}
      />

      {/* ─────────────────── OCCASION TILES ("WHAT WE DO") ─────────────────── */}
      <section
        className="py-12 md:py-16 bg-gradient-to-b from-[#FAF6EC] via-white to-[#FAF6EC] relative overflow-hidden"
        aria-labelledby="occasions-heading"
      >
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="page-container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="section-eyebrow text-bronze mb-3">
              <Sparkles size={13} className="text-bronze" />
              <span>What We Create</span>
            </div>
            <h2
              id="occasions-heading"
              className="section-heading-serif text-3xl sm:text-4xl"
            >
              Artistry For Every Sacred Celebration
            </h2>
            <div className="gold-divider mx-auto mt-4" />
            <p className="text-navy-700 text-sm sm:text-base leading-relaxed mt-4">
              From grand royal wedding mandapams to enchanting birthdays and baby shower setups, every design is customized to your venue and dreams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {categoriesToDisplay.map((cat: any, i: number) => {
              const title = cat.name || cat.label || "Decoration";
              const meta = CATEGORY_META[title] || {};
              const cover =
                cat.cover_url || cat.image || meta.image || "/assets/marriage-01.jpeg";
              const sub = cat.subtitle || meta.subtitle || "Stage decoration";
              return (
                <div
                  key={cat.id || i}
                  className="scroll-zoom group"
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <OccasionCard
                    id={cat.id || ""}
                    title={title}
                    subtitle={sub}
                    image={cover}
                    animationDelay={`${i * 0.1}s`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────── FEATURED DESIGNS PORTFOLIO ─────────────────── */}
      {curatedFeatured.length > 0 && (
        <section
          className="py-12 md:py-16 bg-white relative overflow-hidden"
          aria-labelledby="featured-heading"
        >
          <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <div className="section-eyebrow text-bronze mb-3">
                  <Star size={13} className="text-bronze" />
                  <span>Curated Portfolio</span>
                </div>
                <h2
                  id="featured-heading"
                  className="section-heading-serif text-3xl sm:text-4xl"
                >
                  Featured Stage Creations
                </h2>
                <div className="gold-divider mt-4" />
                <p className="text-navy-700 text-sm sm:text-base leading-relaxed mt-4">
                  A glimpse into our recent event stages — crafted with passion, floral precision, and grand architectural backdrops.
                </p>
              </div>

              <GatedGalleryLink
                href="/gallery"
                id="view-full-gallery-btn"
                className="btn-gold px-6 py-3 text-xs flex items-center gap-2 shrink-0 self-start md:self-auto"
              >
                <span>View Full Gallery</span>
                <ArrowRight size={15} />
              </GatedGalleryLink>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {curatedFeatured.map((design, i) => (
                <div
                  key={design.id}
                  className="scroll-zoom group"
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <DesignCard design={design as any} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────── WHY FAMILIES TRUST US ("THE KUBERA STANDARD") ─────────────────── */}
      <section
        className="py-12 md:py-16 lg:py-20 bg-[#FAF6EC] border-y border-[#E8E2D5] relative overflow-hidden"
        aria-labelledby="whyus-heading"
      >
        {/* Subtle Warm Ambient Radial Accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gold-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="page-container relative z-10">
          {/* Section Header: Editorial Serif Heading with Thin Gold Divider */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="section-eyebrow text-bronze mb-3">
              <Shield size={13} className="text-bronze" />
              <span>The Kubera Standard</span>
            </div>
            <h2
              id="whyus-heading"
              className="section-heading-serif text-3xl sm:text-4xl md:text-5xl mb-3"
            >
              Why Families Trust Us For Their Grandest Moments
            </h2>
            <div className="gold-divider mx-auto mb-4" />
            <p className="text-navy-700/80 text-sm sm:text-base leading-relaxed">
              Verifiable experience, strict timelines, and direct artisan accountability for every stage decoration across Puducherry.
            </p>
          </div>

          {/* 4 Concrete Proof Pillars (Stat and Icon Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* 1. Track Record */}
            <div className="scroll-zoom luxury-card p-6 sm:p-7 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-300/40 flex items-center justify-center text-bronze group-hover:scale-105 group-hover:bg-gold-100 transition-all shadow-xs">
                    <Award size={22} className="text-bronze" />
                  </div>
                  <span className="text-[10px] font-bold text-bronze uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold-50 border border-gold-200/60">
                    Track Record
                  </span>
                </div>
                <p
                  className="text-3xl sm:text-4xl font-bold text-navy-950 mb-1 group-hover:text-gold-700 transition-colors leading-none"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  <AnimatedCounter
                    value={statsData?.events_done && statsData.events_done > 0 ? statsData.events_done : 1500}
                    suffix="+"
                  />
                </p>
                <h3 className="text-sm sm:text-base font-bold text-navy-900 mb-2">
                  Stages Decorated
                </h3>
                <p className="text-navy-600 text-xs sm:text-[13px] leading-relaxed">
                  {aboutData?.years_in_business || statsData?.years || 12}+ years of continuous styling mastery across Puducherry mandapams, banquet halls, and private venues.
                </p>
              </div>
            </div>

            {/* 2. Punctuality Guarantee */}
            <div className="scroll-zoom luxury-card p-6 sm:p-7 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-300/40 flex items-center justify-center text-bronze group-hover:scale-105 group-hover:bg-gold-100 transition-all shadow-xs">
                    <Clock size={22} className="text-bronze" />
                  </div>
                  <span className="text-[10px] font-bold text-bronze uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold-50 border border-gold-200/60">
                    Punctuality
                  </span>
                </div>
                <p
                  className="text-3xl sm:text-4xl font-bold text-navy-950 mb-1 group-hover:text-gold-700 transition-colors leading-none"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  <AnimatedCounter value={100} suffix="%" />
                </p>
                <h3 className="text-sm sm:text-base font-bold text-navy-900 mb-2">
                  On-Time Handover
                </h3>
                <p className="text-navy-600 text-xs sm:text-[13px] leading-relaxed">
                  Stage structures, drapery, and calibrated LED lights are completed and inspected 2 hours before rituals and guests arrive.
                </p>
              </div>
            </div>

            {/* 3. Direct Supervision */}
            <div className="scroll-zoom luxury-card p-6 sm:p-7 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-300/40 flex items-center justify-center text-bronze group-hover:scale-105 group-hover:bg-gold-100 transition-all shadow-xs">
                    <ShieldCheck size={22} className="text-bronze" />
                  </div>
                  <span className="text-[10px] font-bold text-bronze uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold-50 border border-gold-200/60">
                    Accountability
                  </span>
                </div>
                <p
                  className="text-xl sm:text-2xl font-bold text-navy-950 mb-1 leading-tight group-hover:text-gold-700 transition-colors"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {aboutData?.proprietor || "Mr. S. Saravanan"}
                </p>
                <h3 className="text-sm sm:text-base font-bold text-navy-900 mb-2">
                  On-Site Supervision
                </h3>
                <p className="text-navy-600 text-xs sm:text-[13px] leading-relaxed">
                  Direct master craftsman oversight on every venue. You deal directly with our founder with zero third-party broker markups.
                </p>
              </div>
            </div>

            {/* 4. Upfront Pricing */}
            <div className="scroll-zoom luxury-card p-6 sm:p-7 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-300/40 flex items-center justify-center text-bronze group-hover:scale-105 group-hover:bg-gold-100 transition-all shadow-xs">
                    <FileCheck size={22} className="text-bronze" />
                  </div>
                  <span className="text-[10px] font-bold text-bronze uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold-50 border border-gold-200/60">
                    Transparency
                  </span>
                </div>
                <p
                  className="text-3xl sm:text-4xl font-bold text-navy-950 mb-1 group-hover:text-gold-700 transition-colors leading-none"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  Zero
                </p>
                <h3 className="text-sm sm:text-base font-bold text-navy-900 mb-2">
                  Hidden Surcharges
                </h3>
                <p className="text-navy-600 text-xs sm:text-[13px] leading-relaxed">
                  Transparent, all-inclusive quotations covering stage frames, fresh flowers, and lighting. The agreed price is all you pay.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Reassurance & Direct Action Bar */}
          <div className="luxury-card p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-gold-500 to-gold-300 flex items-center justify-center text-navy-950 font-bold text-sm shadow-md shrink-0">
                SK
              </div>
              <div>
                <p className="text-xs font-bold text-bronze uppercase tracking-widest leading-none">
                  Sri Kubera Decor &amp; Events
                </p>
                <p className="text-navy-950 text-sm sm:text-base font-bold mt-1">
                  Have a specific venue in mind? Talk directly with {aboutData?.proprietor || "Mr. Saravanan"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <GatedGalleryLink
                href="/gallery"
                id="browse-stages-btn"
                className="btn-gold px-5 py-2.5 text-xs text-center flex-1 sm:flex-none"
              >
                Browse Stages
              </GatedGalleryLink>
              <a
                href={`tel:${businessPhone}`}
                className="btn-outline px-5 py-2.5 text-xs text-center flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5"
              >
                <Phone size={13} />
                <span>Call {businessPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── CLIENT TESTIMONIALS ─────────────────── */}
      {publishedTestimonials && publishedTestimonials.length > 0 && (
        <section
          className="py-12 md:py-16 bg-white border-b border-[#E8E2D5] relative overflow-hidden"
          aria-labelledby="testimonials-heading"
        >
          <div className="page-container">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="section-eyebrow text-bronze mb-3">
                <Quote size={13} className="text-bronze" />
                <span>Client Experiences</span>
              </div>
              <h2
                id="testimonials-heading"
                className="section-heading-serif text-3xl sm:text-4xl"
              >
                Heartfelt Stories From Our Clients
              </h2>
              <div className="gold-divider mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {publishedTestimonials.map((t, idx) => (
                <div
                  key={t.id}
                  className="scroll-zoom luxury-card p-6 sm:p-7 relative flex flex-col justify-between"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div>
                    {t.rating && (
                      <div className="flex gap-1 mb-3">
                        {Array.from({ length: t.rating }).map((_, si) => (
                          <Star
                            key={si}
                            size={14}
                            className="text-gold-500 fill-gold-500"
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-navy-800 text-sm leading-relaxed mb-6 italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-ivory-200 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-900 to-emerald-950 text-gold-300 flex items-center justify-center font-bold text-xs ring-1 ring-gold-400/30 shrink-0">
                      {t.customer_name?.charAt(0) || "C"}
                    </div>
                    <div>
                      <p className="font-bold text-navy-950 text-sm leading-none">
                        {t.customer_name}
                      </p>
                      {t.event_type && (
                        <p className="text-navy-500 text-xs mt-1">{t.event_type}</p>
                      )}
                    </div>
                  </div>
                  <div
                    className="absolute top-0 left-8 w-10 h-1 bg-gradient-to-r from-gold-500 to-gold-300 rounded-full"
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────── POST REQUIREMENT FORM ─────────────────── */}
      <DynamicPostRequirement />

      {/* ─────────────────── REGAL BOTTOM CTA BANNER ─────────────────── */}
      <section className="py-12 md:py-16 bg-white relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="page-container">
          <div className="scroll-zoom relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#06261E] via-[#0B4A3A] to-[#0C1A2E] border border-gold-400/35 p-8 sm:p-14 text-center text-white shadow-2xl">
            {/* Ambient Radial Spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-gold-400/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-gold-400/40 text-gold-300 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">
                <Sparkles size={13} className="text-gold-400" />
                <span>Begin Your Journey</span>
              </div>

              <h2
                id="cta-heading"
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Let&apos;s Create Something Truly Unforgettable
              </h2>
              <div className="w-16 h-1 rounded-full bg-gradient-to-r from-gold-400 to-transparent mx-auto mb-5" />

              <p className="text-ivory-100/90 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto">
                Explore our stage catalogue, select your desired style, or share your custom Pinterest inspiration for an instant quotation.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <GatedGalleryLink
                  href="/gallery"
                  className="relative group overflow-hidden px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-navy-950 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 shadow-[0_4px_18px_rgba(201,162,75,0.35)] hover:shadow-[0_6px_25px_rgba(201,162,75,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <span>Explore The Gallery</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  <span className="absolute inset-0 w-full h-full bg-white/25 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                </GatedGalleryLink>

                <a
                  href={`https://wa.me/${businessWa}?text=${encodeURIComponent("Hello Sri Kubera Decor, I would like to enquire about your stage decoration services.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-emerald-600/90 hover:bg-emerald-600 border border-emerald-400/40 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg w-full sm:w-auto"
                >
                  <MessageCircle size={16} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

