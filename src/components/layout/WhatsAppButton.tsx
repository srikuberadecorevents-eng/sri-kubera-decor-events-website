"use client";

import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";
const DEFAULT_MESSAGE =
  "Hello, I am interested in your decoration services. Could you please share more details?";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center bg-[#25D366] text-white
        p-3.5 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.45)]
        hover:bg-[#1ebe5b] hover:shadow-[0_6px_28px_rgba(37,211,102,0.6)]
        active:scale-95 transition-all duration-200 animate-pulse-wa"
    >
      <MessageCircle size={22} aria-hidden="true" />
    </a>
  );
}
