"use client";

import type { Metadata } from "next";
import { Phone, MapPin, MessageCircle, Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import PostRequirementCard from "@/components/ui/PostRequirementCard";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const WA_NUMBER = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    setLoading(true);
    // Open WhatsApp with the contact message pre-filled
    const text = encodeURIComponent(
      `Hello, my name is ${data.name}. My number is ${data.phone}.\n\n${data.message}`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank");
    toast.success("Redirecting you to WhatsApp. We look forward to hearing from you.");
    reset();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream-100 py-20">
      <div className="page-container">
        <div className="text-center mb-12">
          <h1 className="section-title">Get in Touch</h1>
          <div className="gold-divider mx-auto mt-4 mb-4" />
          <p className="section-subtitle mx-auto">
            We would love to hear about your event. Reach us directly by phone,
            WhatsApp, or use the form below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact info + map */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-serif font-bold text-navy-900 text-lg mb-4">Contact Details</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-navy-800">Phone / WhatsApp</p>
                    <a href="tel:7373876879" className="text-navy-600 text-sm hover:text-gold-600 transition-colors block">7373876879</a>
                    <a href="tel:9486064769" className="text-navy-600 text-sm hover:text-gold-600 transition-colors block">9486064769</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-navy-800">Address</p>
                    <p className="text-navy-600 text-sm leading-relaxed">
                      No. 80, Manjini Nagar,<br />
                      Bachanai Madam Street,<br />
                      Muthiyal Pettai, Puducherry
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hello, I would like to enquire about your decoration services.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1ebe5b] transition-colors"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>

            {/* Map embed */}
            <div className="card overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62551.85783826476!2d79.77476824999999!3d11.9338826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5361508be8bcd9%3A0x1c2e5a3ee0a6b2d6!2sPuducherry!5e0!3m2!1sen!2sin!4v1700000000000"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sri Kubera Decor & Events location — Puducherry"
              />
            </div>
          </div>

          {/* Requirement Form */}
          <div className="flex justify-center items-start">
            <PostRequirementCard className="max-w-xl shadow-xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
