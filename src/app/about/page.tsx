import type { Metadata } from "next";
import { MapPin, Clock, Award, Users, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Sri Kubera Decor & Events — Puducherry's trusted decoration studio led by Proprietor Saravanan, with over a decade of experience crafting beautiful stage decorations.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream-100">
      {/* Hero */}
      <section className="bg-navy-900 py-20">
        <div className="page-container text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            About Sri Kubera
          </h1>
          <div className="gold-divider mx-auto mt-2 mb-6" />
          <p className="text-cream-200 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            A decade of craft, creativity, and commitment to making every
            celebration in Puducherry truly unforgettable.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold text-navy-900 mb-4">
                Our Story
              </h2>
              <div className="gold-divider mb-6" />
              <div className="space-y-4 text-navy-600 leading-relaxed">
                <p>
                  Sri Kubera Decor &amp; Events was founded by Saravanan with a
                  single conviction: every celebration deserves decoration that
                  reflects the heart behind it. What began as a small workshop
                  in Muthiyal Pettai, Puducherry, has grown into one of the
                  region&apos;s most trusted decoration studios.
                </p>
                <p>
                  Over the past decade, we have transformed hundreds of
                  wedding halls, birthday venues, and corporate auditoriums
                  across Puducherry and its surrounding towns. Our approach
                  combines premium fresh flowers, lights, fabrics, and
                  backdrops — always tailored to the couple&apos;s or family&apos;s
                  vision and budget.
                </p>
                <p>
                  We believe that beautiful decoration should not be a
                  luxury. Every package we design prioritises quality
                  materials and craftsmanship, so that every family — regardless
                  of the scale of their event — walks away with memories worth
                  cherishing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {[
                { icon: Award, label: "10+ Years", sub: "Decoration Experience" },
                { icon: Users, label: "500+", sub: "Happy Families" },
                { icon: MapPin, label: "Puducherry", sub: "& Surrounding Areas" },
                { icon: Clock, label: "On Time", sub: "Every Event, Always" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="card p-6 text-center">
                  <Icon size={28} className="text-gold-500 mx-auto mb-3" />
                  <p className="text-2xl font-serif font-bold text-navy-900">{label}</p>
                  <p className="text-navy-500 text-xs mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Proprietor */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-serif font-bold text-navy-900 mb-2">
              Meet the Proprietor
            </h2>
            <div className="gold-divider mx-auto mt-3 mb-6" />
            <div className="card p-8">
              <div className="w-20 h-20 rounded-full bg-navy-gradient flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-serif font-bold">S</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-navy-900 mb-1">Saravanan</h3>
              <p className="text-gold-600 text-sm mb-4">Proprietor, Sri Kubera Decor &amp; Events</p>
              <p className="text-navy-500 text-sm leading-relaxed">
                With a passion for design and an eye for detail, Saravanan has
                personally overseen every major project since the studio&apos;s
                inception. His hands-on approach and commitment to client
                satisfaction are at the heart of everything Sri Kubera does.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-cream-100">
        <div className="page-container">
          <h2 className="text-2xl font-serif font-bold text-navy-900 text-center mb-10">
            Our Commitments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Quality Materials", desc: "Fresh flowers, premium fabrics, and professional-grade lights in every setup." },
              { title: "Custom Designs", desc: "Every decoration is tailored to your occasion, theme, and budget." },
              { title: "Transparent Pricing", desc: "Clear, upfront quotes with no hidden charges or surprise add-ons." },
              { title: "On-Time Setup", desc: "Our team arrives well before your event to ensure a flawless finish." },
              { title: "Post-Event Care", desc: "We handle teardown and cleanup so you can focus on celebrating." },
              { title: "Local Expertise", desc: "Deep knowledge of Puducherry venues and local aesthetics." },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-3">
                <CheckCircle size={18} className="text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-navy-800 text-sm mb-1">{title}</h3>
                  <p className="text-navy-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900">
        <div className="page-container text-center">
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Let&apos;s Create Something Beautiful Together
          </h2>
          <p className="text-cream-300 text-sm mb-6 max-w-md mx-auto">
            Browse our gallery, raise a free enquiry, and our team will be in
            touch to plan your perfect event.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/gallery" className="btn-primary">Browse Gallery</Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-cream-300/40 text-cream-200 hover:border-gold-400 hover:text-gold-400 font-semibold text-sm transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
