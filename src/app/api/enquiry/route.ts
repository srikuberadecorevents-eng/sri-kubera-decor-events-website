import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { INITIAL_DESIGNS } from "@/data/initialDesigns";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const { design_id } = body;

    if (!design_id) {
      return NextResponse.json({ error: "Design ID is required" }, { status: 400 });
    }

    // Fetch the design
    let designTitle = "";
    let validDesignId: string | null = null;

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
      if (!fallback) {
        return NextResponse.json({ error: "Design not found" }, { status: 404 });
      }
      designTitle = fallback.title;
      validDesignId = null;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email, phone")
      .eq("id", user.id)
      .single();

    // Generate unique enquiry_id using DB function
    const { data: enquiryIdData, error: fnError } = await supabase
      .rpc("generate_enquiry_id");

    // Fallback ID generator in case RPC function isn't yet migrated
    const enquiry_id =
      enquiryIdData || `A${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        enquiry_id,
        user_id: user.id,
        design_id: validDesignId,
        admin_notes: validDesignId ? null : `Enquired design: ${designTitle}`,
        status: "pending",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking insert error:", bookingError);
      return NextResponse.json({ error: "Failed to create enquiry" }, { status: 500 });
    }

    // Send confirmation email via Resend (non-blocking — do not fail if email fails)
    if (profile?.email && process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const bookingDate = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com",
        to: profile.email,
        subject: `Enquiry Confirmed — ${enquiry_id} | Sri Kubera Decor & Events`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  body { font-family: Georgia, serif; background: #f9f5ec; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; }
  .header { background: #1F3A5F; padding: 32px; text-align: center; }
  .header h1 { color: #C9A227; font-size: 22px; margin: 0 0 4px; }
  .header p { color: #d9c49a; font-size: 13px; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
  .body { padding: 32px; }
  .id-box { background: #1F3A5F; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0; }
  .id-box .label { color: #C9A227; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; font-family: Arial, sans-serif; }
  .id-box .id { color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 4px; }
  .detail { color: #1a2535; font-size: 14px; line-height: 1.7; }
  .detail strong { color: #1F3A5F; }
  .footer { background: #f4eddb; padding: 20px 32px; text-align: center; }
  .footer p { color: #7a6a4a; font-size: 12px; margin: 4px 0; font-family: Arial, sans-serif; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Sri Kubera Decor &amp; Events</h1>
    <p>We Decor Your Dreams</p>
  </div>
  <div class="body">
    <p class="detail">Dear ${profile.name},</p>
    <p class="detail">
      Your enquiry has been received successfully. Please keep your Enquiry ID
      handy when contacting us to finalise your booking.
    </p>
    <div class="id-box">
      <div class="label">Your Enquiry ID</div>
      <div class="id">${enquiry_id}</div>
    </div>
    <p class="detail">
      <strong>Design:</strong> ${designTitle}<br />
      <strong>Date:</strong> ${bookingDate}<br />
      <strong>Status:</strong> Pending Review
    </p>
    <p class="detail" style="margin-top: 20px;">
      To confirm your booking and discuss pricing, please contact us directly:
    </p>
    <p class="detail">
      <strong>Phone / WhatsApp:</strong> 7373876879 / 9486064769<br />
      <strong>Address:</strong> No. 80, Manjini Nagar, Bachanai Madam Street,<br />
      Muthiyal Pettai, Puducherry
    </p>
  </div>
  <div class="footer">
    <p>Sri Kubera Decor &amp; Events &mdash; Puducherry</p>
    <p>This is an automated email. Please do not reply to this address.</p>
  </div>
</div>
</body>
</html>
        `.trim(),
      }).catch((err) => console.error("Email send error:", err));
    }

    // Send alert to business owner (non-blocking)
    const { sendEnquiryNotificationEmail } = await import("@/lib/notifications");
    sendEnquiryNotificationEmail({
      enquiry_id,
      customer_name: profile?.name || "Customer",
      customer_phone: profile?.phone || null,
      customer_email: profile?.email || null,
      design_title: designTitle,
    }).catch((err) => console.error("Admin notification email error:", err));

    return NextResponse.json({
      success: true,
      enquiry_id,
      design_title: designTitle,
      booking_id: booking.id,
    });
  } catch (error) {
    console.error("Enquiry API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
