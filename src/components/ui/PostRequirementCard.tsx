"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  className?: string;
  onSuccess?: () => void;
}

export default function PostRequirementCard({ className = "", onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [refId, setRefId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!mobile.trim() || !/^[6-9]\d{9}$/.test(mobile.replace(/\s+/g, ""))) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/requirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          place: place.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit requirement");
      }

      setRefId(data.referenceId);
      setWhatsappLink(data.whatsappUrl);
      setSubmitted(true);
      toast.success("Requirement posted successfully!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setMobile("");
    setPlace("");
    setSubmitted(false);
    setWhatsappLink("");
  };

  return (
    <div
      className={`bg-[#232323] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10 max-w-md w-full mx-auto ${className}`}
    >
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-8">
        Post Your Requirement
      </h2>

      {submitted ? (
        <div className="py-6 text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Thank You, {name}!</h3>
            <p className="text-sm text-gray-300 mt-2">
              Your requirement has been recorded with reference:
            </p>
            <p className="text-lg font-mono font-bold text-[#C5A880] mt-1 tracking-wider">
              {refId}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Our team will reach out to you shortly. You can also chat with us directly on WhatsApp with your requirement details:
          </p>
          <div className="flex flex-col gap-3 pt-2">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-medium py-3 px-6 rounded-full transition-all duration-200 shadow-md"
              >
                <MessageCircle size={18} />
                Connect on WhatsApp
              </a>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-white transition-colors underline pt-2"
            >
              Post another requirement
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-200">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-transparent border-b border-gray-400 focus:border-[#C5A880] text-white text-base py-1.5 outline-none transition-colors"
            />
          </div>

          {/* Email Id field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-200">
              Email Id
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-gray-400 focus:border-[#C5A880] text-white text-base py-1.5 outline-none transition-colors"
            />
          </div>

          {/* Mobile No. field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-200">
              Mobile No.
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder=""
              required
              maxLength={15}
              className="w-full bg-transparent border-b border-gray-400 focus:border-[#C5A880] text-white text-base py-1.5 outline-none transition-colors"
            />
          </div>

          {/* Place Name Textarea */}
          <div className="pt-2">
            <textarea
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Place Name"
              rows={3}
              className="w-full bg-white text-navy-900 placeholder:text-gray-400 rounded-md p-3.5 text-sm outline-none focus:ring-2 focus:ring-[#C5A880] resize-none shadow-inner"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#C5A880] hover:bg-[#b5966d] active:scale-95 text-white font-medium px-9 py-2.5 rounded-full transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 min-w-[130px]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
