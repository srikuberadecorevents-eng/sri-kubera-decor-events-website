import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, mobile, place } = body;

    if (!name || !mobile) {
      return NextResponse.json(
        { error: "Name and Mobile number are required" },
        { status: 400 }
      );
    }

    const referenceId = `REQ-${Date.now().toString().slice(-6)}`;
    const proprietorWhatsapp =
      process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";

    // Send confirmation email via Resend if configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const emailContent = `
          New Requirement Received:
          -------------------------
          Reference ID: ${referenceId}
          Name: ${name}
          Mobile: ${mobile}
          Email: ${email || "Not provided"}
          Place / Requirement: ${place || "Not provided"}
          Time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
        `;

        await resend.emails.send({
          from:
            process.env.RESEND_FROM_EMAIL ||
            "Sri Kubera Decor <onboarding@resend.dev>",
          to: process.env.ADMIN_ALERT_EMAIL || "srikuberadecorevents@gmail.com",
          subject: `New Requirement from ${name} (${referenceId})`,
          text: emailContent,
        });
      } catch (emailErr) {
        console.warn("Resend email failed:", emailErr);
      }
    }

    // Build pre-filled WhatsApp message URL
    const waText = encodeURIComponent(
      `*New Requirement - Sri Kubera Decor*\n\n` +
        `*Name:* ${name}\n` +
        `*Mobile:* ${mobile}\n` +
        `*Email:* ${email || "N/A"}\n` +
        `*Place / Details:* ${place || "N/A"}\n` +
        `*Reference:* ${referenceId}\n\n` +
        `I would like to get a quote for this decoration requirement.`
    );

    const whatsappUrl = `https://wa.me/${proprietorWhatsapp}?text=${waText}`;

    return NextResponse.json({
      success: true,
      referenceId,
      whatsappUrl,
      message: "Requirement received successfully",
    });
  } catch (error: any) {
    console.error("Requirement submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
