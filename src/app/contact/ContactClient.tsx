"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, MapPin, MessageCircle, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const WA_NUMBER = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";

export default function ContactClientPage() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    setLoading(true);
    const text = encodeURIComponent(
      `Hello, my name is ${data.name}. My number is ${data.phone}.\n\n${data.message}`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank");
    toast.success("WhatsApp opened! We look forward to hearing from you.");
    reset();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ivory-100 py-24">
      <div className="page-container">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-label mb-3">Reach Us</p>
          <h1 className="section-title">Get in Touch</h1>
          <div className="gold-divider mx-auto mt-5 mb-5" />
          <p className="section-subtitle mx-auto">
            We would love to hear about your event. Reach us directly by phone,
            WhatsApp, or use the form below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact info + map */}
          <div className="space-y-6">
            <div className="card p-8">
              <h2
                className="text-xl font-bold text-navy-900 mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Contact Details
              </h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-gold-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-800 mb-0.5">Phone &amp; WhatsApp</p>
                    <a
                      href="tel:7373876879"
                      className="text-navy-600 text-sm hover:text-gold-600 transition-colors block"
                    >
                      7373876879
                    </a>
                    <a
                      href="tel:9486064769"
                      className="text-navy-600 text-sm hover:text-gold-600 transition-colors block"
                    >
                      9486064769
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-gold-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-800 mb-0.5">Address</p>
                    <p className="text-navy-600 text-sm leading-relaxed">
                      No. 80, Manjini Nagar,
                      <br />
                      Bachanai Madam Street,
                      <br />
                      Muthiyal Pettai, Puducherry
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hello, I would like to enquire about your decoration services.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-[#25D366] text-white font-bold text-sm hover:bg-[#1ebe5b] transition-colors"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle size={18} aria-hidden="true" />
                Chat on WhatsApp
              </a>
            </div>

            {/* Map */}
            <div className="card overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62551.85783826476!2d79.77476824999999!3d11.9338826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5361508be8bcd9%3A0x1c2e5a3ee0a6b2d6!2sPuducherry!5e0!3m2!1sen!2sin!4v1700000000000"
                width="100%"
                height="280"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sri Kubera Decor & Events location — Puducherry"
              />
            </div>
          </div>

          {/* Form */}
          <div className="card p-8 md:p-10">
            <h2
              className="text-xl font-bold text-navy-900 mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Send a Message
            </h2>
            <p className="text-navy-500 text-sm mb-7 leading-relaxed">
              Fill in the form and we will open WhatsApp with your message
              pre-filled — no login required.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <label htmlFor="contact-name" className="input-label">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Ravi Kumar"
                  className="input-field"
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? "contact-name-err" : undefined}
                  {...register("name")}
                />
                {errors.name && (
                  <p id="contact-name-err" className="input-error">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="contact-phone" className="input-label">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="9876543210"
                  className="input-field"
                  aria-invalid={errors.phone ? "true" : "false"}
                  aria-describedby={errors.phone ? "contact-phone-err" : undefined}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p id="contact-phone-err" className="input-error">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="contact-message" className="input-label">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="Tell us about your event — occasion, date, guest count, budget..."
                  className="input-field resize-none"
                  aria-invalid={errors.message ? "true" : "false"}
                  aria-describedby={errors.message ? "contact-msg-err" : undefined}
                  {...register("message")}
                />
                {errors.message && (
                  <p id="contact-msg-err" className="input-error">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 justify-center text-base"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={18} aria-hidden="true" />
                )}
                {loading ? "Opening WhatsApp..." : "Send via WhatsApp"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
