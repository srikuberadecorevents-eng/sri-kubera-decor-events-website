import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { data: booking } = await supabase
      .from("bookings")
      .select("*, designs(title, image_url, price), profiles(name, email, phone), booking_private(quoted_price)")
      .eq("id", id)
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only own booking or admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (booking.user_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Extract quoted price if admin or available
    const rawQuoted = Array.isArray(booking.booking_private)
      ? booking.booking_private[0]?.quoted_price
      : booking.booking_private?.quoted_price;
    const finalAmount = rawQuoted || booking.designs?.price;

    // Generate PDF using jsPDF
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // Header background
    doc.setFillColor(31, 58, 95);
    doc.rect(0, 0, pageWidth, 50, "F");

    // Business name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(201, 162, 39);
    doc.text("Sri Kubera Decor & Events", margin, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(217, 196, 154);
    doc.text("We Decor Your Dreams", margin, 30);

    doc.setFontSize(8);
    doc.text("No. 80, Manjini Nagar, Bachanai Madam Street, Muthiyal Pettai, Puducherry", margin, 38);
    doc.text("Phone: 7373876879 / 9486064769", margin, 44);

    y = 65;

    // Enquiry ID box
    doc.setFillColor(249, 245, 236);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 4, 4, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 80, 30);
    doc.text(
      finalAmount ? "OFFICIAL QUOTATION & BOOKING RECEIPT" : "ENQUIRY RECEIPT",
      pageWidth / 2,
      y + 9,
      { align: "center" }
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(31, 58, 95);
    doc.text(booking.enquiry_id, pageWidth / 2, y + 24, { align: "center" });

    y = y + 46;

    // Details table
    const details: [string, string][] = [
      ["Customer Name", booking.profiles?.name || "—"],
      ["Email", booking.profiles?.email || "—"],
      ["Phone", booking.profiles?.phone || "—"],
      ["Design Title", booking.designs?.title || "Custom Stage Decoration"],
      [
        "Event Date",
        booking.event_date
          ? new Date(booking.event_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "To be confirmed",
      ],
      ["Venue / Location", booking.venue || "Puducherry"],
      [
        "Enquiry Date",
        new Date(booking.booking_date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      ],
      ["Status", booking.status.charAt(0).toUpperCase() + booking.status.slice(1)],
    ];

    if (finalAmount) {
      details.push([
        "Quoted Estimate",
        `Rs. ${Number(finalAmount).toLocaleString("en-IN")}`,
      ]);
    }

    doc.setFontSize(10);
    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 58, 95);
      doc.text(label + ":", margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(value, margin + 55, y);
      y += 8.5;
    });

    if (booking.admin_notes) {
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 58, 95);
      doc.text("Notes:", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const noteLines = doc.splitTextToSize(booking.admin_notes, pageWidth - margin * 2);
      doc.text(noteLines, margin, y);
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor(31, 58, 95);
    doc.rect(0, pageHeight - 18, pageWidth, 18, "F");
    doc.setFontSize(8);
    doc.setTextColor(201, 162, 39);
    doc.text("This is an enquiry receipt only. Payment is handled separately.", pageWidth / 2, pageHeight - 7, { align: "center" });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="enquiry-${booking.enquiry_id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
