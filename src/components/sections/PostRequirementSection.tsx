"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle2, User, Phone, Calendar, MessageSquare } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  occasion: z.enum(["wedding", "birthday", "surprise", "corporate", "housewarming", "other"], {
    message: "Please select an occasion",
  }),
  date: z.string().optional(),
  message: z.string().min(10, "Please describe your requirements (min 10 characters)"),
});

type FormData = z.infer<typeof schema>;

const WA_NUMBER = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";

const occasions = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday" },
  { value: "surprise", label: "Surprise Party" },
  { value: "corporate", label: "Corporate Event" },
  { value: "housewarming", label: "Housewarming" },
  { value: "other", label: "Other" },
] as const;

export default function PostRequirementSection() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    const text = [
      `*New Decoration Enquiry*`,
      `-----------------------------`,
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Occasion: ${occasions.find((o) => o.value === data.occasion)?.label ?? data.occasion}`,
      data.date ? `Event Date: ${data.date}` : null,
      `Requirements: ${data.message}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
    setSubmitted(true);
    reset();
  };

  return (
    <section
      id="post-requirement"
      className="py-24 relative overflow-hidden"
      aria-labelledby="req-heading"
      style={{ background: "linear-gradient(135deg, #1F3A5F 0%, #0d1e30 100%)" }}
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A227' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <div className="relative page-container">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-label text-gold-400 mb-3">Free Service</p>
          <h2
            id="req-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Post Your Requirement
          </h2>
          <div className="gold-divider mx-auto mt-5 mb-6" />
          <p className="text-ivory-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Tell us about your event and we&apos;ll connect you on WhatsApp instantly.
            No registration required &mdash; completely free.
          </p>
        </div>

        {/* Card */}
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl p-8 md:p-10"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(201,162,39,0.25)",
              backdropFilter: "blur(12px)",
            }}
          >
            {submitted ? (
              /* Success state */
              <div className="text-center py-8 animate-fade-up">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <h3
                  className="text-2xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  WhatsApp Opened!
                </h3>
                <p className="text-ivory-300 text-sm leading-relaxed mb-7 max-w-sm mx-auto">
                  Your requirement has been prepared and WhatsApp was launched with
                  your message. We&apos;ll reply as soon as possible.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-outline-gold"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="req-name" className="input-label-light">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={15}
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-ivory-400 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="req-name"
                        type="text"
                        placeholder="Ravi Kumar"
                        className="input-underline pl-6"
                        aria-invalid={errors.name ? "true" : "false"}
                        aria-describedby={errors.name ? "req-name-err" : undefined}
                        {...register("name")}
                      />
                    </div>
                    {errors.name && (
                      <p id="req-name-err" className="input-error-light">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="req-phone" className="input-label-light">
                      Phone / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone
                        size={15}
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-ivory-400 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="req-phone"
                        type="tel"
                        placeholder="9876543210"
                        className="input-underline pl-6"
                        aria-invalid={errors.phone ? "true" : "false"}
                        aria-describedby={errors.phone ? "req-phone-err" : undefined}
                        {...register("phone")}
                      />
                    </div>
                    {errors.phone && (
                      <p id="req-phone-err" className="input-error-light">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Occasion */}
                  <div>
                    <label htmlFor="req-occasion" className="input-label-light">
                      Occasion Type
                    </label>
                    <select
                      id="req-occasion"
                      className="input-underline"
                      aria-invalid={errors.occasion ? "true" : "false"}
                      aria-describedby={errors.occasion ? "req-occasion-err" : undefined}
                      style={{ color: "rgba(255,255,255,0.85)" }}
                      {...register("occasion")}
                    >
                      <option value="" style={{ background: "#1F3A5F" }}>Select occasion...</option>
                      {occasions.map((o) => (
                        <option key={o.value} value={o.value} style={{ background: "#1F3A5F" }}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {errors.occasion && (
                      <p id="req-occasion-err" className="input-error-light">{errors.occasion.message}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label htmlFor="req-date" className="input-label-light">
                      Event Date{" "}
                      <span className="text-ivory-500 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Calendar
                        size={15}
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-ivory-400 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="req-date"
                        type="date"
                        className="input-underline pl-6"
                        style={{ colorScheme: "dark" }}
                        {...register("date")}
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="req-message" className="input-label-light">
                    Describe Your Requirements
                  </label>
                  <div className="relative">
                    <MessageSquare
                      size={15}
                      className="absolute left-0 top-3.5 text-ivory-400 pointer-events-none"
                      aria-hidden="true"
                    />
                    <textarea
                      id="req-message"
                      rows={4}
                      placeholder="E.g. I need a wedding stage decoration for 200 guests with floral theme. Budget is around ₹50,000..."
                      className="input-underline pl-6 resize-none"
                      aria-invalid={errors.message ? "true" : "false"}
                      aria-describedby={errors.message ? "req-message-err" : undefined}
                      {...register("message")}
                    />
                  </div>
                  {errors.message && (
                    <p id="req-message-err" className="input-error-light">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold w-full py-4 text-base justify-center"
                >
                  <Send size={18} />
                  Send via WhatsApp
                </button>

                <p className="text-ivory-500 text-xs text-center leading-relaxed">
                  Clicking &ldquo;Send via WhatsApp&rdquo; will open WhatsApp with your message
                  pre-filled. No account required.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
