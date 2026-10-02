import Link from "next/link";
import { Phone, MapPin, ExternalLink, Share2, Play } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-cream-100">
      <div className="page-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <h3 className="text-xl font-serif font-bold text-white">Sri Kubera</h3>
              <p className="text-gold-400 text-sm tracking-widest uppercase">Decor &amp; Events</p>
            </div>
            <p className="text-cream-300 text-sm leading-relaxed max-w-xs mb-5">
              We Decor Your Dreams. Crafting unforgettable moments through
              elegant decorations for weddings, birthdays, and every celebration
              that matters to you.
            </p>
            <div className="flex items-start gap-3 text-sm text-cream-300 mb-3">
              <MapPin size={16} className="text-gold-400 mt-0.5 shrink-0" />
              <span>
                No. 80, Manjini Nagar, Bachanai Madam Street,<br />
                Muthiyal Pettai, Puducherry
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-cream-300 mb-2">
              <Phone size={16} className="text-gold-400 shrink-0" />
              <a href="tel:7373876879" className="hover:text-gold-400 transition-colors">
                7373876879
              </a>
              <span className="text-navy-500">/</span>
              <a href="tel:9486064769" className="hover:text-gold-400 transition-colors">
                9486064769
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-widest mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/gallery", label: "Gallery" },
                { href: "/services", label: "Services" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream-300 hover:text-gold-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-widest mb-4">
              Services
            </h4>
            <ul className="space-y-2.5">
              {[
                "Wedding Decoration",
                "Birthday Decoration",
                "Surprise Parties",
                "Corporate Events",
                "Housewarming",
              ].map((s) => (
                <li key={s} className="text-cream-300 text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-navy-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cream-400 text-xs">
            &copy; {currentYear} Sri Kubera Decor &amp; Events. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-lg text-cream-400 hover:text-gold-400 hover:bg-navy-700 transition-all"
            >
              <Share2 size={16} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2 rounded-lg text-cream-400 hover:text-gold-400 hover:bg-navy-700 transition-all"
            >
              <ExternalLink size={16} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="p-2 rounded-lg text-cream-400 hover:text-gold-400 hover:bg-navy-700 transition-all"
            >
              <Play size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

