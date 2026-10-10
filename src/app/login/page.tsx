"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoSigningIn, setAutoSigningIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const signupMsg = searchParams.get("signup") === "check-email";
  const errorParam = searchParams.get("error");
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    if (errorParam) {
      toast.error(errorParam);
    }

    async function handleAutoAuth() {
      // 1. If PKCE code is in the query params (e.g. redirected from email confirmation)
      if (code) {
        setAutoSigningIn(true);
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            toast.success("Email confirmed! Signing you in automatically...");
            router.push(redirectTo);
            router.refresh();
            return;
          } else {
            console.error("Code exchange error:", error);
            toast.error(error.message || "Failed to confirm email.");
            if (mounted) setAutoSigningIn(false);
          }
        } catch (err: any) {
          console.error("Auth error:", err);
          if (mounted) setAutoSigningIn(false);
        }
      }

      // 2. If token_hash and type are present in query params
      if (tokenHash && type) {
        setAutoSigningIn(true);
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });
          if (!error) {
            toast.success("Email confirmed! Signing you in automatically...");
            router.push(redirectTo);
            router.refresh();
            return;
          } else {
            toast.error(error.message || "Failed to verify email.");
            if (mounted) setAutoSigningIn(false);
          }
        } catch (err: any) {
          console.error("Verify OTP error:", err);
          if (mounted) setAutoSigningIn(false);
        }
      }

      // 3. If user is already authenticated (or already signed in from /auth/callback)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && mounted) {
        setAutoSigningIn(true);
        toast.success("Email confirmed! Welcome back.");
        router.push(redirectTo);
        router.refresh();
        return;
      }
    }

    handleAutoAuth();

    // 4. Listen for auth changes (such as client-side hash token exchange #access_token=...)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user && mounted) {
        setAutoSigningIn(true);
        toast.success("Email verified! Redirecting to dashboard...");
        router.push(redirectTo);
        router.refresh();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [code, tokenHash, type, errorParam, redirectTo, router, supabase]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Invalid email or password. Please try again."
          : error.message
      );
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push(redirectTo);
    router.refresh();
  };

  if (autoSigningIn) {
    return (
      <div className="text-center py-8 space-y-4 animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-navy-900" style={{ fontFamily: "var(--font-display)" }}>
            Email Confirmed!
          </h2>
          <p className="text-navy-600 text-sm mt-1">
            Signing you in automatically, please wait...
          </p>
        </div>
        <div className="flex justify-center pt-2">
          <Loader2 size={24} className="animate-spin text-gold-500" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {signupMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed flex items-start gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-emerald-800 font-semibold mb-0.5">Please check your email</strong>
            We sent a verification link to your inbox. Click <strong>Confirm your email</strong> to automatically sign in here without typing your password again.
          </div>
        </div>
      )}
      <div>
        <label htmlFor="login-email" className="input-label">
          Email address
        </label>
        <div
          className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-lg border ${
            errors.email ? "border-red-500" : "border-ivory-400"
          } bg-white focus-within:ring-2 focus-within:ring-gold-500 focus-within:border-transparent transition-all shadow-sm`}
        >
          <Mail
            size={18}
            className="text-navy-400 shrink-0"
            aria-hidden="true"
          />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="example@gmail.com"
            className="w-full bg-transparent border-0 outline-none text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none p-0"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "login-email-err" : undefined}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p id="login-email-err" className="input-error">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="login-password" className="input-label">
          Password
        </label>
        <div
          className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-lg border ${
            errors.password ? "border-red-500" : "border-ivory-400"
          } bg-white focus-within:ring-2 focus-within:ring-gold-500 focus-within:border-transparent transition-all shadow-sm`}
        >
          <Lock
            size={18}
            className="text-navy-400 shrink-0"
            aria-hidden="true"
          />
          <input
            id="login-password"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full bg-transparent border-0 outline-none text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none p-0"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "login-pw-err" : undefined}
            {...register("password")}
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
        {errors.password && (
          <p id="login-pw-err" className="input-error">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-4 text-base justify-center"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left: image panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/assets/marriage-01.jpeg"
          alt="Stunning stage decoration by Sri Kubera Decor & Events"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/80 to-navy-900/60" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <p className="section-label text-gold-400 mb-3">Sri Kubera Decor &amp; Events</p>
          <h2
            className="text-4xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            We Decor<br />
            <span className="text-gradient-gold">Your Dreams</span>
          </h2>
          <p className="text-ivory-300 text-sm leading-relaxed max-w-xs">
            Premium stage decorations for weddings, birthdays, and every
            celebration in Puducherry.
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-ivory-50">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-800 text-sm mb-10 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>

          {/* Brand */}
          <div className="mb-8">
            <Link href="/" className="inline-block mb-5">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#C9A24B]/50 shadow-sm">
                  <Image
                    src="/assets/logo.jpeg"
                    alt="Sri Kubera Decor & Events Logo"
                    fill
                    sizes="40px"
                    className="object-cover"
                    priority
                  />
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
              Welcome back
            </h1>
            <p className="text-navy-500 text-sm">
              Sign in to browse designs and manage your enquiries.
            </p>
          </div>

          {/* Form card */}
          <div className="card p-8">
            <Suspense
              fallback={
                <div className="space-y-5 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-ivory-200 rounded-lg" />
                  ))}
                </div>
              }
            >
              <LoginForm />
            </Suspense>

            <p className="text-center text-sm text-navy-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-gold-600 font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
