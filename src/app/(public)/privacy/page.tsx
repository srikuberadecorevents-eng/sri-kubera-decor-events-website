import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Sri Kubera Decor & Events Puducherry",
  description:
    "Privacy Policy and Data Protection standards for Sri Kubera Decor & Events. We protect customer details and event enquiries.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 md:py-16 bg-ivory-100 min-h-screen">
      <div className="page-container max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-900 text-sm mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="luxury-card p-6 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="section-heading-serif text-2xl md:text-3xl text-navy-950">
                Privacy Policy &amp; Terms
              </h1>
              <p className="text-xs text-navy-500">
                Effective Date: October 2026 &bull; Sri Kubera Decor &amp; Events, Muthiyal Pettai, Puducherry
              </p>
            </div>
          </div>

          <div className="gold-divider mb-8" />

          <div className="space-y-6 text-sm text-navy-800 leading-relaxed">
            <section>
              <h2 className="font-bold text-base text-navy-950 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-bronze" />
                1. Information We Collect
              </h2>
              <p className="text-navy-600 mb-2">
                When you create an account, request a decoration quote, or submit an event requirement on Sri Kubera Decor &amp; Events, we collect:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-navy-600">
                <li>Your name and contact phone number (used for WhatsApp and phone updates regarding your event).</li>
                <li>Your email address (used for account access, booking confirmations, and quotes).</li>
                <li>Event details such as celebration date, venue hall name, and decorative preferences.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-base text-navy-950 mb-2 flex items-center gap-2">
                <Lock size={16} className="text-bronze" />
                2. How We Use and Protect Your Data
              </h2>
              <p className="text-navy-600 mb-2">
                Your privacy is paramount. We use your information strictly to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-navy-600">
                <li>Provide accurate decoration estimates and coordinate stage setups on your event date.</li>
                <li>Verify your account credentials securely through Supabase Auth with encrypted passwords.</li>
                <li>Send automated booking confirmations and invoices.</li>
              </ul>
              <p className="text-navy-600 mt-2">
                We never sell, rent, or trade your personal data to any third-party marketing services.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-base text-navy-950 mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-bronze" />
                3. Customer Consent &amp; Communication
              </h2>
              <p className="text-navy-600">
                By submitting an enquiry or registering an account, you consent to receive communication from our decoration planning team via WhatsApp, SMS, or phone call strictly regarding your event booking.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-base text-navy-950 mb-2">
                4. Contact Information
              </h2>
              <p className="text-navy-600">
                For questions regarding your account or data removal, contact us directly:
                <br />
                <strong>Sri Kubera Decor &amp; Events</strong>
                <br />
                No. 80, Manjini Nagar, Bachanai Madam Street, Muthiyal Pettai, Puducherry - 605003
                <br />
                Phone: 7373876879 / 9486064769 &bull; Email: enquiry@srikuberadecorevents.in
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
