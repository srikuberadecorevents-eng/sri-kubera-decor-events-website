"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, MapPin, Hash } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
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
}).refine((d) => d.password === d.confirmPassword, {
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
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-2xl font-serif font-bold text-navy-900">Sri Kubera</h1>
            <p className="text-gold-600 text-xs tracking-widest uppercase">Decor &amp; Events</p>
          </Link>
          <h2 className="text-2xl font-serif font-bold text-navy-900 mb-1">Create your account</h2>
          <p className="text-navy-500 text-sm">Free to register. Browse designs and raise enquiries instantly.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="signup-name" className="input-label">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input id="signup-name" type="text" placeholder="Saravanan" className="input-field pl-10" {...register("name")} />
                </div>
                {errors.name && <p className="input-error">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="signup-phone" className="input-label">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input id="signup-phone" type="tel" placeholder="9876543210" className="input-field pl-10" {...register("phone")} />
                </div>
                {errors.phone && <p className="input-error">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="input-label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                <input id="signup-email" type="email" placeholder="you@example.com" className="input-field pl-10" {...register("email")} />
              </div>
              {errors.email && <p className="input-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="input-label">Gender</label>
              <div className="flex gap-4">
                {(["male", "female"] as const).map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={g}
                      {...register("gender")}
                      className="accent-gold-500"
                      id={`gender-${g}`}
                    />
                    <span className="text-sm text-navy-700 capitalize">{g}</span>
                  </label>
                ))}
              </div>
              {errors.gender && <p className="input-error">{errors.gender.message}</p>}
            </div>

            <div>
              <label htmlFor="signup-address" className="input-label">
                Address <span className="text-navy-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-navy-400" />
                <textarea
                  id="signup-address"
                  rows={2}
                  placeholder="Your full address"
                  className="input-field pl-10 resize-none"
                  {...register("address")}
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-pincode" className="input-label">
                Pincode <span className="text-navy-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                <input id="signup-pincode" type="text" maxLength={6} placeholder="605001" className="input-field pl-10" {...register("pincode")} />
              </div>
              {errors.pincode && <p className="input-error">{errors.pincode.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="signup-password" className="input-label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input
                    id="signup-password"
                    type={showPass ? "text" : "password"}
                    placeholder="Min 8 chars"
                    className="input-field pl-10 pr-10"
                    {...register("password")}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="input-error">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="signup-confirm" className="input-label">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input
                    id="signup-confirm"
                    type={showPass ? "text" : "password"}
                    placeholder="Repeat password"
                    className="input-field pl-10"
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && <p className="input-error">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base justify-center mt-2">
              {loading ? <><Loader2 size={18} className="animate-spin" />Creating account...</> : "Create Account"}
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
  );
}
