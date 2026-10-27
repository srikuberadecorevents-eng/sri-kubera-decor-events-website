"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Upload,
  X,
  IndianRupee,
  Sparkles,
  Clock,
  Palette,
  ShieldCheck,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

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
  budget: z.string().trim().optional(),
  message: z.string().trim().optional(),
  image_url: z.string().optional(),
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
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setPhotoError("Only JPEG, PNG, or WebP images are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError("Image size must be 10 MB or less.");
      return;
    }

    setCompressing(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setValue("image_url", result);
        setCompressing(false);
      };
      reader.onerror = () => {
        setPhotoError("Failed to read image.");
        setCompressing(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch {
      setPhotoError("Image compression failed. Please choose another image.");
      setCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoError(null);
    setValue("image_url", undefined);
  };

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

      // Record requirement submission to prevent future popup prompts
      try {
        localStorage.setItem("req_submitted", "true");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          localStorage.setItem(`req_submitted_${user.id}`, "true");
          localStorage.setItem(`req_prompt_dismissed_${user.id}`, "true");
          await supabase
            .from("profiles")
            .update({ requirement_prompt_dismissed_at: new Date().toISOString() })
            .eq("id", user.id);
        }
      } catch {
        // Silently continue
      }

      router.push("/thank-you");
    } catch (err: unknown) {
      console.error("Requirement submission error:", err);
      const msg = err instanceof Error ? err.message : "Failed to submit. Please try again or call us directly.";
      setSubmitError(msg);
    }
  };

  return (
    <section
      id="post-requirement"
      className="py-12 md:py-16 lg:py-20 relative overflow-hidden"
      aria-labelledby="req-heading"
      style={{
        background: "linear-gradient(145deg, #06201B 0%, #0B4A3A 55%, #081B2E 100%)",
      }}
    >
      {/* Background ambient glow orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-gold-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Background subtle geometric pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A24B' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <div className="relative page-container">
        {/* Two-Column Responsive Layout: Left Copy & Benefits, Right Elevated Form Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT COLUMN: Clear Heading, Copy, Benefit List & Direct Contact */}
          <div className="lg:col-span-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-400/15 border border-gold-400/40 text-gold-300 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">
              <Sparkles size={13} className="text-gold-400" />
              <span>Custom Decor Request</span>
            </div>

            <h2
              id="req-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Post Your Event Requirement
            </h2>

            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-gold-400 to-transparent mb-5" />

            <p className="text-ivory-100/85 text-sm sm:text-base leading-relaxed mb-8">
              Tell us about your celebration in Puducherry. Our master decor team reviews your specifications and provides custom themes, floral concepts, and a transparent estimate within 24 hours.
            </p>

            {/* Benefit List Beside the Form */}
            <div className="space-y-3.5 mb-8">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-gold-400/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center shrink-0 text-gold-300 mt-0.5">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold">Fast 24-Hour Quotation</h3>
                  <p className="text-ivory-200/70 text-xs mt-0.5 leading-relaxed">
                    Transparent, itemized pricing covering stages, flower styling, props, and lighting.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-gold-400/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center shrink-0 text-gold-300 mt-0.5">
                  <Palette size={18} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold">Custom Floral &amp; 3D Moodboards</h3>
                  <p className="text-ivory-200/70 text-xs mt-0.5 leading-relaxed">
                    Designs tailored to the exact ceiling height, lighting, and dimensions of your hall.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-gold-400/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center shrink-0 text-gold-300 mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold">Zero Broker Markups</h3>
                  <p className="text-ivory-200/70 text-xs mt-0.5 leading-relaxed">
                    Direct artisan workshop pricing with hands-on supervision by founder Mr. S. Saravanan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-gold-400/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center shrink-0 text-gold-300 mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold">2-Hour Early Handover Promise</h3>
                  <p className="text-ivory-200/70 text-xs mt-0.5 leading-relaxed">
                    Complete stage setup and electrical safety testing completed 2 hours before rituals.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Quick Contact Chip */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-navy-950/70 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-lg">
              <div>
                <p className="text-[11px] font-bold text-gold-300 uppercase tracking-wider">Need Immediate Guidance?</p>
                <p className="text-xs text-white/80 mt-0.5">Reach our decor specialist directly on WhatsApp.</p>
              </div>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hello Sri Kubera Decor, I have an upcoming event requirement.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0 shadow"
              >
                <MessageCircle size={14} />
                <span>Chat</span>
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Single Prominent Form Card */}
          <div className="lg:col-span-7 w-full">
            <div
              className="rounded-3xl p-6 sm:p-8 lg:p-9 shadow-2xl relative"
              style={{
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)",
                border: "1px solid rgba(201, 162, 75, 0.35)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Form Card Header */}
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
                <div>
                  <span className="text-xs font-bold text-gold-300 uppercase tracking-wider">Consultation Request</span>
                  <p className="text-white text-base sm:text-lg font-bold mt-0.5">Tell Us About Your Event</p>
                </div>
                <span className="text-[11px] font-semibold text-white/60 bg-white/10 px-3 py-1 rounded-full border border-white/10 hidden sm:inline-block">
                  2-Minute Form
                </span>
              </div>
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
                        autoComplete="name"
                        autoCapitalize="words"
                        placeholder="e.g. Ramesh"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition"
                        aria-invalid={errors.name ? "true" : "false"}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        {...register("name")}
                      />
                    </div>
                    {errors.name && (
                      <p id="name-error" className="text-xs text-red-300 mt-1 font-medium">{errors.name.message}</p>
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
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="10-digit mobile number"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition"
                        aria-invalid={errors.phone ? "true" : "false"}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                        {...register("phone")}
                      />
                    </div>
                    {errors.phone && (
                      <p id="phone-error" className="text-xs text-red-300 mt-1 font-medium">{errors.phone.message}</p>
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
                        autoCapitalize="words"
                        placeholder="e.g. Muthiyal Pettai, Lawspet"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition"
                        aria-invalid={errors.place ? "true" : "false"}
                        aria-describedby={errors.place ? "place-error" : undefined}
                        {...register("place")}
                      />
                    </div>
                    {errors.place && (
                      <p id="place-error" className="text-xs text-red-300 mt-1 font-medium">{errors.place.message}</p>
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
                        inputMode="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition"
                        aria-invalid={errors.email ? "true" : "false"}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p id="email-error" className="text-xs text-red-300 mt-1 font-medium">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

                  {/* Target Budget */}
                  <div>
                    <label htmlFor="req-budget" className="input-label-light">
                      Target Budget <span className="text-white/40 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <IndianRupee
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="req-budget"
                        type="text"
                        placeholder="e.g. 25,000"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition"
                        {...register("budget")}
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

                {/* Reference Photo Upload */}
                <div>
                  <label htmlFor="req-photo" className="input-label-light flex items-center justify-between">
                    <span>Reference Photo <span className="text-white/40 font-normal">(optional, max 10MB)</span></span>
                    {compressing && (
                      <span className="text-xs text-[#E6C670] flex items-center gap-1 font-normal">
                        <Loader2 size={12} className="animate-spin" /> Optimizing photo...
                      </span>
                    )}
                  </label>
                  {photoPreview ? (
                    <div className="relative inline-block mt-2">
                      <img
                        src={photoPreview}
                        alt="Reference design preview"
                        className="w-28 h-28 object-cover rounded-xl border border-white/20 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        aria-label="Remove uploaded photo"
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition shadow"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="req-photo"
                      className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-white/20 hover:border-[#C9A24B]/60 rounded-xl p-4 cursor-pointer bg-white/5 hover:bg-white/10 transition group text-center"
                    >
                      <Upload size={22} className="text-white/50 group-hover:text-[#C9A24B] transition mb-1.5" />
                      <span className="text-sm text-white/90 font-medium">Click to upload reference photo</span>
                      <span className="text-xs text-white/40 mt-0.5">JPEG, PNG, or WebP up to 10MB (automatically compressed)</span>
                      <input
                        id="req-photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={compressing || isSubmitting}
                        onChange={handlePhotoSelect}
                      />
                    </label>
                  )}
                  {photoError && (
                    <p id="photo-error" className="text-xs text-red-300 mt-1 font-medium">{photoError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || compressing}
                  className="btn-gold w-full py-4 text-base justify-center flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting Requirement...
                    </>
                  ) : compressing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Optimizing Photo...
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
