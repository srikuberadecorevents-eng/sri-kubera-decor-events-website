"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
  AlertCircle,
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
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms of Service & Privacy Policy",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function SignupForm() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo =
    searchParams.get("redirectTo") || searchParams.get("redirect") || "/dashboard";
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      agreeToTerms: false,
    },
  });

  const watchedPassword = watch("password") || "";

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const hasLength = watchedPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(watchedPassword);
    const hasNumber = /[0-9]/.test(watchedPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(watchedPassword);

    const score = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    let label = "Very Weak";
    let colorClass = "bg-red-500";
    if (score === 2) {
      label = "Fair";
      colorClass = "bg-amber-500";
    } else if (score === 3) {
      label = "Good";
      colorClass = "bg-gold-500";
    } else if (score === 4) {
      label = "Strong";
      colorClass = "bg-emerald-600";
    }

    return {
      score,
      label,
      colorClass,
      criteria: {
        hasLength,
        hasUpper,
        hasNumber,
        hasSpecial,
      },
    };
  }, [watchedPassword]);

  const onSubmit = async (data: FormData) => {
    if (loading || isSuccess) return;
    setLoading(true);
    setAuthError(null);

    try {
      const { data: authData, error } = await supabase.auth.signUp({
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
        },
      });

      // Handle Supabase auth errors cleanly
      if (error) {
        let msg = error.message;
        const lower = error.message.toLowerCase();
        if (
          lower.includes("already registered") ||
          lower.includes("already in use") ||
          lower.includes("user already exists") ||
          (error as any).status === 422
        ) {
          msg = "An account with this email already exists. Please sign in instead.";
        } else if (
          lower.includes("weak") ||
          lower.includes("password should be") ||
          lower.includes("least 8 characters")
        ) {
          msg = "Password is too weak. Please use at least 8 characters with uppercase letters and numbers.";
        } else if (
          lower.includes("failed to fetch") ||
          lower.includes("network") ||
          lower.includes("fetcherror")
        ) {
          msg = "Unable to connect to the server. Please check your internet connection and try again.";
        }

        setAuthError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      // If user already exists, Supabase returns empty identities array under email enumeration protection
      if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        const msg = "An account with this email already exists. Please sign in instead.";
        setAuthError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      // With email confirmation disabled, user already has a session
      let session = authData.session;
      if (!session && authData.user) {
        // Fallback: establish session immediately if signUp returned user without session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (!signInError && signInData?.session) {
          session = signInData.session;
        }
      }

      const activeUser = session?.user || authData.user;

      if (activeUser) {
        // 3. Start the "Post Your Requirement" popup timer (2-3 minutes) from this exact signup timestamp
        try {
          const now = Date.now().toString();
          localStorage.setItem(`req_timer_start_${activeUser.id}`, now);
          localStorage.removeItem(`req_prompt_dismissed_${activeUser.id}`);
          localStorage.removeItem(`req_submitted_${activeUser.id}`);
        } catch (storageErr) {
          console.warn("Requirement timer init note:", storageErr);
        }

        // 2. Ensure profile row exists immediately in profiles table
        try {
          await supabase.from("profiles").upsert(
            {
              id: activeUser.id,
              email: data.email,
              name: data.name,
              phone: data.phone,
              gender: data.gender,
              address: data.address || "",
              pincode: data.pincode || "",
              role: "user",
            },
            { onConflict: "id" }
          );
        } catch (profileErr) {
          console.warn("Direct profile upsert fallback note:", profileErr);
        }
      }

      setIsSuccess(true);
      toast.success("Account created successfully! Welcome to Sri Kubera.");

      // 1. Redirect straight to the intended page (the redirect param, or /dashboard)
      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 500);
    } catch (err: any) {
      console.error("Signup exception:", err);
      const isNetwork =
        err?.message?.includes("fetch") ||
        err?.name === "TypeError" ||
        (typeof navigator !== "undefined" && !navigator.onLine);
      const msg = isNetwork
        ? "Unable to connect to the server. Please check your internet connection and try again."
        : err?.message || "An unexpected error occurred during signup. Please try again.";
      setAuthError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-up" noValidate>
      {authError && (
        <div
          id="signup-error-alert"
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs font-medium animate-fade-up"
        >
          <AlertCircle size={16} className="shrink-0 text-red-600" aria-hidden="true" />
          <span>{authError}</span>
        </div>
      )}

      {/* Row 1: Name and Phone with staggered entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-up delay-100">
        {/* Name */}
        <div>
          <label htmlFor="signup-name" className="input-label">
            Full Name *
          </label>
          <div className="relative group">
            <div
              className={`flex items-center gap-2.5 w-full px-3.5 py-3 rounded-xl border ${
                errors.name ? "border-red-500" : "border-ivory-300"
              } bg-white shadow-sm focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 transition-all`}
            >
              <User size={16} className="text-navy-400 shrink-0" aria-hidden="true" />
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                placeholder="Rajesh Kumar"
                className="w-full bg-transparent border-0 outline-none text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none p-0"
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
            </div>
            <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 ease-out origin-center rounded-full pointer-events-none" />
          </div>
          {errors.name && (
            <p id="name-error" className="input-error mt-1 text-xs text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="signup-phone" className="input-label">
            Mobile Number *
          </label>
          <div className="relative group">
            <div
              className={`flex items-center gap-2.5 w-full px-3.5 py-3 rounded-xl border ${
                errors.phone ? "border-red-500" : "border-ivory-300"
              } bg-white shadow-sm focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 transition-all`}
            >
              <Phone size={16} className="text-navy-400 shrink-0" aria-hidden="true" />
              <input
                id="signup-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="9876543210"
                className="w-full bg-transparent border-0 outline-none text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none p-0"
                aria-invalid={errors.phone ? "true" : "false"}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                {...register("phone")}
              />
            </div>
            <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 ease-out origin-center rounded-full pointer-events-none" />
          </div>
          {errors.phone && (
            <p id="phone-error" className="input-error mt-1 text-xs text-red-600">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Email and Gender with staggered entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-up delay-200">
        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="input-label">
            Email Address *
          </label>
          <div className="relative group">
            <div
              className={`flex items-center gap-2.5 w-full px-3.5 py-3 rounded-xl border ${
                errors.email ? "border-red-500" : "border-ivory-300"
              } bg-white shadow-sm focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 transition-all`}
            >
              <Mail size={16} className="text-navy-400 shrink-0" aria-hidden="true" />
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className="w-full bg-transparent border-0 outline-none text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none p-0"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
            </div>
            <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 ease-out origin-center rounded-full pointer-events-none" />
          </div>
          {errors.email && (
            <p id="email-error" className="input-error mt-1 text-xs text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="input-label">Gender *</label>
          <div className="flex gap-2.5 pt-0.5">
            <label
              htmlFor="gender-male"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-ivory-300 bg-white cursor-pointer hover:border-gold-400 has-[:checked]:border-gold-500 has-[:checked]:bg-gold-50/60 has-[:checked]:text-navy-950 transition-all shadow-sm text-xs font-semibold text-navy-700"
            >
              <input
                id="gender-male"
                type="radio"
                value="male"
                className="accent-[#C9A24B] cursor-pointer"
                {...register("gender")}
              />
              <span>Male</span>
            </label>
            <label
              htmlFor="gender-female"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-ivory-300 bg-white cursor-pointer hover:border-gold-400 has-[:checked]:border-gold-500 has-[:checked]:bg-gold-50/60 has-[:checked]:text-navy-950 transition-all shadow-sm text-xs font-semibold text-navy-700"
            >
              <input
                id="gender-female"
                type="radio"
                value="female"
                className="accent-[#C9A24B] cursor-pointer"
                {...register("gender")}
              />
              <span>Female</span>
            </label>
          </div>
          {errors.gender && (
            <p id="gender-error" className="input-error mt-1 text-xs text-red-600">
              {errors.gender.message}
            </p>
          )}
        </div>
      </div>

      {/* Row 3: Optional Address & Pincode with staggered entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 animate-fade-up delay-250">
        <div className="sm:col-span-2">
          <label htmlFor="signup-address" className="input-label flex items-center justify-between">
            <span>Location / Area</span>
            <span className="text-[10px] text-navy-400 font-normal">Optional</span>
          </label>
          <div className="relative group">
            <div className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white shadow-sm focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 transition-all">
              <MapPin size={15} className="text-navy-400 shrink-0" aria-hidden="true" />
              <input
                id="signup-address"
                type="text"
                autoComplete="street-address"
                placeholder="White Town, Puducherry"
                className="w-full bg-transparent border-0 outline-none text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none p-0"
                {...register("address")}
              />
            </div>
            <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 ease-out origin-center rounded-full pointer-events-none" />
          </div>
        </div>

        <div>
          <label htmlFor="signup-pincode" className="input-label flex items-center justify-between">
            <span>Pincode</span>
            <span className="text-[10px] text-navy-400 font-normal">Optional</span>
          </label>
          <div className="relative group">
            <div
              className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl border ${
                errors.pincode ? "border-red-500" : "border-ivory-300"
              } bg-white shadow-sm focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 transition-all`}
            >
              <Hash size={15} className="text-navy-400 shrink-0" aria-hidden="true" />
              <input
                id="signup-pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="postal-code"
                placeholder="605001"
                className="w-full bg-transparent border-0 outline-none text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none p-0"
                aria-invalid={errors.pincode ? "true" : "false"}
                aria-describedby={errors.pincode ? "pincode-error" : undefined}
                {...register("pincode")}
              />
            </div>
            <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 ease-out origin-center rounded-full pointer-events-none" />
          </div>
          {errors.pincode && (
            <p id="pincode-error" className="input-error mt-1 text-xs text-red-600">
              {errors.pincode.message}
            </p>
          )}
        </div>
      </div>

      {/* Row 4: Passwords with staggered entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-up delay-300">
        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="input-label">
            Password *
          </label>
          <div className="relative group">
            <div
              className={`flex items-center gap-2.5 w-full px-3.5 py-3 rounded-xl border ${
                errors.password ? "border-red-500" : "border-ivory-300"
              } bg-white shadow-sm focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 transition-all`}
            >
              <Lock size={16} className="text-navy-400 shrink-0" aria-hidden="true" />
              <input
                id="signup-password"
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 chars"
                className="w-full bg-transparent border-0 outline-none text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none p-0"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-navy-400 hover:text-navy-700 transition-colors shrink-0 p-1"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 ease-out origin-center rounded-full pointer-events-none" />
          </div>
          {errors.password && (
            <p id="password-error" className="input-error mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="signup-confirm" className="input-label">
            Confirm Password *
          </label>
          <div className="relative group">
            <div
              className={`flex items-center gap-2.5 w-full px-3.5 py-3 rounded-xl border ${
                errors.confirmPassword ? "border-red-500" : "border-ivory-300"
              } bg-white shadow-sm focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 transition-all`}
            >
              <Lock size={16} className="text-navy-400 shrink-0" aria-hidden="true" />
              <input
                id="signup-confirm"
                type={showConfirmPass ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-type password"
                className="w-full bg-transparent border-0 outline-none text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none p-0"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="text-navy-400 hover:text-navy-700 transition-colors shrink-0 p-1"
                aria-label={showConfirmPass ? "Hide password" : "Show password"}
              >
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 ease-out origin-center rounded-full pointer-events-none" />
          </div>
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="input-error mt-1 text-xs text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* Password Strength Indicator Hints */}
      {watchedPassword.length > 0 && (
        <div className="bg-ivory-100/90 border border-ivory-300/80 rounded-xl p-3 space-y-2 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-navy-700">Password Strength</span>
            <span className="text-[11px] font-bold text-navy-900">{passwordStrength.label}</span>
          </div>
          {/* 4-bar progress indicator */}
          <div className="grid grid-cols-4 gap-1.5 h-1.5">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`rounded-full transition-colors duration-300 ${
                  step <= passwordStrength.score ? passwordStrength.colorClass : "bg-ivory-300"
                }`}
              />
            ))}
          </div>
          {/* Checklist Pills */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-[10px] text-navy-600">
            <span className={`flex items-center gap-1 ${passwordStrength.criteria.hasLength ? "text-emerald-700 font-bold" : ""}`}>
              <Check size={11} className={passwordStrength.criteria.hasLength ? "text-emerald-600" : "text-navy-300"} />
              8+ Characters
            </span>
            <span className={`flex items-center gap-1 ${passwordStrength.criteria.hasUpper ? "text-emerald-700 font-bold" : ""}`}>
              <Check size={11} className={passwordStrength.criteria.hasUpper ? "text-emerald-600" : "text-navy-300"} />
              1 Uppercase
            </span>
            <span className={`flex items-center gap-1 ${passwordStrength.criteria.hasNumber ? "text-emerald-700 font-bold" : ""}`}>
              <Check size={11} className={passwordStrength.criteria.hasNumber ? "text-emerald-600" : "text-navy-300"} />
              1 Number
            </span>
            <span className={`flex items-center gap-1 ${passwordStrength.criteria.hasSpecial ? "text-emerald-700 font-bold" : ""}`}>
              <Check size={11} className={passwordStrength.criteria.hasSpecial ? "text-emerald-600" : "text-navy-300"} />
              Special symbol
            </span>
          </div>
        </div>
      )}

      {/* Terms and Privacy Policy Consent */}
      <div className="pt-1 animate-fade-up delay-300">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            id="signup-agree-terms"
            {...register("agreeToTerms")}
            className="mt-1 h-4 w-4 rounded border-navy-300 text-gold-600 focus:ring-gold-500 accent-gold-600 transition-colors"
          />
          <span className="text-xs text-navy-600 leading-relaxed">
            I agree to the{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-gold-700 font-semibold underline underline-offset-2 hover:text-gold-800"
            >
              Terms of Service &amp; Privacy Policy
            </Link>{" "}
            and consent to receive event communications.
          </span>
        </label>
        {errors.agreeToTerms && (
          <p id="terms-error" className="input-error mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.agreeToTerms.message}
          </p>
        )}
      </div>

      {/* Submit Button with Loading & Success Animation */}
      <div className="pt-2 animate-fade-up delay-350">
        <button
          type="submit"
          disabled={loading || isSuccess}
          className={`btn-primary w-full py-4 text-base font-bold justify-center rounded-xl shadow-md transition-all duration-300 ${
            isSuccess ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-600" : ""
          }`}
        >
          {isSuccess ? (
            <div className="flex items-center gap-2 animate-pop-success">
              <CheckCircle2 size={20} className="text-white" />
              <span>Account created! Redirecting...</span>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              <span>Creating your account...</span>
            </div>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </div>

      {/* Link to Login */}
      <p className="text-center text-sm text-navy-500 pt-1 animate-fade-up delay-400">
        Already have an account?{" "}
        <Link
          href={
            redirectTo && redirectTo !== "/enquiries"
              ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
              : "/login"
          }
          className="text-gold-700 font-bold hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-ivory-100">
      {/* ── MOBILE COMPACT BANNER (visible on mobile/tablet) ── */}
      <div className="lg:hidden relative h-48 sm:h-56 w-full overflow-hidden shrink-0 bg-navy-950">
        <Image
          src="/assets/marriage-02.jpeg"
          alt="Royal Celebration Stage Décor"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45 animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/60 to-ivory-100" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 z-10">
          <Link href="/" className="inline-block mb-2">
            <div className="relative w-11 h-11 rounded-full overflow-hidden mx-auto border-2 border-[#C9A24B]/70 shadow-md">
              <Image
                src="/assets/logo.jpeg"
                alt="Sri Kubera Decor & Events Logo"
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </div>
          </Link>
          <h1
            className="text-2xl font-bold text-white tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Create Your Account
          </h1>
          <p className="text-ivory-200 text-xs mt-0.5">
            Join Sri Kubera for full stage collections &amp; seamless event planning
          </p>
        </div>
      </div>

      {/* ── DESKTOP LEFT PANEL (Full Height with subtle Ken Burns) ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-navy-950">
        <Image
          src="/assets/marriage-02.jpeg"
          alt="Grand Celebration Stage by Sri Kubera"
          fill
          priority
          sizes="42vw"
          className="object-cover opacity-55 animate-ken-burns"
        />
        {/* Luxury Navy & Emerald Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/90 via-navy-900/80 to-emerald-950/85" />

        {/* Ambient radial glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gold-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 lg:p-14 text-white">
          {/* Top Brand Tag */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gold-400/60 shadow-lg shrink-0">
              <Image
                src="/assets/logo.jpeg"
                alt="Sri Kubera Decor Logo"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <p
                className="font-bold text-white text-lg tracking-wider"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Sri Kubera
              </p>
              <p className="text-[11px] text-gold-400 font-semibold tracking-[0.2em] uppercase">
                Decor &amp; Events
              </p>
            </div>
          </div>

          {/* Central Welcome Statement */}
          <div className="max-w-md space-y-4 my-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-400/30 text-gold-300 text-xs font-semibold">
              <Sparkles size={13} className="text-gold-400" />
              <span>Complimentary Membership</span>
            </div>
            <h2
              className="text-4xl xl:text-5xl font-bold text-white leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create Memories<br />
              <span className="text-gradient-gold">That Last Forever</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
            <p className="text-ivory-200 text-sm leading-relaxed">
              Register in under 60 seconds to unlock our complete 35+ stage catalog, transparent pricing, and instant enquiry tracking.
            </p>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-gold-400 shrink-0" />
              <span className="text-ivory-200">Zero Obligation Quote</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-gold-400 shrink-0" />
              <span className="text-ivory-200">Exclusive Member Themes</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form Card) ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-14 -mt-6 sm:-mt-8 lg:mt-0 relative z-10">
        <div className="w-full max-w-xl">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-900 text-sm mb-6 transition-colors font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>

          {/* Desktop Brand Header */}
          <div className="hidden lg:block mb-7">
            <h1
              className="text-3xl font-bold text-navy-950 mb-1.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create your account
            </h1>
            <p className="text-navy-500 text-sm">
              Free to register. Browse complete design collections and track your event requirements.
            </p>
          </div>

          {/* Form Card (Ivory/Glass styling) */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-9 shadow-xl border border-ivory-300 relative overflow-hidden">
            {/* Top Gold Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />

            <Suspense
              fallback={
                <div className="space-y-4 animate-pulse py-4">
                  <div className="h-10 bg-ivory-200 rounded-xl" />
                  <div className="h-10 bg-ivory-200 rounded-xl" />
                  <div className="h-10 bg-ivory-200 rounded-xl" />
                  <div className="h-12 bg-gold-200/50 rounded-xl mt-6" />
                </div>
              }
            >
              <SignupForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
