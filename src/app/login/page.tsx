"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const supabase = createClient();

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="login-email" className="input-label">Email address</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="input-field pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && <p className="input-error">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="login-password" className="input-label">Password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            id="login-password"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Your password"
            className="input-field pl-10 pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700"
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="input-error">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3.5 text-base justify-center"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
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
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-2xl font-serif font-bold text-navy-900">Sri Kubera</h1>
            <p className="text-gold-600 text-xs tracking-widest uppercase">Decor &amp; Events</p>
          </Link>
          <h2 className="text-2xl font-serif font-bold text-navy-900 mb-1">Welcome back</h2>
          <p className="text-navy-500 text-sm">
            Sign in to browse designs and manage your enquiries.
          </p>
        </div>

        <div className="card p-8">
          <Suspense fallback={<div className="space-y-5 animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-cream-200 rounded" />)}</div>}>
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
  );
}
