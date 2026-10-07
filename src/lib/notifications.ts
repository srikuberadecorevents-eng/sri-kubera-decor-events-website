import { createClient } from "@supabase/supabase-js";

interface EnquiryNotificationParams {
  enquiry_id: string;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  design_title?: string | null;
  booking_date?: string | null;
}

interface RequirementNotificationParams {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  place: string;
  event_type?: string | null;
  event_date?: string | null;
  message?: string | null;
}

// Get admin notification recipient email
async function getAdminNotificationEmail(): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey);
      const { data } = await supabase
        .from("business_settings")
        .select("notification_email")
        .limit(1)
        .maybeSingle();

      if (data?.notification_email && data.notification_email.trim().length > 0) {
        return data.notification_email.trim();
      }
    }
  } catch (err) {
    console.warn("Could not query business_settings for notification email:", err);
  }

  return process.env.NOTIFY_EMAIL || process.env.RESEND_FROM_EMAIL || null;
}

/**
 * Send alert email to business owner when a new enquiry is created
 */
export async function sendEnquiryNotificationEmail(params: EnquiryNotificationParams) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("Resend API key not configured; skipping enquiry email notification");
      return;
    }

    const toEmail = await getAdminNotificationEmail();
    if (!toEmail) {
      console.log("No notification email found for admin; skipping enquiry notification");
      return;
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New Enquiry Received: ${params.enquiry_id} - ${params.customer_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0B4A3A; margin-top: 0;">New Decoration Enquiry</h2>
          <p>You have received a new booking enquiry on the website:</p>
          <div style="background-color: #FAF6EC; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 6px 0;"><strong>Enquiry ID:</strong> ${params.enquiry_id}</p>
            <p style="margin: 6px 0;"><strong>Customer Name:</strong> ${params.customer_name}</p>
            <p style="margin: 6px 0;"><strong>Phone:</strong> ${params.customer_phone || "Not provided"}</p>
            <p style="margin: 6px 0;"><strong>Email:</strong> ${params.customer_email || "Not provided"}</p>
            <p style="margin: 6px 0;"><strong>Design Selected:</strong> ${params.design_title || "General / None"}</p>
            <p style="margin: 6px 0;"><strong>Date:</strong> ${params.booking_date || new Date().toLocaleDateString()}</p>
          </div>
          <p style="color: #555; font-size: 13px;">Please log in to your admin panel to contact the customer, review notes, and update status.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send enquiry notification email (non-blocking):", error);
  }
}

/**
 * Send alert email to business owner when a new requirement is submitted
 */
export async function sendRequirementNotificationEmail(params: RequirementNotificationParams) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("Resend API key not configured; skipping requirement email notification");
      return;
    }

    const toEmail = await getAdminNotificationEmail();
    if (!toEmail) {
      console.log("No notification email found for admin; skipping requirement notification");
      return;
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New Requirement Lead: ${params.name} (${params.place})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0B4A3A; margin-top: 0;">New Post-Your-Requirement Lead</h2>
          <p>A new customer has posted their event requirement on your website:</p>
          <div style="background-color: #FAF6EC; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 6px 0;"><strong>Customer Name:</strong> ${params.name}</p>
            <p style="margin: 6px 0;"><strong>Phone:</strong> ${params.phone}</p>
            <p style="margin: 6px 0;"><strong>Email:</strong> ${params.email || "Not provided"}</p>
            <p style="margin: 6px 0;"><strong>Location/Place:</strong> ${params.place}</p>
            <p style="margin: 6px 0;"><strong>Occasion / Event Type:</strong> ${params.event_type || "Not specified"}</p>
            <p style="margin: 6px 0;"><strong>Event Date:</strong> ${params.event_date || "Not specified"}</p>
            <p style="margin: 6px 0;"><strong>Details / Message:</strong><br />${params.message || "None"}</p>
          </div>
          <p style="color: #555; font-size: 13px;">Please log in to your admin panel to view this lead, make a direct call or WhatsApp follow-up.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send requirement notification email (non-blocking):", error);
  }
}
