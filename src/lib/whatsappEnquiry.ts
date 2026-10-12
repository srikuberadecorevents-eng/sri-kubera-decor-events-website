"use client";

import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export interface DesignEnquiryInfo {
  id: string;
  title: string;
  category?: string | null;
  imageUrl?: string | null;
}

export interface WhatsAppEnquiryOptions {
  design?: DesignEnquiryInfo | null;
  origin?: string;
  customMessage?: string;
}

let cachedWhatsAppNumber: string | null = null;

/**
 * Normalizes a phone number to digits only with country code (defaults to 91 for India).
 */
export function formatWhatsAppNumber(raw?: string | null): string {
  if (!raw) return "917373876879";
  const cleaned = raw.replace(/\D/g, "");
  if (!cleaned) return "917373876879";

  // If 10 digits (e.g. 7373876879), prepend India country code 91
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  // If starts with 0 and length is 11, replace leading 0 with 91
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `91${cleaned.slice(1)}`;
  }
  return cleaned;
}

/**
 * Reads the business WhatsApp number dynamically from the Supabase business_settings table.
 * Falls back to NEXT_PUBLIC_BUSINESS_WHATSAPP or "917373876879" if not found or on error.
 */
export async function getBusinessWhatsAppNumber(): Promise<string> {
  if (cachedWhatsAppNumber) {
    return cachedWhatsAppNumber;
  }

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("business_settings")
      .select("whatsapp_number")
      .eq("id", 1)
      .maybeSingle();

    if (data?.whatsapp_number) {
      cachedWhatsAppNumber = formatWhatsAppNumber(data.whatsapp_number);
      return cachedWhatsAppNumber;
    }
  } catch (err) {
    console.warn("Could not fetch business_settings WhatsApp number:", err);
  }

  const fallback = formatWhatsAppNumber(
    process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879"
  );
  cachedWhatsAppNumber = fallback;
  return fallback;
}

/**
 * Resolves absolute HTTPS public URL for images and design pages.
 */
export function getAbsoluteUrl(pathOrUrl: string, baseOrigin?: string): string {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const origin =
    baseOrigin ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://srikuberadecor.com");

  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${cleanPath}`;
}

/**
 * Builds the URL-encoded WhatsApp message according to requirements:
 * Includes client name & phone (if logged in), design title, category, design ID,
 * public link (/gallery/[id]), and absolute image URL.
 */
export function buildWhatsAppMessage({
  design,
  clientName,
  clientPhone,
  origin,
}: {
  design?: DesignEnquiryInfo | null;
  clientName?: string | null;
  clientPhone?: string | null;
  origin?: string;
}): string {
  const hasClient = Boolean(clientName && clientName.trim());
  const clientNameStr = hasClient ? clientName?.trim() : "Guest Visitor";
  const clientPhoneStr = clientPhone?.trim() || "Not provided (WhatsApp Chat)";

  if (design && design.id) {
    const designPageUrl = getAbsoluteUrl(`/gallery/${design.id}`, origin);
    const absoluteImageUrl = design.imageUrl
      ? getAbsoluteUrl(design.imageUrl, origin)
      : "";

    return [
      "Hello Sri Kubera Decor & Events!",
      "",
      "I would like to enquire about this stage decoration design:",
      "",
      "*Design Details:*",
      `• Title: ${design.title}`,
      `• Category: ${design.category || "Stage Decoration"}`,
      `• Design ID: ${design.id}`,
      "",
      "*Design Link:*",
      designPageUrl,
      "",
      ...(absoluteImageUrl
        ? ["*Design Photo:*", absoluteImageUrl, ""]
        : []),
      "*Client Contact Details:*",
      `• Name: ${clientNameStr}`,
      `• Phone: ${clientPhoneStr}`,
      "",
      "Please share availability, setup inclusions, and pricing quotation for my event.",
    ].join("\n");
  }

  // Generic message when no design is selected (e.g. floating button)
  return [
    "Hello Sri Kubera Decor & Events!",
    "",
    "I would like to enquire about your stage decoration and event planning services in Puducherry.",
    "",
    "*Client Contact Details:*",
    `• Name: ${clientNameStr}`,
    `• Phone: ${clientPhoneStr}`,
    "",
    "Please share your latest decoration catalogue, package options, and availability.",
  ].join("\n");
}

/**
 * Saves enquiry in Supabase via /api/enquiry/whatsapp.
 * Does not throw; returns success status and enquiry details.
 */
export async function saveEnquiryToSupabase({
  designId,
  message,
  clientName,
  clientPhone,
}: {
  designId?: string | null;
  message: string;
  clientName?: string | null;
  clientPhone?: string | null;
}): Promise<{ success: boolean; enquiry_id?: string; error?: string }> {
  try {
    const res = await fetch("/api/enquiry/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        design_id: designId || null,
        message,
        client_name: clientName || null,
        client_phone: clientPhone || null,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error || "Failed to record enquiry" };
    }
    return { success: true, enquiry_id: data?.enquiry_id };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Network error";
    return { success: false, error: errorMsg };
  }
}

/**
 * Master handler for clicking "Enquire":
 * 1. Resolves logged in client name and phone.
 * 2. Reads WhatsApp number from business_settings table.
 * 3. Builds encoded message text with full design metadata and links.
 * 4. Saves enquiry in Supabase (shows toast if save fails, never blocks WhatsApp).
 * 5. Opens https://wa.me/<number>?text=<encoded> in a new tab with rel="noopener noreferrer".
 */
export async function handleWhatsAppEnquiry(options: WhatsAppEnquiryOptions = {}): Promise<void> {
  const { design } = options;

  let clientName: string | null = null;
  let clientPhone: string | null = null;

  // 1. Check logged in user profile
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        clientName = profile.name || null;
        clientPhone = profile.phone || null;
      }
    }
  } catch {
    // Non-fatal, fallback to guest
  }

  // 2. Read number from settings table (digits only, country code)
  const businessNumber = await getBusinessWhatsAppNumber();

  // 3. Build message text
  const origin =
    options.origin ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://srikuberadecor.com");

  const messageText = options.customMessage || buildWhatsAppMessage({
    design,
    clientName,
    clientPhone,
    origin,
  });

  const waUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent(messageText)}`;

  // 4. Save enquiry in Supabase before opening WhatsApp
  // Must NOT block WhatsApp opening if save fails; show toast.
  try {
    const savePromise = saveEnquiryToSupabase({
      designId: design?.id || null,
      message: messageText,
      clientName,
      clientPhone,
    });

    // 1500ms timeout race so user is never stalled
    const result = await Promise.race([
      savePromise,
      new Promise<{ success: boolean; error: string }>((_, reject) =>
        setTimeout(() => reject(new Error("Save request timeout")), 1500)
      ),
    ]).catch((err) => ({
      success: false,
      error: err?.message || "Save timed out",
    }));

    if (!result.success) {
      toast.error("Could not record enquiry in dashboard, opening WhatsApp now...", {
        duration: 3500,
      });
    }
  } catch {
    toast.error("Could not record enquiry in dashboard, opening WhatsApp now...", {
      duration: 3500,
    });
  }

  // 5. Open wa.me in new tab with rel="noopener noreferrer"
  if (typeof window !== "undefined") {
    const newWindow = window.open(waUrl, "_blank", "noopener,noreferrer");
    // Fallback if browser popup blocker intervened
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      window.location.href = waUrl;
    }
  }
}
