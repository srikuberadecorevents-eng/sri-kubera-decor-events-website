"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Sparkles,
  Send,
  Calendar,
  ChevronDown,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Building,
} from "lucide-react";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  occasion: z.string().optional(),
  eventDate: z.string().optional(),
  venue: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

type FormData = z.infer<typeof schema>;

const WA_NUMBER = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";

const OCCASIONS = [
  "Wedding Mandapam",
  "Birthday Celebration",
  "Baby Shower / Seemantham",
  "Grand Reception",
  "Housewarming / Pooja",
  "Corporate / Cultural Event",
];

const FAQS = [
  {
    q: "How early in advance should we book our stage decoration?",
    a: "For weddings and auspicious dates (muhurtham days), we recommend booking 3 to 6 weeks in advance to secure priority dates. For birthdays and private family functions, 1 to 2 weeks notice is generally sufficient.",
  },
  {
    q: "Do you supply fresh natural flowers or artificial floral arches?",
    a: "We offer both! We specialize in Grade-A fresh seasonal flowers (roses, tuberoses, jasmine, marigolds, and exotic orchids). For budget-friendly or long multi-day setups, we also have premium realistic artificial silks and hybrid arrangements.",
  },
  {
    q: "Can I customize the color palette and stage theme to match our attire?",
    a: "Yes, 100%. Every stage we design is tailored to your outfit colors, ceremonial customs, and venue architecture. You can share reference photos or browse our 35+ design catalogue during consultation.",
  },
  {
    q: "Do you undertake decoration work outside Puducherry town?",
    a: "Yes. In addition to all areas of Puducherry (Muthiyal Pettai, Lawspet, White Town, Villianur, ECR), our crew regularly decorates venues across Cuddalore, Tindivanam, Villupuram, and nearby coastal resorts.",
  },
  {
    q: "What is your setup timeline on the event day?",
    a: "Our crew arrives 4 to 6 hours before your function begins and completes the entire stage minimum 2 hours prior to guest arrival, ensuring you have ample time for photo checks and sound coordination.",
  },
  {
    q: "How do we get a pricing quote and finalize the booking?",
    a: "Simply call or WhatsApp Saravanan with your event date and venue. We provide transparent, itemized estimates with zero hidden agency markups. Once approved, a nominal advance reserves your date.",
  },
];

export default function ContactClientPage() {
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      occasion: OCCASIONS[0],
    },
  });

  const onSubmit = async (data: FormData) => {
    const formattedOccasion = selectedOccasion || data.occasion || "Celebration";
    const dateText = data.eventDate ? `\nEvent Date: ${data.eventDate}` : "";
    const venueText = data.venue ? `\nVenue/Area: ${data.venue}` : "";
    const customNotes = data.message ? `\nNotes: ${data.message}` : "";

    const fullMessage = `Hello Sri Kubera Decor & Events,\nMy Name: ${data.name}\nContact: ${data.phone}\nOccasion: ${formattedOccasion}${dateText}${venueText}${customNotes}\n\nPlease share design options and availability.`;

    // Persist enquiry to Supabase in background
    fetch("/api/enquiry/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: data.name,
        client_phone: data.phone,
        event_date: data.eventDate || null,
        venue: data.venue || null,
        message: fullMessage,
      }),
    }).catch((err) => console.warn("Failed to persist contact enquiry:", err));

    const encoded = encodeURIComponent(fullMessage);
    window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, "_blank");
    toast.success("Opening WhatsApp with your inquiry details.");
    reset();
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-[#FAF6EC] text-[#17211E]">
      {/* ─────────────────── HERO BANNER ─────────────────── */}
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
            Direct Studio Communication · Muthiyal Pettai, Puducherry
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white max-w-4xl mx-auto leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Let&apos;s Connect &amp;{" "}
            <span className="text-gradient-gold">Decorate Your Dreams</span>
          </h1>

          <div className="gold-divider mx-auto mb-4" />

          <p className="text-[#E8E2D5] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6 font-light">
            Have an upcoming wedding, birthday, or family celebration in Puducherry?
            Contact Founder Saravanan directly by phone or WhatsApp for quick estimates and date reservations.
          </p>

          {/* Instant Quick-Connect Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-4xl mx-auto text-left">
            {/* Primary Phone */}
            <a
              href="tel:7373876879"
              className="glass-panel-dark rounded-2xl p-4 sm:p-4.5 border border-[#C9A24B]/30 hover-lift transition-all group flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-xl bg-[#C9A24B] text-[#06261E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#C9A24B] font-semibold">
                  Direct Call
                </p>
                <p className="text-base sm:text-lg font-bold text-white mt-0.5">7373876879</p>
                <p className="text-[10px] text-[#E8E2D5]/70 mt-0.5">
                  Saravanan (Proprietor)
                </p>
              </div>
            </a>

            {/* Secondary Phone */}
            <a
              href="tel:9486064769"
              className="glass-panel-dark rounded-2xl p-4 sm:p-4.5 border border-[#C9A24B]/30 hover-lift transition-all group flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-xl bg-[#0B4A3A] border border-[#C9A24B]/40 text-[#C9A24B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#C9A24B] font-semibold">
                  Alternative Line
                </p>
                <p className="text-base sm:text-lg font-bold text-white mt-0.5">9486064769</p>
                <p className="text-[10px] text-[#E8E2D5]/70 mt-0.5">
                  Studio Inquiries
                </p>
              </div>
            </a>

            {/* WhatsApp Direct */}
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hello Saravanan, I would like to enquire about decoration for an event in Puducherry.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel-dark rounded-2xl p-4 sm:p-4.5 border border-[#25D366]/40 hover-lift transition-all group flex items-start gap-3.5 bg-[#0B4A3A]/40"
            >
              <div className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#25D366] font-semibold">
                  Instant WhatsApp
                </p>
                <p className="text-base sm:text-lg font-bold text-white mt-0.5">Chat Now</p>
                <p className="text-[10px] text-[#E8E2D5]/70 mt-0.5">
                  Fastest response
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────── MAIN SPLIT: FORM & STUDIO INFO ─────────────────── */}
      <section className="py-12 md:py-16" aria-label="Contact and Inquiries">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Studio Details & Location */}
            <div className="lg:col-span-5 space-y-7">
              <div className="luxury-card p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#FAF6EC]">
                  <div>
                    <span className="section-eyebrow text-bronze inline-block mb-1">
                      Puducherry Studio
                    </span>
                    <h2
                      className="text-2xl font-bold text-[#06261E] mt-0.5 font-display"
                    >
                      Sri Kubera Decor
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Open Today</span>
                  </div>
                </div>

                {/* Address info */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0B4A3A]/10 text-[#0B4A3A] flex items-center justify-center shrink-0 mt-1">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#06261E] mb-1">
                      Studio Address
                    </p>
                    <p className="text-sm text-[#5D6D67] leading-relaxed">
                      No. 80, Manjini Nagar,
                      <br />
                      Bachanai Madam Street,
                      <br />
                      Muthiyal Pettai, Puducherry – 605003
                    </p>
                  </div>
                </div>

                {/* Operating hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0B4A3A]/10 text-[#0B4A3A] flex items-center justify-center shrink-0 mt-1">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#06261E] mb-1">
                      Consultation Hours
                    </p>
                    <p className="text-sm text-[#5D6D67] leading-relaxed">
                      7:00 AM – 10:00 PM
                      <br />
                      Monday through Sunday (All 7 Days)
                    </p>
                  </div>
                </div>

                {/* Direct assurance */}
                <div className="p-4 rounded-2xl bg-[#FAF6EC] border border-[#C9A24B]/30 flex items-start gap-3">
                  <ShieldCheck size={20} className="text-[#C9A24B] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#5D6D67] leading-relaxed">
                    Personalized attention: Proprietor Saravanan is available for direct venue
                    inspection visits anywhere in Puducherry by appointment.
                  </p>
                </div>
              </div>

              {/* Map Card */}
              <div className="luxury-card overflow-hidden">
                <div className="p-4 bg-[#FAF6EC] border-b border-[#E8E2D5] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#06261E]">
                    <MapPin size={15} className="text-[#C9A24B]" />
                    <span>Location Map · Puducherry</span>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Muthiyal+Pettai+Puducherry"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#0B4A3A] hover:underline"
                  >
                    Open Full Map &rarr;
                  </a>
                </div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15613.23891486776!2d79.8247000!3d11.9472000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a536173a88c7c91%3A0xc3cf333795b5258!2sMuthialpet%2C%20Puducherry!5e0!3m2!1sen!2sin!4v1700000000000"
                  width="100%"
                  height="260"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sri Kubera Decor & Events Location in Muthiyal Pettai, Puducherry"
                />
              </div>
            </div>

            {/* Right Column: Interactive Consultation & Message Form */}
            <div className="lg:col-span-7">
              <div className="luxury-card p-8 sm:p-10">
                <div className="mb-8">
                  <span className="section-eyebrow text-bronze inline-block mb-1">
                    Instant Inquiry Form
                  </span>
                  <h2
                    className="text-2xl sm:text-3xl font-bold text-[#06261E] mt-1 font-display"
                  >
                    Send Event Details Directly
                  </h2>
                  <p className="text-sm text-[#5D6D67] mt-2 leading-relaxed">
                    Select your occasion and enter details below. Clicking send opens WhatsApp
                    with your pre-formatted enquiry ready for immediate pricing confirmation.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  {/* Occasion Selector Chips */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#06261E] mb-3">
                      Select Occasion Type:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((occ) => {
                        const isSelected = selectedOccasion === occ;
                        return (
                          <button
                            type="button"
                            key={occ}
                            onClick={() => setSelectedOccasion(occ)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isSelected
                                ? "bg-[#0B4A3A] text-white shadow-md scale-[1.02] border border-[#C9A24B]/60"
                                : "bg-[#FAF6EC] text-[#5D6D67] border border-[#E8E2D5] hover:border-[#C9A24B]/50 hover:text-[#06261E]"
                            }`}
                          >
                            {occ}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name and Phone Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-[#06261E] mb-2">
                        Your Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        autoComplete="name"
                        autoCapitalize="words"
                        placeholder="e.g. Anand Kumar"
                        aria-invalid={errors.name ? "true" : "false"}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        {...register("name")}
                        className="w-full text-sm px-4 py-3 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] bg-[#FAF6EC]/50"
                      />
                      {errors.name && (
                        <p id="name-error" className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-bold uppercase tracking-wider text-[#06261E] mb-2">
                        Mobile / WhatsApp Number *
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="10-digit mobile number"
                        aria-invalid={errors.phone ? "true" : "false"}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                        {...register("phone")}
                        className="w-full text-sm px-4 py-3 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] bg-[#FAF6EC]/50"
                      />
                      {errors.phone && (
                        <p id="phone-error" className="text-red-500 text-xs mt-1.5">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Event Date & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-date" className="block text-xs font-bold uppercase tracking-wider text-[#06261E] mb-2">
                        Approximate Event Date
                      </label>
                      <input
                        id="contact-date"
                        type="date"
                        {...register("eventDate")}
                        className="w-full text-sm px-4 py-3 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] bg-[#FAF6EC]/50 text-[#17211E]"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-venue" className="block text-xs font-bold uppercase tracking-wider text-[#06261E] mb-2">
                        Venue / Area in Puducherry
                      </label>
                      <input
                        id="contact-venue"
                        type="text"
                        autoCapitalize="sentences"
                        placeholder="e.g. Muthiyal Pettai Hall / Beachside"
                        {...register("venue")}
                        className="w-full text-sm px-4 py-3 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] bg-[#FAF6EC]/50"
                      />
                    </div>
                  </div>

                  {/* Special Requests Message */}
                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-[#06261E] mb-2">
                      Specific Theme Requests / Inquiries
                    </label>
                    <textarea
                      id="contact-message"
                      rows={3}
                      placeholder="Tell us about color preferences, stage size, or any specific reference design you like..."
                      {...register("message")}
                      className="w-full text-sm px-4 py-3 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] bg-[#FAF6EC]/50"
                    />
                  </div>

                  {/* Submit CTAs */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-gold w-full sm:flex-1 py-4 px-6 text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageCircle size={18} />
                      <span>{isSubmitting ? "Opening WhatsApp..." : "Send via WhatsApp"}</span>
                    </button>

                    <a
                      href="tel:7373876879"
                      className="btn-outline w-full sm:w-auto py-4 px-6 text-sm text-center flex items-center justify-center gap-2"
                    >
                      <Phone size={16} />
                      <span>Direct Call</span>
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── FAQS SECTION ─────────────────── */}
      <section className="py-12 md:py-16 bg-white border-t border-[#E8E2D5]" aria-label="Frequently Asked Questions">
        <div className="page-container max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="section-eyebrow text-bronze inline-block mb-2">
              Got Questions?
            </span>
            <h2 className="section-heading-serif mt-2">
              Frequently Asked Questions
            </h2>
            <div className="gold-divider mx-auto mt-4 mb-4" />
            <p className="text-[#5D6D67] text-sm leading-relaxed max-w-lg mx-auto">
              Everything you need to know about booking, floral selection, and event execution with Sri Kubera.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#E8E2D5] bg-[#FAF6EC]/50 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-[#FAF6EC] transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-bold text-[#06261E] font-display">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-[#C9A24B] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-[#5D6D67] leading-relaxed border-t border-[#E8E2D5]/50 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
