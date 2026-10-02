"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Phone, MapPin, Hash, Save } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  gender: z.enum(["male", "female"]).optional(),
  address: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        reset({
          name: data.name,
          phone: data.phone,
          gender: data.gender || undefined,
          address: data.address || "",
          pincode: data.pincode || "",
        });
      }
      setFetching(false);
    }
    load();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!profile) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: data.name,
        phone: data.phone,
        gender: data.gender,
        address: data.address,
        pincode: data.pincode,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update profile. Please try again.");
    } else {
      toast.success("Profile updated successfully");
      setProfile((prev) => prev ? { ...prev, ...data } : prev);
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="py-20 bg-cream-100 min-h-screen">
        <div className="page-container max-w-2xl mx-auto">
          <div className="card p-8 animate-pulse space-y-4">
            <div className="h-6 bg-cream-300 rounded w-1/3" />
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-cream-200 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="page-container max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-navy-900">My Profile</h1>
          <p className="text-navy-500 text-sm mt-1">Update your personal information.</p>
        </div>

        <div className="card p-8">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-cream-200">
            <div className="w-16 h-16 rounded-full bg-navy-gradient flex items-center justify-center">
              <span className="text-white text-2xl font-serif font-bold">
                {profile?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-serif font-bold text-navy-900 text-lg">{profile?.name}</p>
              <p className="text-navy-500 text-sm">{profile?.email}</p>
              <span className="badge bg-navy-100 text-navy-700 text-xs mt-1">{profile?.role}</span>
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="mb-4">
            <label className="input-label">Email Address <span className="text-navy-400 font-normal">(read-only)</span></label>
            <input type="email" readOnly value={profile?.email || ""} className="input-field bg-cream-100 cursor-not-allowed text-navy-500" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="profile-name" className="input-label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                <input id="profile-name" type="text" className="input-field pl-10" {...register("name")} />
              </div>
              {errors.name && <p className="input-error">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="profile-phone" className="input-label">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                <input id="profile-phone" type="tel" className="input-field pl-10" {...register("phone")} />
              </div>
              {errors.phone && <p className="input-error">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="input-label">Gender</label>
              <div className="flex gap-4">
                {(["male", "female"] as const).map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value={g} {...register("gender")} className="accent-gold-500" id={`profile-gender-${g}`} />
                    <span className="text-sm text-navy-700 capitalize">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="profile-address" className="input-label">Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-navy-400" />
                <textarea id="profile-address" rows={2} className="input-field pl-10 resize-none" {...register("address")} />
              </div>
            </div>

            <div>
              <label htmlFor="profile-pincode" className="input-label">Pincode</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                <input id="profile-pincode" type="text" maxLength={6} className="input-field pl-10" {...register("pincode")} />
              </div>
              {errors.pincode && <p className="input-error">{errors.pincode.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 justify-center">
              {loading ? <><Loader2 size={18} className="animate-spin" />Saving...</> : <><Save size={18} />Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
