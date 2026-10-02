import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  Gift,
  Star,
  Briefcase,
  Phone,
  CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DesignCard from "@/components/ui/DesignCard";
import PostRequirementCard from "@/components/ui/PostRequirementCard";

export const metadata: Metadata = {
  title: "Sri Kubera Decor & Events — We Decor Your Dreams",
  description:
    "Elegant stage decorations for weddings, birthdays, surprise parties, and corporate events in Puducherry. Contact us at 7373876879.",
};

const serviceHighlights = [
  {
    icon: Heart,
    title: "Wedding Decoration",
    desc: "Timeless, romantic wedding stage designs crafted to your vision.",
  },
  {
    icon: Gift,
    title: "Birthday Decoration",
    desc: "Vibrant, themed setups that make every birthday unforgettable.",
  },
  {
    icon: Star,
    title: "Surprise Parties",
    desc: "Thoughtfully planned surprise setups that wow your loved ones.",
  },
  {
    icon: Briefcase,
    title: "Corporate Events",
    desc: "Professional, polished decoration for your brand and team.",
  },
];

const whyUs = [
  "10+ years of decoration experience in Puducherry",
  "Fresh flowers, lights, and premium materials in every package",
  "On-site team ensures flawless setup on your event day",
  "Custom designs tailored to your budget and taste",
  "Transparent pricing with no hidden charges",
];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredDesigns } = await supabase
    .from("designs")
    .select("*, categories(id, name, created_at)")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-navy-900">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-hero-pattern opacity-60" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A227' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative page-container py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Brand Message & CTA */}
            <div className="lg:col-span-7 text-center lg:text-left animate-slide-up">
              <p className="text-gold-400 text-sm md:text-base font-sans tracking-[0.25em] uppercase mb-4">
                Puducherry&apos;s Trusted Decoration Studio
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight mb-6">
                We Decor<br />
                <span className="text-gradient-gold">Your Dreams</span>
              </h1>
              <p className="text-cream-200 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
                Sri Kubera Decor &amp; Events — crafting magical atmospheres for
                weddings, birthdays, surprise parties, and corporate celebrations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/gallery" className="btn-primary px-8 py-3.5 text-base">
                  Browse Our Gallery
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="tel:7373876879"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border-2 border-cream-300/50 text-cream-200 hover:border-gold-400 hover:text-gold-400 font-semibold text-base transition-all duration-200"
                >
                  <Phone size={18} />
                  Call Us Now
                </a>
              </div>
            </div>

            {/* Right Column: Post Your Requirement Form */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <PostRequirementCard />
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 0V60H0Z" fill="#F9F5EC" />
          </svg>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 bg-cream-100">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">What We Offer</h2>
            <div className="gold-divider mx-auto mt-4" />
            <p className="section-subtitle mx-auto mt-4">
              From grand wedding stages to intimate birthday celebrations, we
              bring your vision to life with precision and artistry.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceHighlights.map((s) => (
              <div key={s.title} className="card p-6 text-center group hover:shadow-card-hover transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-100 transition-colors">
                  <s.icon size={26} className="text-gold-600" />
                </div>
                <h3 className="font-serif font-semibold text-navy-900 text-lg mb-2">{s.title}</h3>
                <p className="text-navy-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED DESIGNS */}
      {featuredDesigns && featuredDesigns.length > 0 && (
        <section className="py-20 bg-white">
          <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="section-title">Featured Designs</h2>
                <div className="gold-divider mt-4" />
                <p className="section-subtitle mt-4">
                  A glimpse into our recent work — each design is crafted with
                  care and creativity.
                </p>
              </div>
              <Link href="/gallery" className="btn-outline shrink-0">
                View All Designs
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDesigns.map((design) => (
                <DesignCard key={design.id} design={design as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY US */}
      <section className="py-20 bg-navy-900">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                Why Choose Sri Kubera?
              </h2>
              <div className="gold-divider mb-6" />
              <ul className="space-y-4">
                {whyUs.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-gold-400 mt-0.5 shrink-0" />
                    <span className="text-cream-200 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-4 mt-8">
                <Link href="/gallery" className="btn-primary">
                  Browse Designs
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-cream-300/50 text-cream-200 hover:border-gold-400 hover:text-gold-400 font-semibold text-sm transition-all">
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-navy-800 rounded-2xl p-6 text-center">
                <p className="text-4xl font-serif font-bold text-gold-400">500+</p>
                <p className="text-cream-300 text-sm mt-1">Events Decorated</p>
              </div>
              <div className="bg-navy-800 rounded-2xl p-6 text-center">
                <p className="text-4xl font-serif font-bold text-gold-400">10+</p>
                <p className="text-cream-300 text-sm mt-1">Years Experience</p>
              </div>
              <div className="bg-navy-800 rounded-2xl p-6 text-center">
                <p className="text-4xl font-serif font-bold text-gold-400">6</p>
                <p className="text-cream-300 text-sm mt-1">Service Categories</p>
              </div>
              <div className="bg-navy-800 rounded-2xl p-6 text-center">
                <p className="text-4xl font-serif font-bold text-gold-400">100%</p>
                <p className="text-cream-300 text-sm mt-1">Client Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cream-100">
        <div className="page-container text-center">
          <h2 className="section-title mb-4">Ready to Create Something Beautiful?</h2>
          <div className="gold-divider mx-auto mb-6" />
          <p className="section-subtitle mx-auto mb-8">
            Browse our design catalogue, pick a design you love, and raise an
            enquiry — it takes less than a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/gallery" className="btn-primary px-8 py-4 text-base">
              Explore the Gallery
              <ArrowRight size={18} />
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879"}?text=${encodeURIComponent("Hello, I would like to enquire about your decoration services.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-8 py-4 text-base"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
