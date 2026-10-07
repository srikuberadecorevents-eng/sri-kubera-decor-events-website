import type { Metadata } from "next";
import { Heart, Gift, Star, Briefcase, Home, Camera, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Sri Kubera Decor & Events offers wedding decoration, birthday decoration, surprise parties, and corporate event decoration services in Puducherry.",
};

const iconMap: Record<string, React.ElementType> = {
  Heart, Gift, Star, Briefcase, Home, Camera,
};

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at");

  return (
    <div className="py-20 bg-cream-100 min-h-screen">
      <div className="page-container">
        <div className="text-center mb-14">
          <h1 className="section-title">Our Services</h1>
          <div className="gold-divider mx-auto mt-4 mb-4" />
          <p className="section-subtitle mx-auto">
            From intimate family celebrations to grand corporate events, we have
            the expertise and creativity to transform any space into an
            unforgettable experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {(services || []).map((service) => {
            const Icon = iconMap[service.icon || ""] || Star;
            return (
              <div key={service.id} className="card p-8 group hover:shadow-card-hover transition-shadow">
                <div className="flex gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gold-50 flex items-center justify-center shrink-0 group-hover:bg-gold-100 transition-colors">
                    <Icon size={28} className="text-gold-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-navy-900 mb-2">
                      {service.title}
                    </h2>
                    <p className="text-navy-500 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Process */}
        <div className="bg-navy-900 rounded-3xl p-10 md:p-14 mb-14">
          <h2 className="text-2xl font-serif font-bold text-white text-center mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Browse Gallery", desc: "Explore our design catalogue and find a style that speaks to you." },
              { step: "02", title: "Raise Enquiry", desc: "Click 'Enquire This Design' to get a unique Enquiry ID." },
              { step: "03", title: "Contact Us", desc: "Call or WhatsApp us with your Enquiry ID to finalise details." },
              { step: "04", title: "We Deliver", desc: "Our team arrives on time and sets up a flawless decoration." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center mx-auto mb-4">
                  <span className="text-navy-900 font-bold text-sm">{step}</span>
                </div>
                <h3 className="font-serif font-semibold text-white mb-2">{title}</h3>
                <p className="text-cream-300 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-navy-900 mb-4">
            Ready to begin?
          </h2>
          <p className="text-navy-500 text-sm mb-6 max-w-md mx-auto">
            Browse our gallery and raise a free enquiry in minutes. No payment required upfront.
          </p>
          <Link href="/gallery" className="btn-primary px-8 py-4 text-base">
            View Gallery
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
