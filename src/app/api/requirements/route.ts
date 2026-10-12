import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendRequirementNotificationEmail } from "@/lib/notifications";

const requirementSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  place: z.string().trim().min(2, "Please enter your area or city in Puducherry"),
  event_type: z.string().trim().optional().or(z.literal("")),
  event_date: z.string().trim().optional().or(z.literal("")),
  budget: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().optional().or(z.literal("")),
  image_url: z.string().optional().or(z.literal("")),
  hp_website: z.string().optional(), // Honeypot
});

// Simple in-memory rate limiting per IP: max 5 submissions per 10 minutes
const ipRateMap = new Map<string, { count: number; firstSeen: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting check
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "anonymous-client";
    const now = Date.now();
    const clientRecord = ipRateMap.get(ip);

    if (clientRecord) {
      if (now - clientRecord.firstSeen < RATE_LIMIT_WINDOW_MS) {
        if (clientRecord.count >= MAX_REQUESTS_PER_WINDOW) {
          return NextResponse.json(
            { error: "Too many submissions. Please wait a few minutes before trying again." },
            { status: 429 }
          );
        }
        clientRecord.count += 1;
      } else {
        ipRateMap.set(ip, { count: 1, firstSeen: now });
      }
    } else {
      ipRateMap.set(ip, { count: 1, firstSeen: now });
    }

    // 2. Parse and validate body
    const body = await request.json();
    const validation = requirementSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = validation.data;

    // 3. Honeypot check: Bots fill hidden inputs
    if (data.hp_website && data.hp_website.trim().length > 0) {
      // Silently return success to mislead spambots
      return NextResponse.json({ success: true, message: "Requirement received" });
    }

    // 4. Insert into database
    const supabase = await createClient();
    const fullMessage = data.message?.trim() || null;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const insertPayload: Record<string, any> = {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      place: data.place,
      event_type: data.event_type || null,
      event_date: data.event_date || null,
      budget: data.budget || null,
      message: fullMessage,
      image_url: data.image_url || null,
      status: "new",
    };

    if (user) {
      insertPayload.user_id = user.id;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("requirements")
      .insert(insertPayload)
      .select("id")
      .single();

    if (user && !insertError) {
      await supabase
        .from("profiles")
        .update({ requirement_prompt_dismissed_at: new Date().toISOString() })
        .eq("id", user.id);
    }

    if (insertError) {
      console.error("Requirement DB insert error:", insertError);
      return NextResponse.json(
        { error: "Unable to record requirement. Please try calling us directly." },
        { status: 500 }
      );
    }

    // 5. Send notification email to admin (non-blocking)
    sendRequirementNotificationEmail({
      id: inserted.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      place: data.place,
      event_type: data.event_type,
      event_date: data.event_date,
      message: fullMessage,
    }).catch((err) => console.error("Requirement notification email error:", err));

    return NextResponse.json({
      success: true,
      id: inserted.id,
      message: "Requirement submitted successfully",
    });
  } catch (err) {
    console.error("Requirements route exception:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
