"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Phone,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Megaphone,
} from "lucide-react";
import Image from "next/image";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import HeroCounter from "@/components/ui/HeroCounter";
import GatedGalleryLink from "@/components/ui/GatedGalleryLink";
import type { HeroSlide } from "@/types";

export interface HeroSlideItem {
  id: string;
  image: string;
  tagline: string;
  headline: string;
  headlineHighlight?: string;
  subheadline: string;
  category: string;
}

const DEFAULT_SLIDES: HeroSlideItem[] = [
  {
    id: "slide-1",
    image: "/assets/marriage-01.jpeg",
    tagline: "Premier Stage Decoration Studio",
    headline: "We Decor",
    headlineHighlight: "Your Dreams",
    subheadline:
      "Crafting royal wedding stages, bespoke floral backdrops, and unforgettable celebration spaces with flawless elegance.",
    category: "Royal Wedding Stages",
  },
  {
    id: "slide-2",
    image: "/assets/marriage-16.jpeg",
    tagline: "Grand Floral Archways & Drapes",
    headline: "Regal Elegance for",
    headlineHighlight: "Your Big Day",
    subheadline:
      "Step into luxury with customized ambient lighting, fresh exotic blooms, and grand structural backdrops designed to mesmerize.",
    category: "Luxury Reception Stages",
  },
  {
    id: "slide-3",
    image: "/assets/birthday-07.jpeg",
    tagline: "Joyful Family Celebrations",
    headline: "Magical Themes for",
    headlineHighlight: "Unforgettable Birthdays",
    subheadline:
      "From enchanted fairy-tale setups to vibrant modern balloon arches, we build custom dreamscapes for every milestone.",
    category: "Themed Birthday Decors",
  },
  {
    id: "slide-4",
    image: "/assets/marriage-08.jpeg",
    tagline: "Prestige Hall & Lawn Transformations",
    headline: "Timeless Romance,",
    headlineHighlight: "Bespoke Artistry",
    subheadline:
      "Transforming convention halls and banquet venues into breathtaking palaces of celebration with meticulous attention to detail.",
    category: "Heritage Mandapams",
  },
  {
    id: "slide-5",
    image: "/assets/babyshower-01.jpeg",
    tagline: "Traditional & Contemporary Joy",
    headline: "Heartfelt Celebrations for",
    headlineHighlight: "Baby Showers",
    subheadline:
      "Elegant cradle floral decors, festive drapes, and traditional welcome backdrops crafted with devotion and grace.",
    category: "Baby Shower Setups",
  },
];

interface HeroSlideshowProps {
  dbSlides?: HeroSlide[];
  businessPhone: string;
  dynamicStats: { value: number; suffix: string; label: string }[];
  announcement?: { text?: string; is_active?: boolean };
}

export default function HeroSlideshow({
  dbSlides,
  businessPhone,
  dynamicStats,
  announcement,
}: HeroSlideshowProps) {
  // Merge database slides if available, otherwise use curated luxury slides
  const slides: HeroSlideItem[] =
    dbSlides && dbSlides.length > 0
      ? dbSlides.map((ds, idx) => ({
          id: `db-slide-${idx}`,
          image:
            ds.image_url &&
            !ds.image_url.includes("120000.jpeg") &&
            !ds.image_url.includes("25000.jpeg")
              ? ds.image_url
              : DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].image,
          tagline: DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].tagline,
          headline: ds.headline || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].headline,
          headlineHighlight: DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].headlineHighlight,
          subheadline:
            ds.subheadline || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].subheadline,
          category: DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].category,
        }))
      : DEFAULT_SLIDES;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mountBackgroundSlides, setMountBackgroundSlides] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    const bgTimer = setTimeout(() => {
      setMountBackgroundSlides(true);
    }, 6500);
    return () => clearTimeout(bgTimer);
  }, []);

  const nextSlide = useCallback(() => {
    setMountBackgroundSlides(true);
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setMountBackgroundSlides(true);
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance slideshow
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(nextSlide, 5200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused]);

  const current = slides[activeIndex];

  return (
    <>
      {/* Optional Top Announcement Strip */}
      {announcement?.is_active && announcement?.text && (
        <div className="bg-[#0B4A3A] text-ivory-100 px-4 py-2.5 text-center text-xs sm:text-sm font-semibold border-b border-gold-500/30 flex items-center justify-center gap-2 relative z-20">
          <Megaphone size={15} className="text-gold-400 shrink-0 animate-pulse" />
          <span>{announcement.text}</span>
        </div>
      )}

      {/* Main Hero Section */}
      <section
        className="relative min-h-[92svh] flex items-center justify-center overflow-hidden bg-navy-950"
        aria-label="Hero Stage Decoration Showcase"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Dynamic Stacked Background Slides (Crossfade + Ken Burns) */}
        <div className="absolute inset-0 overflow-hidden">
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            // Pre-mount only the active slide; load background slides lazily after initial page render settles
            if (idx !== activeIndex && !mountBackgroundSlides) return null;

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 ${
                  mounted && idx !== 0 ? "transition-opacity duration-1000 ease-in-out" : ""
                } ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
                aria-hidden={!isActive}
              >
                <div
                  className={`relative w-full h-full ${
                    mounted ? "md:transition-transform md:duration-[7000ms] md:ease-out" : ""
                  } ${
                    isActive ? "md:scale-105" : "scale-100"
                  }`}
                >
                  {idx === 0 ? (
                    <Image
                      src={slide.image}
                      alt={`${slide.category} — Sri Kubera Decor & Events`}
                      fill
                      priority
                      fetchPriority="high"
                      sizes="(max-width: 768px) 100vw, 100vw"
                      className="object-cover object-center"
                    />
                  ) : (
                    <ResponsiveImage
                      src={slide.image}
                      alt={`${slide.category} — Sri Kubera Decor & Events`}
                      fill
                      priority={false}
                      sizes="(max-width: 768px) 100vw, 100vw"
                      className="object-cover object-center"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Deep Luxury Emerald & Navy Vignette Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#06261E]/80 via-[#06261E]/70 to-[#06261E]/95 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06261E]/85 via-transparent to-[#06261E]/85 z-10 pointer-events-none" />

          {/* Subtle Golden Micro-Stars Grid Pattern (hidden on mobile for performance) */}
          <div
            className="hidden sm:block absolute inset-0 opacity-15 mix-blend-soft-light z-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A24B' fill-opacity='0.5'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />

          {/* Ambient Gold Radial Glow Orbs (hidden on mobile for performance) */}
          <div className="hidden sm:block absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/15 rounded-full blur-[120px] pointer-events-none z-10 animate-glow-pulse" />
        </div>

        {/* Content Container */}
        <div className="relative page-container text-center py-14 sm:py-20 z-20">
          {/* Eyebrow Pill Badge with Category & Shimmer */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-gold-400/40 shadow-lg mb-5 animate-fade-up">
            <Sparkles size={14} className="text-gold-400 animate-pulse shrink-0" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">
              {current.category}
            </span>
          </div>

          {/* Main H1 Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-5 tracking-tight animate-fade-up max-w-5xl mx-auto"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {current.headline}{" "}
            {current.headlineHighlight && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-100 to-gold-400 drop-shadow-[0_2px_12px_rgba(201,162,75,0.4)] block sm:inline">
                {current.headlineHighlight}
              </span>
            )}
          </h1>

          {/* Subtitle Description */}
          <p className="text-ivory-100/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8 font-normal animate-fade-up">
            {current.subheadline}
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10 animate-fade-up">
            {/* Primary Shimmering Button */}
            <GatedGalleryLink
              href="/gallery"
              id="hero-explore-designs-btn"
              className="relative group overflow-hidden px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-navy-950 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 shadow-[0_4px_20px_rgba(201,162,75,0.35)] hover:shadow-[0_6px_28px_rgba(201,162,75,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 w-full sm:w-auto justify-center"
            >
              <span>Explore All Designs</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
              <span className="absolute inset-0 w-full h-full bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
            </GatedGalleryLink>

            {/* Direct Call Consultation Button */}
            <a
              href={`tel:${businessPhone}`}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 hover:border-gold-400 text-white hover:text-gold-300 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-md w-full sm:w-auto"
            >
              <Phone size={15} className="text-gold-400" />
              <span>Call Direct: {businessPhone}</span>
            </a>
          </div>

          {/* Dynamic Stats Grid (Real metrics) */}
          {dynamicStats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto animate-fade-up">
              {dynamicStats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-gold-400/50 rounded-2xl p-4 text-center transition-all shadow-lg"
                >
                  <p
                    className="text-2xl sm:text-3xl font-bold text-gold-300 leading-none mb-1 drop-shadow-sm"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    <HeroCounter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-ivory-200 text-xs font-medium tracking-wide">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Carousel Previous & Next Side Controls (Desktop) */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-navy-950/40 hover:bg-gold-500/80 backdrop-blur-md text-white hover:text-navy-950 border border-white/20 hover:border-gold-400 transition-all duration-200 shadow-xl"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-navy-950/40 hover:bg-gold-500/80 backdrop-blur-md text-white hover:text-navy-950 border border-white/20 hover:border-gold-400 transition-all duration-200 shadow-xl"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Bottom Slide Indicator Pills */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1">
          {slides.map((s, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setMountBackgroundSlides(true);
                  setActiveIndex(idx);
                }}
                className="p-2 flex items-center justify-center min-w-[28px] min-h-[28px] focus:outline-none"
                aria-label={`Go to slide ${idx + 1}: ${s.category}`}
              >
                <span
                  className={`block transition-all duration-300 rounded-full ${
                    isActive
                      ? "w-8 sm:w-10 h-2 bg-gradient-to-r from-gold-400 to-gold-200 shadow-[0_0_8px_#C9A24B]"
                      : "w-2.5 h-2.5 bg-white/40 hover:bg-white/80"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
