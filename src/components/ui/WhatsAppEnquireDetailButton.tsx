"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { handleWhatsAppEnquiry } from "@/lib/whatsappEnquiry";

interface Props {
  design: {
    id: string;
    title: string;
    category?: string | null;
    image_url: string;
  };
}

export default function WhatsAppEnquireDetailButton({ design }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await handleWhatsAppEnquiry({
        design: {
          id: design.id,
          title: design.title,
          category: design.category,
          imageUrl: design.image_url,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      id={`enquire-whatsapp-${design.id}`}
      data-testid="whatsapp-detail-enquire-btn"
      onClick={handleClick}
      disabled={loading}
      className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-600/25 active:scale-95 text-base cursor-pointer disabled:opacity-75"
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <MessageCircle size={20} />
      )}
      Instant WhatsApp Enquiry
    </button>
  );
}
