import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Phone,
  CheckCircle,
  Star,
  Quote,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DesignCard from "@/components/ui/DesignCard";
import HeroCounter from "@/components/ui/HeroCounter";
import PostRequirementSection from "@/components/sections/PostRequirementSection";
import { INITIAL_DESIGNS } from "@/data/initialDesigns";

export const metadata: Metadata = {
  title: "Sri Kubera Decor & Events — We Decor Your Dreams",
  description:
    "Premium stage decorations for weddings, birthdays, surprise parties, and corporate events in Puducherry. Contact us at 7373876879.",
};

const occasionCategories = [
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
    subtitle: "Magical revelations",
    image: "/assets/35000.jpeg",
    href: "/gallery",
  },
  {
    id: "corporate",
    label: "Corporate",
    subtitle: "Professional polish",
    image: "/assets/85000.jpeg",
    href: "/gallery",
  },
];

const whyUs = [
  "10+ years of decoration expertise in Puducherry",
  "Fresh flowers, premium lights & hand-picked materials every time",
  "On-site setup team ensures a flawless event day, every time",
  "Fully custom designs tailored to your vision and budget",
  "Transparent, all-inclusive pricing — no hidden charges",
];

const testimonials = [
  {
    name: "Priya Rajan",
    event: "Wedding, March 2025",
    rating: 5,
    text: "Sri Kubera made our wedding stage look absolutely regal. Every flower, every light was placed with such care. Our guests couldn't stop complimenting the décor.",
  },
  {
    name: "Arjun Sivakumar",
    event: "Birthday Party, August 2025",
    rating: 5,
    text: "Booked them for my daughter's first birthday. The balloon arch and floral backdrop were stunning. They arrived early and set up everything flawlessly.",
  },
  {
    name: "Kavitha Nair",
    event: "Corporate Event, January 2025",
    rating: 5,
    text: "Very professional team. They understood our brand colours and delivered a stage setup that impressed all our clients and team members. Highly recommended.",
  },
];

const stats = [
  { value: 500, suffix: "+", label: "Events Decorated" },
  { value: 10, suffix: "+", label: "Years of Experience" },
  { value: 6, suffix: "", label: "Service Categories" },
  { value: 100, suffix: "%", label: "Client Satisfaction" },
];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredDesigns } = await supabase
    .from("designs")
    .select("*, categories(id, name, created_at)")
    .order("created_at", { ascending: false })
    .limit(6);

  const displayDesigns =
    featuredDesigns && featuredDesigns.length > 0
      ? featuredDesigns
      : INITIAL_DESIGNS.slice(0, 6);

  return (
    <>
      {/* ─────────────────── HERO ─────────────────── */}
      <section
        className="relative min-h-[94svh] flex items-center justify-center overflow-hidden"
        aria-label="Hero"
      >
        {/* Background photo with slow zoom */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/assets/120000.jpeg"
            alt="Elegant wedding stage decoration by Sri Kubera Decor & Events in Puducherry"
            fill
            priority
            sizes="100vw"
            className="object-cover animate-zoom-slow"
          />
          {/* Navy overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-900/72 to-navy-950/85" />
          {/* subtle pattern */}
          <div
            className="absolute inset-0 opacity-10 mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A227' fill-opacity='0.6'%3E%3Ccircle cx='24' cy='24' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="relative page-container text-center py-28 md:py-36">
          {/* Eye-brow */}
          <p className="section-label text-gold-400 animate-fade-up mb-5">
            Puducherry&apos;s Trusted Decoration Studio
          </p>

          {/* H1 */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.08] mb-6 animate-fade-up delay-100"
            style={{ fontFamily: "var(--font-display)" }}
          >
            We Decor
            <br />
            <span className="text-gradient-gold">Your Dreams</span>
          </h1>

          {/* Sub-copy */}
          <p className="text-ivory-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up delay-200">
            Sri Kubera Decor &amp; Events — crafting magical atmospheres for
            weddings, birthdays, surprise parties, and corporate celebrations
            across Puducherry.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
            <Link href="/gallery" className="btn-gold px-9 py-4 text-base">
              Browse Our Gallery
              <ArrowRight size={18} />
            </Link>
            <a
              href="tel:7373876879"
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full border-2 border-ivory-400/50 text-ivory-100 hover:border-gold-400 hover:text-gold-400 font-bold text-base tracking-wide transition-all duration-200"
            >
              <Phone size={18} />
              Call Now
            </a>
          </div>

          {/* Quick stats bar */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden max-w-2xl mx-auto animate-fade-up delay-400">
            {stats.map((s) => (
              <div key={s.label} className="bg-navy-900/60 backdrop-blur-sm px-4 py-5 text-center">
                <HeroCounter target={s.value} suffix={s.suffix} />
                <p className="text-ivory-400 text-xs mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up delay-600" aria-hidden="true">
          <span className="text-ivory-400 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-ivory-400 to-transparent" />
        </div>
      </section>

      {/* ─────────────────── OCCASION TILES ─────────────────── */}
      <section className="py-24 bg-ivory-100" aria-labelledby="occasions-heading">
        <div className="page-container">
          <div className="text-center mb-14">
            <p className="section-label mb-3">What We Do</p>
            <h2 id="occasions-heading" className="section-title">Every Occasion, Perfectly Decorated</h2>
            <div className="gold-divider mx-auto mt-5" />
            <p className="section-subtitle mx-auto mt-5">
              From grand wedding stages to intimate birthday celebrations, we
              bring your vision to life with precision and artistry.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {occasionCategories.map((cat, i) => (
              <Link
                key={cat.id}
                href={cat.href}
                className={`group relative overflow-hidden rounded-2xl aspect-[3/4] block animate-fade-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Image
                  src={cat.image}
                  alt={`${cat.label} decoration in Puducherry by Sri Kubera`}
                  fill
                  sizes="(max-width:640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-900/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-ivory-400 text-xs font-semibold tracking-widest uppercase mb-1">
                    {cat.subtitle}
                  </p>
                  <h3
                    className="text-white text-xl font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {cat.label}
                  </h3>
                  <div className="mt-3 flex items-center gap-1.5 text-gold-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Designs <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── FEATURED DESIGNS ─────────────────── */}
      {displayDesigns && displayDesigns.length > 0 && (
        <section className="py-24 bg-white" aria-labelledby="featured-heading">
          <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="section-label mb-3">Our Portfolio</p>
                <h2 id="featured-heading" className="section-title">Featured Designs</h2>
                <div className="gold-divider mt-5" />
                <p className="section-subtitle mt-5">
                  A glimpse into our recent work — each design is crafted with
                  care, creativity, and meticulous attention to detail.
                </p>
              </div>
              <Link href="/gallery" className="btn-outline shrink-0">
                View All Designs
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayDesigns.map((design, i) => (
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

      {/* ─────────────────── WHY US + STATS ─────────────────── */}
      <section className="py-24 bg-navy-gradient" aria-labelledby="whyus-heading">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <div>
              <p className="section-label text-gold-400 mb-3">Our Promise</p>
              <h2
                id="whyus-heading"
                className="text-3xl md:text-4xl font-bold text-white mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Why Choose Sri Kubera?
              </h2>
              <div className="gold-divider mb-8" />
              <ul className="space-y-4 mb-10">
                {whyUs.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                    <CheckCircle size={20} className="text-gold-400 mt-0.5 shrink-0" aria-hidden="true" />
                    <span className="text-ivory-300 text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link href="/gallery" className="btn-gold">
                  Browse Designs
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-ivory-400/40 text-ivory-200 hover:border-gold-400 hover:text-gold-400 font-bold text-sm tracking-wide transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-5">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="bg-navy-800/60 border border-white/10 rounded-2xl p-7 text-center animate-fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <p className="text-5xl font-bold text-gold-400 leading-none mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {s.value}{s.suffix}
                  </p>
                  <p className="text-ivory-400 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── TESTIMONIALS ─────────────────── */}
      <section className="py-24 bg-ivory-100" aria-labelledby="testimonials-heading">
        <div className="page-container">
          <div className="text-center mb-14">
            <p className="section-label mb-3">What Clients Say</p>
            <h2 id="testimonials-heading" className="section-title">Stories from Happy Families</h2>
            <div className="gold-divider mx-auto mt-5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="card p-8 relative animate-fade-up"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {/* Quote icon */}
                <Quote
                  size={32}
                  className="text-gold-200 mb-4"
                  aria-hidden="true"
                />
                {/* Stars */}
                <div className="flex gap-1 mb-4" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} size={14} className="text-gold-500 fill-gold-500" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-navy-700 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="border-t border-ivory-200 pt-4">
                  <p className="font-semibold text-navy-900 text-sm">{t.name}</p>
                  <p className="text-navy-400 text-xs mt-0.5">{t.event}</p>
                </div>
                {/* Gold accent */}
                <div className="absolute top-0 left-8 w-8 h-0.5 bg-gold-400 rounded-full" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

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
            Browse our design catalogue, pick a design you love, and raise an
            enquiry — it takes less than a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/gallery" className="btn-gold px-10 py-4 text-base">
              Explore the Gallery
              <ArrowRight size={18} />
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879"}?text=${encodeURIComponent("Hello, I would like to enquire about your decoration services.")}`}
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
