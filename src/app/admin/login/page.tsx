"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";
  const reason = searchParams.get("reason");

  const supabase = createClient();

  useEffect(() => {
    if (reason === "session_expired") {
      toast.error("Session expired after 12 hours of inactivity. Please sign in again.");
    }
  }, [reason]);

  // Handle countdown timer if locked out
  useEffect(() => {
    if (lockoutTime <= 0) return;
    const interval = setInterval(() => {
      setLockoutTime((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutTime > 0) {
      toast.error(`Too many failed attempts. Please wait ${lockoutTime} seconds.`);
      return;
    }

    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setLockoutTime(60);
          toast.error("Too many failed attempts. Please wait 60 seconds.");
        } else {
          toast.error("Incorrect email or password");
        }
        setLoading(false);
        return;
      }

      // Verify admin role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        toast.error("Access denied. This account does not have administrator privileges.");
        setLoading(false);
        return;
      }

      toast.success("Welcome back, Administrator");
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#E8E2D5] p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0B4A3A] text-[#C9A24B] shadow-md mb-4">
            <Shield size={28} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
            Admin Sign In
          </h1>
          <p className="text-sm text-[#5D6D67] mt-1.5 font-sans">
            Sri Kubera Decor &amp; Events Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field with leading icon */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold uppercase tracking-wider text-[#17211E] mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none">
                <Mail size={18} />
              </div>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@srikuberadecor.com"
                disabled={loading || lockoutTime > 0}
                className="w-full min-h-[44px] text-[16px] sm:text-sm pl-11 pr-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/50 text-[#17211E] placeholder:text-[#5D6D67]/60 focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Field with leading and trailing icons */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold uppercase tracking-wider text-[#17211E] mb-2"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none">
                <Lock size={18} />
              </div>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading || lockoutTime > 0}
                className="w-full min-h-[44px] text-[16px] sm:text-sm pl-11 pr-11 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/50 text-[#17211E] placeholder:text-[#5D6D67]/60 focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] hover:text-[#17211E] transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {lockoutTime > 0 && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 text-center">
              Too many failed login attempts. Retry available in {lockoutTime}s.
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || lockoutTime > 0}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white font-medium text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin text-[#C9A24B]" />
                Verifying Credentials...
              </>
            ) : (
              <>
                <Shield size={18} className="text-[#C9A24B]" />
                Sign In to Admin
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E8E2D5] text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#5D6D67] hover:text-[#0B4A3A] transition-colors font-medium"
          >
            <ArrowLeft size={14} />
            Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#0B4A3A]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
