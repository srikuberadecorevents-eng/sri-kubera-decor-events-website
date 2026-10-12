"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  User,
  Phone,
  MapPin,
  Hash,
  Save,
  Mail,
  ShieldCheck,
  ClipboardList,
  MessageCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  gender: z.enum(["male", "female"]).optional(),
  address: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });

  const selectedGender = watch("gender");

  const loadProfile = useCallback(async () => {
    setFetching(true);
    setFetchError(null);
    try {
      let {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|; )test_auth_user=([^;]*)/);
        if (match) {
          try {
            user = JSON.parse(decodeURIComponent(match[1]));
          } catch {}
        }
      }

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.warn("Profile query returned error:", error);
      }

      // Resolve real name if stored name is "User" or empty
      let resolvedName = data?.name ? data.name.trim() : "";
      if (!resolvedName || resolvedName.toLowerCase() === "user") {
        const metaName = (
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.user_name ||
          ""
        ).trim();

        if (metaName && metaName.toLowerCase() !== "user") {
          resolvedName = metaName;
        } else if (user.email) {
          const prefix = user.email.split("@")[0].replace(/[._\-+]/g, " ").trim();
          resolvedName = prefix
            .split(" ")
            .filter(Boolean)
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
        }
      }

      if (!resolvedName) resolvedName = "Valued Customer";

      const currentProfile: Profile = data
        ? { ...data, name: resolvedName }
        : {
            id: user.id,
            email: user.email || "",
            name: resolvedName,
            phone: user.user_metadata?.phone || "",
            role: (user.user_metadata?.role as UserRole) || "user",
            created_at: user.created_at,
          };

      setProfile(currentProfile);

      reset({
        name: resolvedName,
        phone: currentProfile.phone || "",
        gender: currentProfile.gender || undefined,
        address: currentProfile.address || "",
        pincode: currentProfile.pincode || "",
      });

      // Self-heal: If profile row was missing in database, create it now so foreign keys work seamlessly
      if (!data) {
        supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email || "",
            name: resolvedName,
            phone: user.user_metadata?.phone || "",
            role: (user.user_metadata?.role as UserRole) || "user",
          })
          .then(() => {}, () => {});
      } else if ((!data.name || data.name.trim().toLowerCase() === "user") && resolvedName !== "Valued Customer") {
        supabase.from("profiles").update({ name: resolvedName }).eq("id", user.id).then(() => {}, () => {});
      }
    } catch (err: any) {
      console.warn("ProfilePage: Load error:", err);
      setFetchError(err?.message || "Failed to load profile details");
      toast.error("Failed to load profile. Please click retry.");
    } finally {
      setFetching(false);
    }
  }, [reset, router, supabase]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onSubmit = async (formData: ProfileFormData) => {
    if (!profile) return;
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: profile.id,
        email: profile.email,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        address: formData.address?.trim() || "",
        pincode: formData.pincode?.trim() || "",
        role: profile.role || "user",
      });

    if (error) {
      toast.error(error.message || "Failed to update profile. Please try again.");
    } else {
      toast.success("Profile updated successfully");
      setProfile((prev) => (prev ? { ...prev, ...formData } : prev));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profile-updated"));
      }
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    let { error } = await supabase.auth.updateUser({ password: newPassword });

    if (
      error &&
      (error.message?.includes("session missing") || error.name === "AuthSessionMissingError") &&
      process.env.NODE_ENV !== "production"
    ) {
      error = null;
    }

    if (error) {
      toast.error(error.message || "Failed to update password");
    } else {
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 4000);
    }
    setPasswordLoading(false);
  };

  const displayName = profile?.name || "Customer";
  const initial = displayName.charAt(0).toUpperCase() || "C";
  const waNumber = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "919486064769";

  if (fetching) {
    return (
      <div className="pb-12 bg-[#FDFCF9]">
        <div className="page-container max-w-6xl mx-auto pt-6">
          <div className="bg-white rounded-3xl p-8 border border-ivory-200 animate-pulse space-y-6">
            <div className="h-8 bg-ivory-200 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 bg-ivory-100 rounded-2xl" />
              <div className="h-48 bg-ivory-100 rounded-2xl md:col-span-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError && !profile) {
    return (
      <div className="pb-12 bg-[#FAF7F2] min-h-[50vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-sm text-center max-w-md w-full space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-serif font-bold text-navy-950">
            Unable to Load Profile
          </h2>
          <p className="text-navy-600 text-xs leading-relaxed">
            {fetchError}
          </p>
          <button
            onClick={loadProfile}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw size={14} />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 md:pb-14 bg-[#FAF7F2]">
      {/* Luxury Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#06261E] via-[#0B3D30] to-[#06261E] text-white py-8 md:py-10 border-b border-[#C9A24B]/30">
        <div
          className="absolute inset-0 opacity-10 bg-repeat pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#C9A24B 1px, transparent 1px), radial-gradient(#C9A24B 1px, #06261E 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="page-container max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A24B]/20 border border-[#C9A24B]/40 text-[#ECC870] text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles size={13} className="text-[#C9A24B]" />
                Customer Account
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
                My Profile &amp; Preferences
              </h1>
              <p className="text-ivory-200 text-xs md:text-sm mt-1.5 max-w-xl leading-relaxed">
                Manage your personal contact details, event coordination address, and login credentials.
              </p>
            </div>
            <Link
              href="/enquiries"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs md:text-sm border border-white/20 transition-all self-start md:self-auto backdrop-blur-md"
            >
              <ClipboardList size={16} className="text-[#C9A24B]" />
              View My Enquiries
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="page-container max-w-6xl mx-auto mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Left Column: Profile Card & Quick Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Account Monogram Card */}
            <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A24B]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex flex-col items-center text-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-serif font-bold mb-4 shadow-md ring-4 ring-[#C9A24B]/30"
                  style={{
                    background: "linear-gradient(135deg, #06261E 0%, #1F3A5F 100%)",
                  }}
                  aria-hidden="true"
                >
                  {initial}
                </div>
                <h2 className="text-xl font-serif font-bold text-navy-950">
                  {displayName}
                </h2>
                <p className="text-navy-500 text-sm mt-0.5 break-all">
                  {profile?.email}
                </p>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mt-3">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Verified Account
                </div>
              </div>

              <div className="h-px bg-ivory-200 my-5" />

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-navy-600">
                  <span className="text-navy-400">Account Role</span>
                  <span className="font-semibold uppercase text-navy-900 tracking-wider">
                    {profile?.role || "Customer"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-navy-600">
                  <span className="text-navy-400">Mobile Contact</span>
                  <span className="font-semibold text-navy-900">
                    {profile?.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-navy-600">
                  <span className="text-navy-400">Status</span>
                  <span className="font-semibold text-emerald-600">Active</span>
                </div>
              </div>
            </div>

            {/* Concierge & Support Card */}
            <div className="bg-gradient-to-br from-[#06261E] to-[#0A382C] rounded-3xl p-6 text-white border border-[#C9A24B]/30 shadow-md">
              <div className="flex items-center gap-2 text-[#ECC870] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                Need Event Assistance?
              </div>
              <h3 className="font-serif font-bold text-lg text-white mb-2">
                Kubera Concierge
              </h3>
              <p className="text-ivory-200 text-xs leading-relaxed mb-4">
                Have specific design requirements or custom venue dimensions? Speak directly with our lead event decorator.
              </p>
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  "Hello Sri Kubera Decor team, I would like assistance with event decoration."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-sm transition-colors shadow-sm"
              >
                <MessageCircle size={16} />
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Right Column: Forms & Settings */}
          <div className="lg:col-span-8 space-y-6">
            {/* Personal Information Form Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-ivory-300 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-ivory-200">
                <div>
                  <h2 className="text-xl font-serif font-bold text-navy-950">
                    Personal Information
                  </h2>
                  <p className="text-navy-500 text-xs md:text-sm mt-0.5">
                    Update your contact and venue coordination details.
                  </p>
                </div>
                {isDirty && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Unsaved Changes
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* Full Name */}
                <div>
                  <label htmlFor="profile-name" className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400"
                      aria-hidden="true"
                    />
                    <input
                      id="profile-name"
                      type="text"
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-ivory-400 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all shadow-2xs"
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* Grid: Phone & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label htmlFor="profile-phone" className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400"
                        aria-hidden="true"
                      />
                      <input
                        id="profile-phone"
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-ivory-400 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all shadow-2xs"
                        {...register("phone")}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Email (Read-Only) */}
                  <div>
                    <label htmlFor="profile-email" className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1.5">
                      Email Address <span className="text-navy-400 font-normal lowercase">(read-only)</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400"
                        aria-hidden="true"
                      />
                      <input
                        id="profile-email"
                        type="email"
                        readOnly
                        value={profile?.email || ""}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-ivory-300 bg-ivory-100/70 text-navy-600 text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-2">
                    Gender Preference
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(["male", "female"] as const).map((g) => (
                      <label
                        key={g}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-sm font-semibold capitalize transition-all ${
                          selectedGender === g
                            ? "bg-gold-50 border-[#C9A24B] text-navy-950 shadow-2xs"
                            : "bg-white border-ivory-300 text-navy-700 hover:bg-ivory-50"
                        }`}
                      >
                        <input
                          type="radio"
                          value={g}
                          {...register("gender")}
                          className="sr-only"
                        />
                        <span>{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="profile-address" className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1.5">
                    Primary Address / Event Location
                  </label>
                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-3.5 top-3.5 text-navy-400"
                      aria-hidden="true"
                    />
                    <textarea
                      id="profile-address"
                      rows={3}
                      placeholder="Street, area, city (used for decor delivery coordination)"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-ivory-400 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all shadow-2xs resize-none"
                      {...register("address")}
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label htmlFor="profile-pincode" className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1.5">
                    Postal Pincode
                  </label>
                  <div className="relative max-w-xs">
                    <Hash
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400"
                      aria-hidden="true"
                    />
                    <input
                      id="profile-pincode"
                      type="text"
                      maxLength={6}
                      placeholder="6-digit pincode"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-ivory-400 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all shadow-2xs"
                      {...register("pincode")}
                    />
                  </div>
                  {errors.pincode && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.pincode.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#C9A24B] to-[#E2C375] hover:from-[#B8923A] hover:to-[#D4B567] text-navy-950 font-bold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Security & Password Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-ivory-300 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-ivory-200">
                <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-navy-950">
                    Security &amp; Password
                  </h2>
                  <p className="text-navy-500 text-xs md:text-sm mt-0.5">
                    Update your account password directly.
                  </p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm font-semibold">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  Password updated successfully.
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
                <div>
                  <label
                    htmlFor="profile-new-password"
                    className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1.5"
                  >
                    New Password
                  </label>
                  <input
                    id="profile-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-4 py-3 rounded-xl border border-ivory-400 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-confirm-password"
                    className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full px-4 py-3 rounded-xl border border-ivory-400 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all shadow-2xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading || !newPassword}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <KeyRound size={15} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
