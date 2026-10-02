"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Hash,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    email: z.string().email("Enter a valid email address"),
    gender: z.enum(["male", "female"] as const, { message: "Please select a gender" }),
    address: z.string().optional(),
    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pincode must be 6 digits")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
          gender: data.gender,
          address: data.address || "",
          pincode: data.pincode || "",
          role: "user",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Account created! Please check your email to verify your account.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: photo panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <Image
          src="/assets/45000-1.jpeg"
          alt="Beautiful event decoration by Sri Kubera Decor & Events"
          fill
          priority
          sizes="42vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/80 to-navy-900/60" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <p className="section-label text-gold-400 mb-3">Join Sri Kubera</p>
          <h2
            className="text-3xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Dream Event<br />
            <span className="text-gradient-gold">Starts Here</span>
          </h2>
          <p className="text-ivory-300 text-sm leading-relaxed max-w-xs">
            Create a free account to browse designs, raise enquiries, and track your bookings.
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-ivory-50 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-800 text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>

          {/* Brand */}
          <div className="mb-8">
            <Link href="/" className="inline-block mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, var(--color-gold-500), var(--color-gold-300))" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <polygon
                      points="8,1 9.9,6.2 15.5,6.2 11,9.5 12.9,14.7 8,11.4 3.1,14.7 5,9.5 0.5,6.2 6.1,6.2"
                      fill="var(--color-navy-900)"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-navy-900 leading-none" style={{ fontFamily: "var(--font-display)" }}>
                    Sri Kubera
                  </p>
                  <p className="text-[10px] text-gold-600 font-semibold tracking-[0.18em] uppercase mt-0.5">
                    Decor &amp; Events
                  </p>
                </div>
              </div>
            </Link>
            <h1
              className="text-3xl font-bold text-navy-900 mb-1.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create your account
            </h1>
            <p className="text-navy-500 text-sm">
              Free to register. Browse designs and raise enquiries instantly.
            </p>
          </div>

          {/* Form */}
          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label htmlFor="signup-name" className="input-label">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" aria-hidden="true" />
                    <input
                      id="signup-name"
                      type="text"
                      placeholder="Saravanan"
                      className="input-field pl-10"
                      aria-invalid={errors.name ? "true" : "false"}
                      aria-describedby={errors.name ? "su-name-err" : undefined}
                      {...register("name")}
                    />
                  </div>
                  {errors.name && <p id="su-name-err" className="input-error">{errors.name.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="signup-phone" className="input-label">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" aria-hidden="true" />
                    <input
                      id="signup-phone"
                      type="tel"
                      placeholder="9876543210"
                      className="input-field pl-10"
                      aria-invalid={errors.phone ? "true" : "false"}
                      aria-describedby={errors.phone ? "su-phone-err" : undefined}
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && <p id="su-phone-err" className="input-error">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="signup-email" className="input-label">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" aria-hidden="true" />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="input-field pl-10"
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "su-email-err" : undefined}
                    {...register("email")}
                  />
                </div>
                {errors.email && <p id="su-email-err" className="input-error">{errors.email.message}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="input-label">Gender</label>
                <div className="flex gap-5 mt-1">
                  {(["male", "female"] as const).map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={g}
                        {...register("gender")}
                        className="accent-gold-500 w-4 h-4"
                        id={`gender-${g}`}
                        aria-describedby={errors.gender ? "su-gender-err" : undefined}
                      />
                      <span className="text-sm text-navy-700 capitalize">{g}</span>
                    </label>
                  ))}
                </div>
                {errors.gender && <p id="su-gender-err" className="input-error">{errors.gender.message}</p>}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="signup-address" className="input-label">
                  Address <span className="text-navy-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-3.5 text-navy-400 pointer-events-none" aria-hidden="true" />
                  <textarea
                    id="signup-address"
                    rows={2}
                    placeholder="Your full address"
                    className="input-field pl-10 resize-none"
                    {...register("address")}
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label htmlFor="signup-pincode" className="input-label">
                  Pincode <span className="text-navy-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" aria-hidden="true" />
                  <input
                    id="signup-pincode"
                    type="text"
                    maxLength={6}
                    placeholder="605001"
                    className="input-field pl-10"
                    aria-invalid={errors.pincode ? "true" : "false"}
                    aria-describedby={errors.pincode ? "su-pincode-err" : undefined}
                    {...register("pincode")}
                  />
                </div>
                {errors.pincode && <p id="su-pincode-err" className="input-error">{errors.pincode.message}</p>}
              </div>

              {/* Password pair */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-password" className="input-label">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" aria-hidden="true" />
                    <input
                      id="signup-password"
                      type={showPass ? "text" : "password"}
                      placeholder="Min 8 chars"
                      className="input-field pl-10 pr-11"
                      aria-invalid={errors.password ? "true" : "false"}
                      aria-describedby={errors.password ? "su-pw-err" : undefined}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition-colors"
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p id="su-pw-err" className="input-error">{errors.password.message}</p>}
                </div>

                <div>
                  <label htmlFor="signup-confirm" className="input-label">Confirm Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" aria-hidden="true" />
                    <input
                      id="signup-confirm"
                      type={showPass ? "text" : "password"}
                      placeholder="Repeat password"
                      className="input-field pl-10"
                      aria-invalid={errors.confirmPassword ? "true" : "false"}
                      aria-describedby={errors.confirmPassword ? "su-confirm-err" : undefined}
                      {...register("confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p id="su-confirm-err" className="input-error">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base justify-center mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-navy-500 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-gold-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
