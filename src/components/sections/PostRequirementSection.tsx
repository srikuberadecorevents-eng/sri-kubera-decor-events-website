"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Send,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email("Please enter a valid email address").optional().or(z.literal("")),
  place: z.string().trim().min(2, "Please enter your event place or area in Puducherry"),
  event_type: z.string().optional(),
  event_date: z.string().optional(),
  message: z.string().trim().optional(),
  hp_website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const WA_NUMBER = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";

const occasions = [
  { value: "Birthday", label: "Birthday Celebration" },
  { value: "Marriage", label: "Marriage / Wedding Stage" },
  { value: "Baby Shower", label: "Baby Shower" },
  { value: "Other", label: "Other Celebration" },
] as const;

export default function PostRequirementSection() {
  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState<FormData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      const response = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.error || "Failed to submit your requirement.");
      }

      setSubmissionData(data);
      setSubmitted(true);
      reset();
    } catch (err: any) {
      console.error("Requirement submission error:", err);
      setSubmitError(err.message || "Failed to submit. Please try again or call us directly.");
    }
  };

  const handleOpenWhatsApp = () => {
    if (!submissionData) return;
    const text = [
      `*New Decoration Requirement*`,
      `-----------------------------`,
      `Name: ${submissionData.name}`,
      `Phone: ${submissionData.phone}`,
      `Place: ${submissionData.place}`,
      submissionData.event_type ? `Occasion: ${submissionData.event_type}` : null,
      submissionData.event_date ? `Event Date: ${submissionData.event_date}` : null,
      submissionData.message ? `Requirements: ${submissionData.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section
      id="post-requirement"
      className="py-24 relative overflow-hidden"
      aria-labelledby="req-heading"
      style={{ background: "linear-gradient(135deg, #0B4A3A 0%, #06261E 100%)" }}
    >
      {/* Background subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A24B' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <div className="relative page-container">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-label text-[#C9A24B] mb-3">Custom Decor</p>
          <h2
            id="req-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Post Your Requirement
          </h2>
          <div className="gold-divider mx-auto mt-5 mb-6" />
          <p className="text-[#FAF6EC]/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Tell us about your upcoming event in Puducherry. Our team will review your requirements
            and get back to you promptly with recommendations.
          </p>
        </div>

        {/* Card */}
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl p-8 md:p-10"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(201,162,75,0.3)",
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
                  Requirement Submitted!
                </h3>
                <p className="text-[#FAF6EC]/80 text-sm leading-relaxed mb-6 max-w-md mx-auto">
                  Thank you! Your requirement has been saved into our system. We will contact you
                  shortly on {submissionData?.phone}. You can also connect immediately on WhatsApp.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="btn-gold flex items-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Chat on WhatsApp Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setSubmissionData(null);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 text-sm font-semibold transition"
                  >
                    Submit Another Requirement
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                {submitError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-200 text-sm">
                    <AlertCircle size={18} className="shrink-0 text-red-400" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Honeypot field for bot detection (hidden from users) */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  className="sr-only absolute -left-9999px"
                  aria-hidden="true"
                  {...register("hp_website")}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="req-name" className="input-label-light">
                      Full Name <span className="text-[#C9A24B]">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="req-name"
                        type="text"
                        placeholder="e.g. Ramesh"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition"
                        aria-invalid={errors.name ? "true" : "false"}
                        aria-describedby={errors.name ? "req-name-err" : undefined}
                        {...register("name")}
                      />
                    </div>
                    {errors.name && (
                      <p id="req-name-err" className="text-xs text-red-300 mt-1 font-medium">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="req-phone" className="input-label-light">
                      Phone Number <span className="text-[#C9A24B]">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="req-phone"
                        type="tel"
                        placeholder="10-digit mobile number"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition"
                        aria-invalid={errors.phone ? "true" : "false"}
                        aria-describedby={errors.phone ? "req-phone-err" : undefined}
                        {...register("phone")}
                      />
                    </div>
                    {errors.phone && (
                      <p id="req-phone-err" className="text-xs text-red-300 mt-1 font-medium">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Place / Location */}
                  <div>
                    <label htmlFor="req-place" className="input-label-light">
                      Event Place / Area <span className="text-[#C9A24B]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="req-place"
                        type="text"
                        placeholder="e.g. Muthiyal Pettai, Lawspet"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition"
                        aria-invalid={errors.place ? "true" : "false"}
                        aria-describedby={errors.place ? "req-place-err" : undefined}
                        {...register("place")}
                      />
                    </div>
                    {errors.place && (
                      <p id="req-place-err" className="text-xs text-red-300 mt-1 font-medium">{errors.place.message}</p>
                    )}
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label htmlFor="req-email" className="input-label-light">
                      Email Address <span className="text-white/40 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="req-email"
                        type="email"
                        placeholder="name@example.com"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition"
                        aria-invalid={errors.email ? "true" : "false"}
                        aria-describedby={errors.email ? "req-email-err" : undefined}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p id="req-email-err" className="text-xs text-red-300 mt-1 font-medium">{errors.email.message}</p>
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
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0B4A3A] border border-white/20 text-white text-base focus:outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition"
                      {...register("event_type")}
                    >
                      <option value="">Select occasion...</option>
                      {occasions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label htmlFor="req-date" className="input-label-light">
                      Event Date <span className="text-white/40 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Calendar
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="req-date"
                        type="date"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-base focus:outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition"
                        style={{ colorScheme: "dark" }}
                        {...register("event_date")}
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
                      size={16}
                      className="absolute left-3 top-3.5 text-white/50 pointer-events-none"
                      aria-hidden="true"
                    />
                    <textarea
                      id="req-message"
                      rows={3}
                      placeholder="Tell us about the stage size, theme, floral preferences, or budget..."
                      className="w-full min-h-[90px] pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base resize-none focus:outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition"
                      {...register("message")}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold w-full py-4 text-base justify-center flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting Requirement...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Requirement
                    </>
                  )}
                </button>

                <p className="text-white/50 text-xs text-center leading-relaxed">
                  Your requirement will be sent directly to Sri Kubera Decor &amp; Events. No registration needed.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
