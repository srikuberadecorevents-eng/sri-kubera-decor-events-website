import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, MessageCircle } from "lucide-react";

// Brand-specific social SVG icons (no FontAwesome, no misleading generic icons)
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-ivory-200">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand column — 5/12 */}
          <div className="md:col-span-5">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#C9A24B]/40 shadow-sm">
                <Image
                  src="/assets/logo.jpeg"
                  alt="Sri Kubera Decor & Events Logo"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div>
                <h3
                  className="text-lg font-bold text-white leading-none"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Sri Kubera
                </h3>
                <p className="text-[10px] text-gold-400 font-semibold tracking-[0.18em] uppercase mt-0.5">
                  Decor &amp; Events
                </p>
              </div>
            </div>

            <p className="text-ivory-400 text-sm leading-relaxed max-w-xs mb-6">
              We Decor Your Dreams. Crafting unforgettable moments through
              elegant decorations for weddings, birthdays, and every celebration
              that matters to you.
            </p>

            {/* Address */}
            <div className="flex items-start gap-3 text-sm text-ivory-400 mb-3">
              <MapPin size={15} className="text-gold-500 shrink-0 mt-0.5" aria-hidden="true" />
              <address className="not-italic leading-relaxed">
                No. 80, Manjini Nagar, Bachanai Madam Street,
                <br />
                Muthiyal Pettai, Puducherry
              </address>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 text-sm text-ivory-400 mb-6">
              <Phone size={15} className="text-gold-500 shrink-0" aria-hidden="true" />
              <span>
                <a href="tel:7373876879" className="hover:text-gold-400 transition-colors">
                  7373876879
                </a>
                {" "}·{" "}
                <a href="tel:9486064769" className="hover:text-gold-400 transition-colors">
                  9486064769
                </a>
              </span>
            </div>

            {/* WhatsApp button */}
            <a
              href={`https://wa.me/917373876879?text=${encodeURIComponent("Hello, I would like to enquire about your decoration services.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-bold hover:bg-[#1ebe5b] transition-colors"
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Quick Links — 3/12 */}
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="text-xs font-bold text-gold-400 uppercase tracking-[0.18em] mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/gallery", label: "Gallery" },
                { href: "/services", label: "Services" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/#post-requirement", label: "Post a Requirement" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ivory-400 hover:text-gold-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services — 4/12 */}
          <div className="md:col-span-4 md:col-start-10">
            <h4 className="text-xs font-bold text-gold-400 uppercase tracking-[0.18em] mb-5">
              Our Services
            </h4>
            <ul className="space-y-3">
              {[
                "Marriage & Wedding Stages",
                "Birthday Celebrations",
                "Baby Shower Setups",
                "Custom Floral Themes",
                "Reception & Engagement Stages",
              ].map((s) => (
                <li key={s} className="text-ivory-400 text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-navy-800 mt-14 pt-7 flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-ivory-500 text-xs">
            &copy; {currentYear} Sri Kubera Decor &amp; Events. All rights reserved.
          </p>

          {/* Social icons — brand-accurate SVGs */}
          <div className="flex items-center gap-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sri Kubera on Instagram"
              className="p-2.5 rounded-full text-ivory-400 hover:text-gold-400 hover:bg-navy-800 transition-all"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sri Kubera on Facebook"
              className="p-2.5 rounded-full text-ivory-400 hover:text-gold-400 hover:bg-navy-800 transition-all"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sri Kubera on YouTube"
              className="p-2.5 rounded-full text-ivory-400 hover:text-gold-400 hover:bg-navy-800 transition-all"
            >
              <YoutubeIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
