"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Mail,
  Lock,
  Save,
  Loader2,
  Shield,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FormField } from "@/components/admin/FormField";
import type { BusinessSettings } from "@/types";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Business settings fields
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [address, setAddress] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [tagline, setTagline] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");

  // Account settings
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("business_settings")
          .select("*")
          .eq("id", 1)
          .single();

        if (data) {
          setPhone(data.phone || "");
          setWhatsappNumber(data.whatsapp_number || "");
          setAddress(data.address || "");
          setMapLink(data.map_link || "");
          setWorkingHours(data.working_hours || "");
          setNotificationEmail(data.notification_email || "");
          setTagline(data.tagline || "");
          setFacebook(data.social_links?.facebook || "");
          setInstagram(data.social_links?.instagram || "");
          setYoutube(data.social_links?.youtube || "");
        }
      } catch (err) {
        console.error("Load settings error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBusiness(true);
    try {
      const { error } = await supabase.from("business_settings").upsert({
        id: 1,
        phone: phone.trim() || null,
        whatsapp_number: whatsappNumber.trim() || null,
        address: address.trim() || null,
        map_link: mapLink.trim() || null,
        working_hours: workingHours.trim() || null,
        notification_email: notificationEmail.trim() || null,
        tagline: tagline.trim() || null,
        social_links: {
          facebook: facebook.trim(),
          instagram: instagram.trim(),
          youtube: youtube.trim(),
        },
      });

      if (error) throw error;

      const { revalidatePublicPages } = await import("@/app/actions/revalidate");
      await revalidatePublicPages(["/", "/gallery", "/services", "/contact"]);

      toast.success("Business details saved successfully");
    } catch (err: any) {
      console.error("Save business settings error:", err);
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password update error:", err);
      toast.error(err.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSignOutAll = async () => {
    if (!confirm("Are you sure you want to sign out from all active sessions and devices?")) {
      return;
    }

    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success("Signed out from all devices");
      window.location.href = "/admin/login";
    } catch {
      toast.error("Failed to sign out all sessions");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 size={32} className="animate-spin text-[#0B4A3A] mx-auto mb-2" />
        <p className="text-xs text-[#5D6D67]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
          Settings
        </h1>
        <p className="text-sm text-[#5D6D67] mt-1">
          Manage business contact information, notification routing, and administrator account security.
        </p>
      </div>

      {/* 1. Business Contact & Information */}
      <form onSubmit={handleSaveBusiness} className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E]">
            Business Information &amp; Contact
          </h2>
          <button
            type="submit"
            disabled={savingBusiness}
            className="min-h-[40px] px-5 py-2 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {savingBusiness ? (
              <Loader2 size={14} className="animate-spin text-[#C9A24B]" />
            ) : (
              <Save size={14} />
            )}
            Save Business Details
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-phone" className="block text-xs font-semibold text-[#17211E] mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none" />
              <input
                id="settings-phone"
                type="text"
                placeholder="7373876879"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full min-h-[44px] text-[16px] sm:text-sm pl-10 pr-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="settings-wa" className="block text-xs font-semibold text-[#17211E] mb-1">
              WhatsApp Number (with country code)
            </label>
            <div className="relative">
              <MessageCircle size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#25D366] pointer-events-none" />
              <input
                id="settings-wa"
                type="text"
                placeholder="917373876879"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full min-h-[44px] text-[16px] sm:text-sm pl-10 pr-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="settings-hours" className="block text-xs font-semibold text-[#17211E] mb-1">
              Working Hours
            </label>
            <div className="relative">
              <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none" />
              <input
                id="settings-hours"
                type="text"
                placeholder="Mon - Sun: 8:00 AM - 10:00 PM"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full min-h-[44px] text-[16px] sm:text-sm pl-10 pr-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="settings-tagline" className="block text-xs font-semibold text-[#17211E] mb-1">
              Brand Tagline
            </label>
            <input
              id="settings-tagline"
              type="text"
              placeholder="We Decor Your Dreams"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full min-h-[44px] text-[16px] sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            />
          </div>
        </div>

        {/* Notification Email */}
        <div>
          <label htmlFor="settings-notif-email" className="block text-xs font-semibold text-[#17211E] mb-1">
            Admin Notification Email (Receives alerts on new enquiries &amp; requirements)
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none" />
            <input
              id="settings-notif-email"
              type="email"
              placeholder="saravanan@srikuberadecor.com"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="w-full min-h-[44px] text-[16px] sm:text-sm pl-10 pr-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
            />
          </div>
          <p className="text-[11px] text-[#5D6D67] mt-1">
            New customer enquiries and requirements will be delivered to this address via Resend.
          </p>
        </div>

        {/* Address & Maps */}
        <div className="space-y-3">
          <div>
            <label htmlFor="settings-address" className="block text-xs font-semibold text-[#17211E] mb-1">
              Shop &amp; Office Address
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-3 text-[#5D6D67] pointer-events-none" />
              <textarea
                id="settings-address"
                rows={2}
                placeholder="No. 80, Manjini Nagar, Bachanai Madam Street, Muthiyal Pettai, Puducherry"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A] leading-relaxed"
              />
            </div>
          </div>

          <div>
            <label htmlFor="settings-map" className="block text-xs font-semibold text-[#17211E] mb-1">
              Google Maps Location Link
            </label>
            <div className="relative">
              <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none" />
              <input
                id="settings-map"
                type="url"
                placeholder="https://maps.google.com/..."
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                className="w-full min-h-[44px] text-[16px] sm:text-sm pl-10 pr-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="pt-3 border-t border-[#E8E2D5]">
          <h3 className="text-xs font-bold text-[#17211E] mb-3 uppercase tracking-wider">
            Social Media Profiles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[#5D6D67] mb-1">Instagram URL</label>
              <input
                type="text"
                placeholder="https://instagram.com/..."
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#5D6D67] mb-1">Facebook URL</label>
              <input
                type="text"
                placeholder="https://facebook.com/..."
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#5D6D67] mb-1">YouTube URL</label>
              <input
                type="text"
                placeholder="https://youtube.com/..."
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
              />
            </div>
          </div>
        </div>
      </form>

      {/* 2. Administrator Security Settings */}
      <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] border-b border-[#E8E2D5] pb-3 flex items-center gap-1.5">
          <Shield size={16} className="text-[#0B4A3A]" />
          Admin Account &amp; Security
        </h2>

        {/* Change Password */}
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-admin-password" className="block text-xs font-semibold text-[#17211E] mb-1">
                New Password (min 8 characters)
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none" />
                <input
                  id="new-admin-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] text-[16px] sm:text-sm pl-10 pr-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-admin-password" className="block text-xs font-semibold text-[#17211E] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D67] pointer-events-none" />
                <input
                  id="confirm-admin-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] text-[16px] sm:text-sm pl-10 pr-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 text-[#17211E] focus:outline-none focus:ring-2 focus:ring-[#0B4A3A]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={updatingPassword || !newPassword}
            className="min-h-[40px] px-5 py-2 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {updatingPassword ? (
              <Loader2 size={14} className="animate-spin text-[#C9A24B]" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            Update Password
          </button>
        </form>

        {/* Global Sign Out */}
        <div className="pt-4 border-t border-[#E8E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-[#17211E]">
              Sign Out All Sessions
            </h3>
            <p className="text-xs text-[#5D6D67] mt-0.5">
              Invalidate active login sessions on all phones, tablets and browsers.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOutAll}
            className="min-h-[40px] px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <LogOut size={14} />
            Sign Out All Devices
          </button>
        </div>
      </div>
    </div>
  );
}
