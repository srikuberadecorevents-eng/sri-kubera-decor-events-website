import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, Phone, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Thank you for contacting Sri Kubera Decor & Events.",
  robots: { index: false, follow: false },
};

const whatsappNumber =
  process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";
const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "7373876879";

export default function ThankYouPage() {
  return (
    <section className="min-h-[70vh] bg-[#FAF6EC] px-4 py-16 flex items-center">
      <div className="page-container max-w-2xl mx-auto text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#0B4A3A]/10 text-[#0B4A3A]">
          <Sparkles size={30} aria-hidden="true" />
        </div>
        <p className="section-eyebrow text-bronze mb-3">Sri Kubera Decor &amp; Events</p>
        <h1 className="section-heading-serif text-3xl sm:text-4xl text-[#06261E]">
          Thank you!
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#5D6D67]">
          We will contact you within 24 hours.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} aria-hidden="true" />
            WhatsApp
          </a>
          <a
            href={`tel:${businessPhone}`}
            className="btn-outline inline-flex items-center justify-center gap-2"
          >
            <Phone size={18} aria-hidden="true" />
            Call Us
          </a>
        </div>

        <Link
          href="/gallery"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0B4A3A] hover:text-[#06261E]"
        >
          Explore our gallery
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
