"use client";

import { Suspense, useState, useEffect } from "react";
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
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotFormData = z.infer<typeof forgotSchema>;

function LoginForm() {
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo =
    searchParams.get("redirectTo") || searchParams.get("redirect") || "/enquiries";
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get("mode") === "forgot") setMode("forgot");
  }, [searchParams]);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const {
    register: forgotRegister,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotFormData>({ resolver: zodResolver(forgotSchema) });

  const onLoginSubmit = async (data: LoginFormData) => {
    if (loading || isSuccess) return;
    setLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      const msg =
        error.message === "Invalid login credentials"
          ? "Invalid email or password. Please try again."
          : error.message;
      setAuthError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    setIsSuccess(true);
    toast.success("Welcome back!");

    let target = redirectTo;
    if (!searchParams.get("redirectTo") && !searchParams.get("redirect")) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userData.user.id)
          .single();
        if (profile?.role === "admin") {
          target = "/admin";
        }
      }
    }

    // Brief animated success state before redirecting
    setTimeout(() => {
      router.push(target);
      router.refresh();
    }, 600);
  };

  const onForgotSubmit = async (data: ForgotFormData) => {
    if (loading) return;
    setLoading(true);
    setAuthError(null);

    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${origin}/auth/callback?next=/profile`,
    });

    setLoading(false);
    if (error) {
      setAuthError(error.message);
      toast.error(error.message);
      return;
    }

    setResetSent(true);
    toast.success("Password reset link sent to your email.");
  };

  return (
    <div>
      {/* ── MODE 1: FORGOT PASSWORD ── */}
      {mode === "forgot" ? (
        <div className="animate-fade-up">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setAuthError(null);
                setResetSent(false);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-navy-900 mb-3 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-400/30 flex items-center justify-center mb-3">
              <KeyRound size={22} className="text-gold-600" />
            </div>
            <h2
              className="text-2xl font-bold text-navy-950"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Reset your password
            </h2>
            <p className="text-navy-500 text-xs sm:text-sm mt-1">
              Enter the email address registered with your Sri Kubera account, and we will send you a secure recovery link.
            </p>
          </div>

          {resetSent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-fade-up">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-bold text-navy-900 text-base mb-1">Check your inbox</h3>
              <p className="text-navy-600 text-xs sm:text-sm leading-relaxed mb-5">
                We have dispatched a password reset link to your email address. Please follow the instructions in the email to set a new password.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setResetSent(false);
                }}
                className="btn-outline text-xs px-5 py-2.5 w-full"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit(onForgotSubmit)} className="space-y-5" noValidate>
              {authError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs font-medium animate-fade-up"
                >
                  <AlertCircle size={16} className="shrink-0 text-red-600" aria-hidden="true" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="input-label flex items-center justify-between">
                  <span>Registered email address</span>
                </label>
                <div className="relative group">
                  <div
                    className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border ${
                      forgotErrors.email ? "border-red-500" : "border-ivory-300"
                    } bg-white shadow-sm focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 transition-all`}
                  >
                    <Mail size={18} className="text-navy-400 shrink-0" aria-hidden="true" />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      className="w-full bg-transparent border-0 outline-none text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none p-0"
                      aria-invalid={forgotErrors.email ? "true" : "false"}
                      aria-describedby={forgotErrors.email ? "reset-email-error" : undefined}
                      {...forgotRegister("email")}
                    />
                  </div>
                  {/* Animated gold underline */}
                  <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 ease-out origin-center rounded-full pointer-events-none" />
                </div>
                {forgotErrors.email && (
                  <p id="reset-email-error" className="input-error mt-1.5 text-xs text-red-600">
                    {forgotErrors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-sm font-bold justify-center rounded-xl shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <span>Send Recovery Email</span>
                )}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* ── MODE 2: SIGN IN ── */
        <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-5 animate-fade-up" noValidate>
          {authError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs font-medium animate-fade-up"
            >
              <AlertCircle size={16} className="shrink-0 text-red-600" aria-hidden="true" />
              <span>{authError}</span>
            </div>
          )}

          {/* Email Field with staggered animation */}
          <div className="animate-fade-up delay-100">
            <label htmlFor="login-email" className="input-label">
              Email address
            </label>
            <div className="relative group">
              <div
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border ${
                  loginErrors.email ? "border-red-500" : "border-ivory-300"
                } bg-white shadow-sm focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 transition-all`}
              >
                <Mail size={18} className="text-navy-400 shrink-0" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="w-full bg-transparent border-0 outline-none text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none p-0"
                  aria-invalid={loginErrors.email ? "true" : "false"}
                  aria-describedby={loginErrors.email ? "email-error" : undefined}
                  {...loginRegister("email")}
                />
              </div>
              {/* Animated gold underline */}
              <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 ease-out origin-center rounded-full pointer-events-none" />
            </div>
            {loginErrors.email && (
              <p id="email-error" className="input-error mt-1.5 text-xs text-red-600">
                {loginErrors.email.message}
              </p>
            )}
          </div>

          {/* Password Field with staggered animation */}
          <div className="animate-fade-up delay-200">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="input-label mb-0">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setAuthError(null);
                }}
                className="text-xs text-gold-700 hover:text-gold-900 font-semibold transition-colors focus:outline-none focus:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative group">
              <div
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border ${
                  loginErrors.password ? "border-red-500" : "border-ivory-300"
                } bg-white shadow-sm focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 transition-all`}
              >
                <Lock size={18} className="text-navy-400 shrink-0" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent border-0 outline-none text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none p-0"
                  aria-invalid={loginErrors.password ? "true" : "false"}
                  aria-describedby={loginErrors.password ? "password-error" : undefined}
                  {...loginRegister("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-navy-400 hover:text-navy-700 transition-colors shrink-0 p-1"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Animated gold underline */}
              <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 ease-out origin-center rounded-full pointer-events-none" />
            </div>
            {loginErrors.password && (
              <p id="password-error" className="input-error mt-1.5 text-xs text-red-600">
                {loginErrors.password.message}
              </p>
            )}
          </div>

          {/* Submit button with loading spinner and animated success state */}
          <div className="animate-fade-up delay-300 pt-2">
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
                  <span>Welcome back! Redirecting...</span>
                </div>
              ) : loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>

          {/* Link to Signup */}
          <p className="text-center text-sm text-navy-500 mt-6 animate-fade-up delay-400">
            Don&apos;t have an account?{" "}
            <Link
              href={
                redirectTo && redirectTo !== "/enquiries"
                  ? `/signup?redirectTo=${encodeURIComponent(redirectTo)}`
                  : "/signup"
              }
              className="text-gold-700 font-bold hover:underline underline-offset-4"
            >
              Create one free
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-ivory-100">
      {/* ── MOBILE COMPACT BANNER (visible on mobile/tablet) ── */}
      <div className="lg:hidden relative h-48 sm:h-56 w-full overflow-hidden shrink-0 bg-navy-950">
        <Image
          src="/assets/marriage-01.jpeg"
          alt="Royal Wedding Stage Décor"
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
            Welcome Back
          </h1>
          <p className="text-ivory-200 text-xs mt-0.5">
            Sign in to explore royal designs and manage bookings
          </p>
        </div>
      </div>

      {/* ── DESKTOP LEFT PANEL (Full Height with subtle Ken Burns) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-navy-950">
        <Image
          src="/assets/marriage-01.jpeg"
          alt="Royal Wedding Mandapam Decor by Sri Kubera"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-55 animate-ken-burns"
        />
        {/* Luxury Navy & Emerald Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/90 via-navy-900/80 to-emerald-950/85" />

        {/* Ambient radial glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gold-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 lg:p-16 text-white">
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
              <span>Puducherry&apos;s Royal Stage Decorators</span>
            </div>
            <h2
              className="text-4xl xl:text-5xl font-bold text-white leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              We Decor<br />
              <span className="text-gradient-gold">Your Dreams</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
            <p className="text-ivory-200 text-sm xl:text-base leading-relaxed">
              Explore our signature portfolio of 35+ wedding mandapams, baby showers, and birthday themes crafted with perfection.
            </p>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-gold-400 shrink-0" />
              <span className="text-ivory-200">300+ Grand Puducherry Celebrations</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-gold-400 shrink-0" />
              <span className="text-ivory-200">Bespoke Floral &amp; LED Lighting</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form Card) ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-16 -mt-6 sm:-mt-8 lg:mt-0 relative z-10">
        <div className="w-full max-w-md">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-900 text-sm mb-6 transition-colors font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>

          {/* Desktop Brand Header */}
          <div className="hidden lg:block mb-8">
            <h1
              className="text-3xl font-bold text-navy-950 mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome back
            </h1>
            <p className="text-navy-500 text-sm">
              Sign in to browse designs, raise enquiries, and track your bookings.
            </p>
          </div>

          {/* Form Card (Ivory/Glass styling) */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-9 shadow-xl border border-ivory-300 relative overflow-hidden">
            {/* Top Gold Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />

            <Suspense
              fallback={
                <div className="space-y-5 animate-pulse py-4">
                  <div className="h-4 bg-ivory-200 rounded w-1/3" />
                  <div className="h-12 bg-ivory-200 rounded-xl" />
                  <div className="h-4 bg-ivory-200 rounded w-1/4" />
                  <div className="h-12 bg-ivory-200 rounded-xl" />
                  <div className="h-12 bg-gold-200/50 rounded-xl mt-6" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
