import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { INITIAL_DESIGNS } from "@/data/initialDesigns";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check optional authenticated user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const {
      design_id,
      message,
      client_name,
      client_phone,
      event_date,
      venue,
      email,
    } = body;

    let designTitle = "Stage Decoration";
    let validDesignId: string | null = null;

    if (design_id) {
      const { data: design } = await supabase
        .from("designs")
        .select("id, title")
        .eq("id", design_id)
        .maybeSingle();

      if (design) {
        designTitle = design.title;
        validDesignId = design.id;
      } else {
        const fallback = INITIAL_DESIGNS.find((d) => d.id === design_id);
        if (fallback) {
          designTitle = fallback.title;
          const { data: matchedDbDesign } = await supabase
            .from("designs")
            .select("id, title")
            .ilike("title", fallback.title)
            .maybeSingle();
          if (matchedDbDesign) {
            validDesignId = matchedDbDesign.id;
          }
        }
      }
    }

    // Customer profile if logged in
    let customerName = client_name || "Guest Visitor";
    let customerPhone = client_phone || null;
    let customerEmail = email || null;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, phone, email")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        customerName = client_name || profile.name || user.user_metadata?.name || customerName;
        customerPhone = client_phone || profile.phone || user.user_metadata?.phone || customerPhone;
        customerEmail = email || profile.email || user.email || customerEmail;
      }
    }

    // Generate unique enquiry ID
    const { data: enquiryIdData } = await supabase.rpc("generate_enquiry_id");
    const enquiry_id =
      enquiryIdData || `W${Math.floor(1000 + Math.random() * 9000)}`;

    const adminNoteText = `[WhatsApp Enquiry] ${
      customerName ? `Client: ${customerName}. ` : ""
    }${customerPhone ? `Phone: ${customerPhone}. ` : ""}${
      design_id ? `Design: ${designTitle} (ID: ${design_id}). ` : "General Service Enquiry. "
    }${venue ? `Venue: ${venue}. ` : ""}${event_date ? `Event: ${event_date}. ` : ""}${message ? `Message: ${message}` : ""}`;

    // Attempt insert with service role client first (to bypass RLS for guest bookings), fallback to session client
    const { getServiceRoleClient } = await import("@/lib/admin");
    const serviceRoleClient = getServiceRoleClient();
    const db = serviceRoleClient || supabase;

    const bookingPayloadWithMsg: Record<string, any> = {
      enquiry_id,
      user_id: user?.id || null,
      design_id: validDesignId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      event_date: event_date || null,
      venue: venue || null,
      status: "pending",
      message: message || adminNoteText,
      admin_notes: adminNoteText,
    };

    let booking: Record<string, any> | null = null;
    const { data: initialBooking, error: insertError } = await db
      .from("bookings")
      .insert(bookingPayloadWithMsg)
      .select("id")
      .maybeSingle();

    booking = initialBooking;

    if (insertError) {
      console.warn("Retrying booking insert without extra columns:", insertError.message);
      const fallbackPayload: Record<string, any> = {
        enquiry_id,
        user_id: user?.id || null,
        design_id: validDesignId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        status: "pending",
        admin_notes: adminNoteText,
      };

      const retryRes = await db
        .from("bookings")
        .insert(fallbackPayload)
        .select("id")
        .maybeSingle();

      if (retryRes.error) {
        console.warn("Booking insert unhandled by RLS:", retryRes.error.message);
        // Non-blocking response when database RLS restricts unauthenticated guest insert
        return NextResponse.json(
          {
            success: false,
            error: retryRes.error.message,
            enquiry_id,
          },
          { status: 200 }
        );
      }
      booking = retryRes.data;
    }

    // Trigger admin notification email non-blocking
    try {
      const { sendEnquiryNotificationEmail } = await import("@/lib/notifications");
      sendEnquiryNotificationEmail({
        enquiry_id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        design_title: `${designTitle} (WhatsApp)`,
      }).catch((e) => console.error("Admin notification email error:", e));
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      enquiry_id,
      booking_id: booking?.id || null,
      design_title: designTitle,
    });
  } catch (error: any) {
    console.error("WhatsApp enquiry route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
