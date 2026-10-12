import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Award,
  Users,
  MapPin,
  Clock,
  Heart,
  CheckCircle2,
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Palette,
  Flower2,
  Flame,
  Quote,
} from "lucide-react";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Us | Sri Kubera Decor & Events Puducherry",
  description:
    "Learn about Sri Kubera Decor & Events — Puducherry's trusted decoration studio founded by Proprietor Saravanan. Over a decade of craftsmanship, 500+ celebrations, and bespoke stage decor in Muthiyal Pettai.",
};

const WA_NUMBER = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";

const STATS = [
  { value: "10+", label: "Years of Craft", sub: "Since inception in Puducherry" },
  { value: "500+", label: "Happy Families", sub: "Weddings, birthdays & poojas" },
  { value: "35+", label: "Signature Designs", sub: "Customizable stage concepts" },
  { value: "100%", label: "On-Time Handover", sub: "Completed hours before events" },
];

const CRAFT_PILLARS = [
  {
    icon: Flower2,
    title: "Fresh Farm Blooms",
    desc: "Grade-A roses, marigolds, tuberoses, and exotic orchids sourced daily from trusted regional flower markets.",
  },
  {
    icon: Palette,
    title: "Bespoke Cultural Themes",
    desc: "Seamless blending of classic South Indian heritage with modern contemporary LED lighting and chic pastel backdrops.",
  },
  {
    icon: ShieldCheck,
    title: "Engineered Framework",
    desc: "Sturdy aluminum and steel trussing designed for safety, perfect fabric draping, and flawless photographic angles.",
  },
  {
    icon: Clock,
    title: "Strict Timekeeping",
    desc: "Our setup team arrives hours in advance, ensuring the entire stage and walkway are photo-ready before guests arrive.",
  },
  {
    icon: Heart,
    title: "Direct Owner Oversight",
    desc: "Proprietor Saravanan personally inspects and coordinates every venue installation, ensuring perfection on site.",
  },
  {
    icon: Flame,
    title: "Complete Teardown",
    desc: "We take full responsibility for teardown and venue cleanup so families can focus entirely on celebrating.",
  },
];

const SERVICE_REGIONS = [
  "Muthiyal Pettai",
  "White Town",
  "Heritage Town",
  "Lawspet",
  "Villianur",
  "Thavalakuppam",
  "ECR Beachside",
  "Auroville Borders",
  "Cuddalore & Tindivanam",
];

export default function AboutPage() {
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
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#C9A24B] opacity-25 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="page-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#0B4A3A]/80 border border-[#C9A24B]/40 text-[#C9A24B] text-xs font-semibold uppercase tracking-wider mb-4 animate-fade-in">
            <Sparkles size={14} className="text-[#C9A24B]" />
            Our Heritage &amp; Passion · Muthiyal Pettai, Puducherry
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white max-w-4xl mx-auto leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A Decade of Craft, Creativity &amp;{" "}
            <span className="text-gradient-gold">Celebration Memories</span>
          </h1>

          <div className="gold-divider mx-auto mb-4" />

          <p className="text-[#E8E2D5] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6 font-light">
            Founded by Proprietor Saravanan, Sri Kubera Decor &amp; Events has grown from
            a dedicated local decoration studio into one of Puducherry&apos;s most cherished
            event stylists, turning life&apos;s most auspicious moments into visual masterpieces.
          </p>

          {/* Key Metrics Grid with Animated Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {STATS.map((stat) => {
              const numeric = parseInt(stat.value.replace(/\D/g, ""), 10) || 10;
              const suffix = stat.value.replace(/[\d]/g, "");
              return (
                <div
                  key={stat.label}
                  className="glass-panel-dark rounded-2xl p-4 text-center border border-[#C9A24B]/20 hover-lift transition-all"
                >
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#C9A24B] font-display">
                    <AnimatedCounter value={numeric} suffix={suffix} />
                  </p>
                  <p className="text-xs font-bold text-white mt-1">{stat.label}</p>
                  <p className="text-[10px] text-[#E8E2D5]/70 mt-0.5">{stat.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────── OUR STORY SECTION ─────────────────── */}
      <section className="py-12 md:py-16" aria-label="Our Story">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Story text */}
            <div className="lg:col-span-6 space-y-6">
              <div className="section-eyebrow">
                <Sparkles size={14} className="text-bronze" />
                <span>The Story of Sri Kubera</span>
              </div>

              <h2
                className="section-heading-serif text-[#06261E]"
              >
                Where Traditional Grace Meets Contemporary Artistry
              </h2>

              <div className="gold-divider" />

              <div className="space-y-4 text-[#5D6D67] text-sm sm:text-base leading-relaxed">
                <p>
                  Sri Kubera Decor &amp; Events was born out of a single conviction: every family
                  milestone in Puducherry deserves decoration crafted with the same love and
                  devotion as the celebration itself. What began in Muthiyal Pettai has blossomed
                  into a trusted name across marriage halls, temples, beachfront venues, and private residences.
                </p>
                <p>
                  Over the past decade, we have honed our craft across hundreds of marriages,
                  receptions, 1st birthdays, seemantham ceremonies, and corporate meets. We reject
                  cookie-cutter setups. Instead, we listen to the couple or family, harmonize with the
                  venue&apos;s architecture, and handpick fresh flowers, silks, and custom illumination.
                </p>
                <p>
                  We believe grand aesthetics shouldn&apos;t come with inflated intermediary costs.
                  By handling procurement, metal fabrication, floral styling, and on-site assembly
                  in-house, we provide superior quality directly to families with complete transparency.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link href="/gallery" className="btn-gold !text-xs sm:!text-sm !px-6 !py-3">
                  <span>Explore Our Work</span>
                  <ArrowRight size={16} />
                </Link>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hello Saravanan, I would like to enquire about your decoration services in Puducherry.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline !text-xs sm:!text-sm !px-6 !py-3"
                >
                  <MessageCircle size={16} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Photo Showcase Grid */}
            <div className="lg:col-span-6">
              <div className="relative">
                {/* Main Image */}
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C9A24B]/30 bg-[#06261E]">
                  <ResponsiveImage
                    src="/assets/marriage-16.jpeg"
                    alt="Grand Royal Stage Decoration by Sri Kubera Puducherry"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 right-5 text-right text-white">
                    <p className="text-[11px] uppercase tracking-widest text-[#C9A24B] font-bold">
                      Signature Stage Collection
                    </p>
                    <p className="text-base sm:text-lg font-bold font-display">
                      Handcrafted Royal Mandapam
                    </p>
                  </div>
                </div>

                {/* Overlapping secondary card */}
                <div className="hidden sm:block absolute -bottom-8 -left-6 w-56 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white bg-[#06261E]">
                  <ResponsiveImage
                    src="/assets/marriage-13.jpeg"
                    alt="Royal Floral Entrance Archway by Sri Kubera Puducherry"
                    fill
                    sizes="224px"
                    className="object-cover"
                  />
                </div>

                {/* Floating badge */}
                <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-[#C9A24B]/30 text-center">
                  <p className="text-xs font-bold text-[#06261E] uppercase tracking-wider">
                    Puducherry
                  </p>
                  <p className="text-[10px] text-[#C9A24B] font-semibold">
                    10+ Years Established
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── PROPRIETOR SPOTLIGHT ─────────────────── */}
      <section className="py-12 md:py-16 bg-[#FAF7F2] border-y border-[#E8E2D5] relative overflow-hidden" aria-label="Meet the Proprietor">
        {/* Subtle decorative background aura */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#C9A24B 1px, transparent 1px), radial-gradient(#C9A24B 1px, #FAF7F2 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />

        <div className="page-container max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A24B]/15 border border-[#C9A24B]/30 text-[#8C6820] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-[#C9A24B]" />
              Personal Commitment
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#06261E]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Meet the Proprietor
            </h2>
            <div className="gold-divider mx-auto mt-3" />
            <p className="text-[#5D6D67] text-xs sm:text-sm mt-2 max-w-lg mx-auto">
              Direct craftsmanship, personal presence, and unwavering devotion to every Puducherry celebration.
            </p>
          </div>

          {/* Master Showcase Card */}
          <div className="relative rounded-3xl overflow-hidden border border-[#C9A24B]/35 bg-gradient-to-br from-[#06261E] via-[#0B3A2E] to-[#041A14] text-white shadow-2xl p-6 sm:p-8 lg:p-10 transition-all duration-500 hover:border-[#C9A24B]/60 group">
            {/* Animated background ambient glow orbs */}
            <div
              className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-[#C9A24B] opacity-20 blur-3xl pointer-events-none animate-glow-pulse"
              aria-hidden="true"
            />
            <div
              className="absolute -left-24 -top-24 w-80 h-80 rounded-full bg-[#0B4A3A] opacity-30 blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* Subtle moving gold shimmer bar */}
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none animate-gold-shine" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
              
              {/* Left Column: Owner Portrait Showcase (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative w-full max-w-[340px] sm:max-w-[360px]">
                  {/* Outer glowing aura ring */}
                  <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#C9A24B]/35 via-[#F3E5AB]/15 to-[#C9A24B]/35 blur-xl animate-glow-pulse pointer-events-none" />

                  {/* Image container frame with luxury gold border matching 4:3 photo ratio */}
                  <div className="relative aspect-[4/3] rounded-2xl p-1 bg-gradient-to-tr from-[#C9A24B] via-[#FFE29A] to-[#8C6820] shadow-2xl overflow-hidden group/img">
                    <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-[#06261E]">
                      <Image
                        src="/assets/Sravanan_owner.jpeg"
                        alt="Saravanan - Founder & Lead Decorator at Sri Kubera Decor & Events Puducherry"
                        fill
                        sizes="(max-width: 640px) 340px, 360px"
                        className="object-cover object-center group-hover/img:scale-105 transition-transform duration-700 ease-out"
                        priority
                      />
                    </div>
                  </div>

                  {/* Floating Experience Badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#C9A24B] to-[#E2C375] text-[#06261E] px-3.5 py-1.5 rounded-full shadow-lg border border-white/30 flex items-center gap-1.5 animate-float-slow">
                    <Award size={14} className="text-[#06261E]" />
                    <span className="text-[11px] font-bold tracking-wide uppercase">10+ Years</span>
                  </div>
                </div>

                {/* Sub-badge placed cleanly below the frame - NO obstruction on photo */}
                <div className="mt-3.5 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#C9A24B]/40 text-xs text-[#FAF6EC]">
                  <ShieldCheck size={14} className="text-[#C9A24B]" />
                  <span>On-Site Lead &amp; Direct Guarantee</span>
                </div>
              </div>

              {/* Right Column: Narrative, Quote & Direct Actions (7 cols) */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-[#C9A24B]/40 text-[#ECC870] text-xs font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A24B] animate-pulse" />
                  Master Stage Decorator &amp; Founder
                </div>

                {/* Heading */}
                <div>
                  <h3
                    className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Saravanan
                  </h3>
                  <p className="text-[#ECC870] text-xs sm:text-sm font-semibold tracking-wider uppercase mt-1">
                    Proprietor &amp; Lead Designer · Sri Kubera Decor &amp; Events
                  </p>
                </div>

                {/* Quote Card */}
                <div className="relative pl-4 sm:pl-5 border-l-2 border-[#C9A24B] py-2 bg-white/[0.04] backdrop-blur-xs rounded-r-2xl pr-4 text-left">
                  <Quote size={18} className="text-[#C9A24B] mb-1.5 opacity-80" />
                  <p className="text-[#FAF6EC] text-xs sm:text-sm leading-relaxed italic">
                    &ldquo;Stage decoration isn&apos;t just about placing flowers and lighting; it is about
                    creating the sacred space where two families unite and where your most precious memories
                    are captured forever. Every venue is special, and I personally guarantee that our work
                    exceeds your expectations every time.&rdquo;
                  </p>
                </div>

                {/* 4 Feature highlight pills */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-left">
                  <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-[#C9A24B]/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[#C9A24B] shrink-0" />
                      <span className="text-xs font-semibold text-white">500+ Stages</span>
                    </div>
                    <p className="text-[11px] text-[#D8D0C5] mt-0.5">Weddings, birthdays &amp; poojas</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-[#C9A24B]/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[#C9A24B] shrink-0" />
                      <span className="text-xs font-semibold text-white">Zero Intermediaries</span>
                    </div>
                    <p className="text-[11px] text-[#D8D0C5] mt-0.5">Direct fair pricing for families</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-[#C9A24B]/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[#C9A24B] shrink-0" />
                      <span className="text-xs font-semibold text-white">In-House Florists</span>
                    </div>
                    <p className="text-[11px] text-[#D8D0C5] mt-0.5">Fresh daily farm flowers</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-[#C9A24B]/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[#C9A24B] shrink-0" />
                      <span className="text-xs font-semibold text-white">Puducherry &amp; TN</span>
                    </div>
                    <p className="text-[11px] text-[#D8D0C5] mt-0.5">All mandapams &amp; venues</p>
                  </div>
                </div>

                {/* Direct Action Connect Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <a
                    href="tel:7373876879"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C9A24B] to-[#E2C375] hover:from-[#B8923A] hover:to-[#D4B567] text-[#06261E] font-bold text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    <Phone size={15} />
                    <span>Call Saravanan: 7373876879</span>
                  </a>

                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hello Saravanan, I would like to consult with you directly regarding stage decoration services in Puducherry.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href="tel:9486064769"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF6EC] font-semibold text-xs border border-white/15 transition-all"
                  >
                    <span>Alt: 9486064769</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── CRAFTSMANSHIP PILLARS ─────────────────── */}
      <section className="py-12 md:py-16" aria-label="Craftsmanship Pillars">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="section-eyebrow">
              <Sparkles size={14} className="text-bronze" />
              <span>The Core Values</span>
            </div>
            <h2
              className="section-heading-serif text-[#06261E]"
            >
              Our Commitments to Every Client
            </h2>
            <div className="gold-divider mx-auto mt-3 mb-3" />
            <p className="text-[#5D6D67] text-sm sm:text-base leading-relaxed">
              We uphold consistent standards of quality and service across all stages we design.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CRAFT_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="luxury-card p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-50 to-gold-100/50 text-[#0B4A3A] flex items-center justify-center mb-4 border border-gold-300/40 shadow-xs">
                      <Icon size={22} className="text-[#0B4A3A]" />
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
                  <div className="mt-5 pt-3.5 border-t border-[#FAF6EC] flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <CheckCircle2 size={14} />
                    <span>Quality Assured</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────── REGIONAL REACH ─────────────────── */}
      <section className="py-12 md:py-16 bg-[#0B4A3A] text-white">
        <div className="page-container text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#C9A24B] uppercase tracking-widest font-semibold mb-2">
            <MapPin size={14} /> Local Coverage
          </div>
          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Serving Celebrations Across Puducherry &amp; Surrounding Areas
          </h2>
          <p className="text-[#E8E2D5] text-xs sm:text-sm max-w-xl mx-auto leading-relaxed mb-6">
            Our transportation crew operates across all major wedding mandapams, banquet halls,
            and private properties throughout the Union Territory.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {SERVICE_REGIONS.map((region) => (
              <span
                key={region}
                className="px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C9A24B]/30 text-xs text-[#FAF6EC] font-medium"
              >
                {region}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── BOTTOM CTA ─────────────────── */}
      <section className="py-12 md:py-16 bg-[#06261E] text-white text-center relative overflow-hidden">
        <div className="page-container max-w-3xl relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C9A24B] mb-2">
            Ready to Begin Planning?
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Let&apos;s Craft Something Extraordinary Together
          </h2>
          <div className="gold-divider mx-auto mb-5" />
          <p className="text-[#E8E2D5] text-sm sm:text-base leading-relaxed mb-6">
            Visit our gallery to see our 35+ signature stages, or contact us directly
            to schedule a free consultation with Saravanan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/gallery" className="btn-gold px-7 py-3.5 text-xs sm:text-sm w-full sm:w-auto">
              <span>View Design Gallery</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[#C9A24B]/40 text-[#FAF6EC] hover:bg-white/10 text-xs sm:text-sm font-semibold transition-all w-full sm:w-auto"
            >
              <span>Get in Touch</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
