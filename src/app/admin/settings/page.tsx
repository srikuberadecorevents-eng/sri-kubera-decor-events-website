"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, Phone, MapPin, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { BusinessSettings } from "@/types";

const schema = z.object({
  phone: z.string().optional(),
  whatsapp_number: z.string().optional(),
  address: z.string().optional(),
  map_link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    supabase.from("business_settings").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) {
        reset({
          phone: data.phone || "",
          whatsapp_number: data.whatsapp_number || "",
          address: data.address || "",
          map_link: data.map_link || "",
          facebook: data.social_links?.facebook || "",
          instagram: data.social_links?.instagram || "",
          youtube: data.social_links?.youtube || "",
        });
      }
      setLoading(false);
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    const { error } = await supabase.from("business_settings").upsert({
      id: 1,
      phone: data.phone,
      whatsapp_number: data.whatsapp_number,
      address: data.address,
      map_link: data.map_link,
      social_links: {
        facebook: data.facebook,
        instagram: data.instagram,
        youtube: data.youtube,
      },
    });

    if (error) toast.error("Failed to save settings");
    else toast.success("Business settings saved successfully");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="card p-8 animate-pulse space-y-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-cream-200 rounded" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-navy-900">Business Settings</h1>
        <p className="text-navy-500 text-sm mt-1">Update contact information displayed on the public site.</p>
      </div>

      <div className="card p-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="pb-4 border-b border-cream-200">
            <h2 className="font-semibold text-navy-800 mb-4">Contact Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settings-phone" className="input-label">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input id="settings-phone" type="text" className="input-field pl-10" {...register("phone")} />
                </div>
              </div>
              <div>
                <label htmlFor="settings-wa" className="input-label">WhatsApp Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input id="settings-wa" type="text" placeholder="91XXXXXXXXXX" className="input-field pl-10" {...register("whatsapp_number")} />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="settings-address" className="input-label">Business Address</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-3.5 text-navy-400" />
                <textarea id="settings-address" rows={2} className="input-field pl-10 resize-none" {...register("address")} />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="settings-map" className="input-label">Google Maps Embed URL</label>
              <div className="relative">
                <LinkIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                <input id="settings-map" type="url" placeholder="https://maps.google.com/..." className="input-field pl-10" {...register("map_link")} />
              </div>
              {errors.map_link && <p className="input-error">{errors.map_link.message}</p>}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-navy-800 mb-4">Social Links</h2>
            <div className="space-y-4">
              {[
                { id: "settings-facebook", label: "Facebook URL", key: "facebook" as const },
                { id: "settings-instagram", label: "Instagram URL", key: "instagram" as const },
                { id: "settings-youtube", label: "YouTube URL", key: "youtube" as const },
              ].map(({ id, label, key }) => (
                <div key={key}>
                  <label htmlFor={id} className="input-label">{label}</label>
                  <input id={id} type="url" placeholder="https://..." className="input-field" {...register(key)} />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 justify-center">
            {saving ? <><Loader2 size={18} className="animate-spin" />Saving...</> : <><Save size={18} />Save Settings</>}
          </button>
        </form>
      </div>
    </div>
  );
}
