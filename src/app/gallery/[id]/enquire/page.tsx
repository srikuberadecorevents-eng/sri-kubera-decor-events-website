"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EnquirePage({ params }: Props) {
  const { id: designId } = use(params);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [enquiryResult, setEnquiryResult] = useState<{
    enquiry_id: string;
    design_title: string;
  } | null>(null);
  const router = useRouter();

  const handleEnquire = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ design_id: designId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit enquiry. Please try again.");
        return;
      }
      setEnquiryResult(data);
      setConfirmed(true);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmed && enquiryResult) {
    const waText = encodeURIComponent(
      `Hello, I have raised an enquiry for the design "${enquiryResult.design_title}". My Enquiry ID is ${enquiryResult.enquiry_id}. Please help me with the booking.`
    );
    const waNumber = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";

    return (
      <div className="py-16 bg-cream-100 min-h-screen">
        <div className="page-container max-w-2xl mx-auto text-center">
          <div className="card p-10 animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-navy-900 mb-2">
              Enquiry Submitted
            </h1>
            <p className="text-navy-500 text-sm mb-8">
              Your enquiry has been received. Note your Enquiry ID and contact us
              directly to proceed with the booking.
            </p>

            <div className="bg-navy-900 rounded-2xl p-6 mb-6">
              <p className="text-gold-400 text-xs uppercase tracking-widest mb-2">
                Your Enquiry ID
              </p>
              <p className="text-5xl font-serif font-bold text-white tracking-widest">
                {enquiryResult.enquiry_id}
              </p>
              <p className="text-cream-300 text-sm mt-2">{enquiryResult.design_title}</p>
            </div>

            <p className="text-navy-500 text-sm mb-6">
              A confirmation email has been sent to your registered email address.
              Please quote this ID when contacting us.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/${waNumber}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Message on WhatsApp
              </a>
              <Link href="/enquiries" className="btn-outline">
                View My Enquiries
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="page-container max-w-xl mx-auto">
        <Link
          href={`/gallery/${designId}`}
          className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-800 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Design
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-serif font-bold text-navy-900 mb-2">
            Confirm Your Enquiry
          </h1>
          <p className="text-navy-500 text-sm mb-6">
            Submitting an enquiry is free and creates no obligation. Once
            submitted, you will receive a unique Enquiry ID that you can share
            with us over WhatsApp or phone to finalise your booking.
          </p>

          <div className="bg-cream-100 rounded-xl p-4 mb-6 border border-cream-300">
            <h3 className="font-semibold text-navy-800 text-sm mb-1">Important Note</h3>
            <p className="text-navy-500 text-xs leading-relaxed">
              This platform does not process any payments. All booking
              confirmation and payment is handled directly with our team after
              you contact us using your Enquiry ID.
            </p>
          </div>

          <button
            onClick={handleEnquire}
            disabled={loading}
            className="btn-primary w-full py-4 text-base justify-center"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting Enquiry...
              </>
            ) : (
              "Submit Enquiry"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
