import Link from "next/link";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "917373876879";
const DEFAULT_MESSAGE =
  "Hello, I am interested in your decoration services. Could you please share more details?";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white
        px-4 py-3 rounded-full shadow-lg hover:bg-[#1ebe5b] active:scale-95
        transition-all duration-200 animate-pulse-gold group"
    >
      <MessageCircle size={22} />
      <span className="text-sm font-semibold hidden sm:inline">WhatsApp</span>
    </a>
  );
}
