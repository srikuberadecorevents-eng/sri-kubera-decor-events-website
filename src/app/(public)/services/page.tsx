import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Heart,
  Gift,
  Star,
  Briefcase,
  Camera,
  ArrowRight,
  Phone,
  MessageCircle,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  Flame,
  ShieldCheck,
} from "lucide-react";
import ResponsiveImage from "@/components/ui/ResponsiveImage";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Decoration Services | Sri Kubera Decor & Events Puducherry",
  description:
    "Explore bespoke decoration services by Sri Kubera Decor in Puducherry: Grand wedding mandapams, themed birthday stages, baby shower ceremonies, surprise events, and corporate stages. Contact Saravanan at 7373876879.",
};

const WA_NUMBER = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";

const SIGNATURE_SERVICES = [
  {
    id: "weddings",
    title: "Wedding Stage & Mandapam Decoration",
    tagline: "Royal, Romantic & Traditional South Indian Mandapams",
    category: "Weddings & Receptions",
    image: "/assets/marriage-01.jpeg",
    description:
      "Transforming wedding halls into majestic celebration spaces. From royal gold-carved mandapam pillars and fresh floral canopies to modern LED lighting washes and designer seating.",
    highlights: [
      "Grade-A fresh roses, orchids, jasmine and marigolds",
      "Traditional brass lamps, entrance thoranams and walkway floral runners",
      "Ambient warm LED wash, spotlighting and fairy light tunnels",
      "Designer bride-groom sofa sets and backdrop framing",
    ],
    gallerySlug: "Marriage",
    icon: Heart,
    accent: "from-amber-500/20 to-emerald-800/10",
  },
  {
    id: "birthdays",
    title: "Themed Birthday Stages & Milestone Parties",
    tagline: "Vibrant Themes, Balloon Artistry & Glowing Neon Accents",
    category: "Birthdays & Milestones",
    image: "/assets/birthday-01.jpeg",
    description:
      "Captivating stage setups for 1st birthdays, teenage milestones, and grand adult celebrations. Featuring organic balloon garlands, 3D character cutouts, personalized neon signboards, and elegant cake table styling.",
    highlights: [
      "Custom theme selection (Jungle, Fairytale, Space, Royal Gold, Floral Pastel)",
      "Multi-layered circular, arch and geometric stage backdrops",
      "Color-coordinated organic balloon garlands & LED neon signage",
      "Dedicated themed cake cutting pedestal with stage uplighting",
    ],
    gallerySlug: "Birthday",
    icon: Gift,
    accent: "from-purple-500/20 to-emerald-800/10",
  },
  {
    id: "babyshower",
    title: "Baby Shower & Seemantham Ceremonies",
    tagline: "Cherished Family Traditions with Floral Grace",
    category: "Traditional Celebrations",
    image: "/assets/babyshower-01.jpeg",
    description:
      "Honoring mother and baby with traditional cultural aesthetics and delicate pastel decor. Features hand-decorated wooden oonjal (swings), fragrant floral garlands, and serene lighting.",
    highlights: [
      "Decorated traditional floral swings (oonjal) with hanging marigold & tuberoses",
      "Pastel silk drape backdrops with golden border embellishments",
      "Pooja area thoranam, brass kuthuvilakku lighting, and floral rangolis",
      "Photo-ready family seating with personalized name banners",
    ],
    gallerySlug: "Baby Shower",
    icon: Star,
    accent: "from-pink-500/20 to-emerald-800/10",
  },
  {
    id: "receptions",
    title: "Grand Receptions & Evening Galas",
    tagline: "Contemporary Glamour with Dazzling Light Ensembles",
    category: "Evening Functions",
    image: "/assets/marriage-08.jpeg",
    description:
      "Sophisticated evening stages combining crystal chandeliers, architectural backdrops, mirror-finish pedestals, and dynamic LED lighting for memorable guest welcomes.",
    highlights: [
      "Architectural panels with metallic and gold leaf finishes",
      "Suspended crystal chandeliers and dynamic warm white wash",
      "Lush cascading floral walls and modern geometric framing",
      "Grand entry walkway styling with candle racks and red carpets",
    ],
    gallerySlug: "Marriage",
    icon: Sparkles,
    accent: "from-emerald-500/20 to-navy-900/10",
  },
  {
    id: "entrances",
    title: "Entrance Arches, Candle Walls & Photo Booths",
    tagline: "First Impressions That Welcome Guests With Grandeur",
    category: "Special Installations",
    image: "/assets/WhatsApp Image 2026-09-30 at 10.29.41 AM.jpeg",
    description:
      "Immersive entryway structures that establish the festive mood before guests even step inside the hall. Includes custom welcome easels, floral framing, candle walls, and interactive photo corners.",
    highlights: [
      "Handcrafted candle-rack walls with ambient votive lighting",
      "Dramatic fabric draping in royal emerald, gold and crimson red",
      "Custom laser-cut welcome easel signs with couple/birthday names",
      "Selfie and photography frames with dedicated studio spotlights",
    ],
    gallerySlug: "all",
    icon: Camera,
    accent: "from-rose-500/20 to-emerald-800/10",
  },
  {
    id: "corporate",
    title: "Corporate Events & Cultural Auditoriums",
    tagline: "Polished Professionalism for Convocations & Meets",
    category: "Corporate & Formal",
    image: "/assets/marriage-16.jpeg",
    description:
      "Structured stage framing for annual general meetings, product launches, corporate banquets, and educational ceremonies across Puducherry.",
    highlights: [
      "Firm banner truss framing and branded backdrop backlighting",
      "Podium floral styling and VIP seating arrangements",
      "Acoustic and lighting coordination for smooth presentations",
      "Fast, punctual setup adhering to strict corporate event timelines",
    ],
    gallerySlug: "all",
    icon: Briefcase,
    accent: "from-blue-500/20 to-navy-900/10",
  },
];

const EXECUTION_STEPS = [
  {
    step: "01",
    title: "Theme Consultation",
    desc: "Share your event date, hall location, and preferences. We suggest curated stage concepts aligned with your budget.",
  },
  {
    step: "02",
    title: "Custom Stage Design",
    desc: "We finalize color palettes, flower combinations, backdrop dimensions, and lighting requirements tailored to the venue.",
  },
  {
    step: "03",
    title: "Punctual Setup",
    desc: "Our seasoned crew arrives hours in advance, completing every drape, bloom, and light well before your first guest arrives.",
  },
  {
    step: "04",
    title: "Post-Event Teardown",
    desc: "Celebrate worry-free. Once the event concludes, our crew handles complete packup and teardown without burdening you.",
  },
];

const QUALITY_PILLARS = [
  {
    icon: Award,
    title: "10+ Years Proven Craft",
    desc: "Over a decade of trusted service across wedding halls and venues in Puducherry.",
  },
  {
    icon: Flame,
    title: "Fresh Grade-A Flowers",
    desc: "Direct daily procurement of vibrant roses, marigolds, jasmine, and exotic blooms.",
  },
  {
    icon: Clock,
    title: "Punctual Delivery Guarantee",
    desc: "Stage setup completed with hours to spare for your final photo checks.",
  },
  {
    icon: ShieldCheck,
    title: "Direct Proprietor Oversight",
    desc: "Proprietor Saravanan directly manages each site, eliminating agency markups.",
  },
];

export default async function ServicesPage() {
  return (
    <div className="bg-[#FAF6EC] text-[#17211E]">
      {/* ─────────────────── HERO SECTION ─────────────────── */}
      <section className="relative py-12 md:py-16 bg-[#06261E] text-white overflow-hidden">
        {/* Glow backdrop elements */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#0B4A3A] opacity-60 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#C9A24B] opacity-20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="page-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#0B4A3A]/80 border border-[#C9A24B]/40 text-[#C9A24B] text-xs font-semibold uppercase tracking-wider mb-4 animate-fade-in">
            <Sparkles size={14} className="text-[#C9A24B]" />
            Sri Kubera Signature Stage Services
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white max-w-4xl mx-auto leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Bespoke Decoration Services for{" "}
            <span className="text-gradient-gold">Unforgettable Moments</span>
          </h1>

          <div className="gold-divider mx-auto mb-4" />

          <p className="text-[#E8E2D5] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6 font-light">
            From grand royal wedding mandapams and custom milestone birthday stages
            to sacred family ceremonies, Sri Kubera Decor &amp; Events brings over
            a decade of authentic craftsmanship to every celebration in Puducherry.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            {[
              { label: "Celebrations Styled", value: "500+" },
              { label: "Decade in Craft", value: "10+ Years" },
              { label: "Puducherry & Beyond", value: "100% On-Time" },
              { label: "Direct Owner Oversight", value: "Zero Markups" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-panel-dark rounded-2xl p-3.5 text-center border border-[#C9A24B]/20"
              >
                <p className="text-lg sm:text-xl font-bold text-[#C9A24B] font-display">
                  {stat.value}
                </p>
                <p className="text-[11px] text-[#E8E2D5]/80 mt-0.5 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── SIGNATURE SERVICES SHOWCASE ─────────────────── */}
      <section className="py-12 md:py-16" aria-label="Services Catalogue">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="section-eyebrow">
              <Sparkles size={14} className="text-bronze" />
              <span>What We Create</span>
            </div>
            <h2
              className="section-heading-serif text-[#06261E]"
            >
              Tailored Stage Decor for Every Occasion
            </h2>
            <div className="gold-divider mx-auto mt-3 mb-4" />
            <p className="text-[#5D6D67] text-sm sm:text-base leading-relaxed">
              Every design is customized to your venue dimensions, preferred color palette,
              and ceremonial traditions. Click any service to view existing designs or raise an enquiry.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {SIGNATURE_SERVICES.map((srv) => {
              const Icon = srv.icon;
              const waText = encodeURIComponent(
                `Hello Sri Kubera Decor, I am enquiring about your "${srv.title}" service in Puducherry. Please share package details and availability.`
              );

              return (
                <article
                  key={srv.id}
                  className="luxury-card overflow-hidden flex flex-col"
                >
                  {/* Photo Banner with Badge */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#06261E]">
                    <ResponsiveImage
                      src={srv.image}
                      alt={`${srv.title} by Sri Kubera Decor Puducherry`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                    {/* Category pill */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#06261E]/85 text-[#FAF6EC] border border-[#C9A24B]/40 backdrop-blur-md">
                        <Icon size={12} className="text-[#C9A24B]" />
                        {srv.category}
                      </span>
                    </div>

                    {/* Bottom overlay title */}
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <p className="text-xs font-medium text-[#C9A24B] uppercase tracking-wider mb-1">
                        {srv.tagline}
                      </p>
                      <h3
                        className="text-xl sm:text-2xl font-bold text-white drop-shadow-md"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {srv.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[#5D6D67] text-sm leading-relaxed mb-6">
                        {srv.description}
                      </p>

                      <div className="mb-6">
                        <p className="text-xs font-bold text-[#06261E] uppercase tracking-wider mb-3">
                          Signature Inclusions:
                        </p>
                        <ul className="space-y-2">
                          {srv.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#17211E]">
                              <CheckCircle2
                                size={16}
                                className="text-emerald-700 shrink-0 mt-0.5"
                                aria-hidden="true"
                              />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-6 border-t border-[#FAF6EC] flex flex-wrap items-center justify-between gap-3">
                      <Link
                        href={srv.gallerySlug === "all" ? "/gallery" : `/gallery?category=${encodeURIComponent(srv.gallerySlug)}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#0B4A3A] hover:text-[#C9A24B] uppercase tracking-wider transition-colors"
                      >
                        <span>Browse {srv.category} Designs</span>
                        <ArrowRight size={14} />
                      </Link>

                      <a
                        href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B4A3A] hover:bg-[#06261E] text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
                      >
                        <MessageCircle size={14} className="text-[#C9A24B]" />
                        <span>Enquire on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────── HOW IT WORKS (EXECUTION TIMELINE) ─────────────────── */}
      <section className="py-12 md:py-16 bg-[#0B4A3A] text-white relative overflow-hidden">
        <div className="page-container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-[#C9A24B] border border-[#C9A24B]/30 uppercase tracking-widest mb-2.5">
              Flawless Execution
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              From Concept to Unforgettable Setup
            </h2>
            <div className="gold-divider mx-auto mt-3 mb-3" />
            <p className="text-[#E8E2D5] text-sm sm:text-base leading-relaxed">
              We eliminate celebration stress with a clear, predictable four-step process.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {EXECUTION_STEPS.map((item) => (
              <div
                key={item.step}
                className="glass-panel-dark rounded-2xl p-5 relative border border-[#C9A24B]/20 flex flex-col justify-between hover-lift transition-all"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C9A24B] to-[#987318] text-[#06261E] font-extrabold text-sm flex items-center justify-center mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h3
                    className="text-base font-bold text-white mb-1.5"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#E8E2D5]/80 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-white/10 text-[11px] text-[#C9A24B] uppercase tracking-wider font-semibold">
                  Step {item.step} Verified
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── WHY SRI KUBERA (QUALITY PILLARS) ─────────────────── */}
      <section className="py-12 md:py-16 bg-[#FAF6EC]">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="section-eyebrow">
              <Sparkles size={14} className="text-bronze" />
              <span>The Sri Kubera Difference</span>
            </div>
            <h2
              className="section-heading-serif text-[#06261E]"
            >
              Why Families &amp; Planners Trust Us
            </h2>
            <div className="gold-divider mx-auto mt-3 mb-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {QUALITY_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="luxury-card p-5 sm:p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#0B4A3A]/10 text-[#0B4A3A] flex items-center justify-center mx-auto mb-3 border border-[#0B4A3A]/20">
                    <Icon size={24} className="text-[#0B4A3A]" />
                  </div>
                  <h3
                    className="text-base font-bold text-[#06261E] mb-1.5"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5D6D67] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────── LUXURY BOTTOM CALL TO ACTION ─────────────────── */}
      <section className="py-12 md:py-16 bg-[#06261E] text-white text-center relative overflow-hidden">
        <div className="page-container max-w-3xl relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C9A24B] mb-2">
            Plan Your Date Today
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to Design Your Dream Event?
          </h2>
          <div className="gold-divider mx-auto mb-5" />
          <p className="text-[#E8E2D5] text-sm sm:text-base leading-relaxed mb-6">
            Tell us about your celebration in Puducherry or surrounding regions.
            We provide quick estimates, dates check, and custom theme proposals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hello Saravanan, I would like to book a consultation for an upcoming celebration.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold px-8 py-4 text-xs sm:text-sm w-full sm:w-auto"
            >
              <MessageCircle size={18} />
              <span>Message on WhatsApp</span>
            </a>
            <Link
              href="/gallery"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-[#C9A24B]/40 text-[#FAF6EC] hover:bg-white/10 text-xs sm:text-sm font-semibold transition-all w-full sm:w-auto"
            >
              <span>Explore Gallery (35+ Stages)</span>
              <ArrowRight size={16} />
            </Link>
            <a
              href="tel:7373876879"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white/5 hover:bg-white/15 text-[#E8E2D5] text-xs sm:text-sm font-medium transition-all w-full sm:w-auto"
            >
              <Phone size={16} className="text-[#C9A24B]" />
              <span>Call: 7373876879</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
