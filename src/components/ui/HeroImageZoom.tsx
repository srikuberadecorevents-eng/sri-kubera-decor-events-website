"use client";

import { useState } from "react";
import { ZoomIn } from "lucide-react";
import ImageLightboxModal from "./ImageLightboxModal";

interface HeroImageZoomProps {
  imageUrl: string;
  title?: string;
  subtitle?: string;
}

export default function HeroImageZoom({
  imageUrl,
  title = "Signature Stage Decoration",
  subtitle = "Sri Kubera Decor & Events — Puducherry",
}: HeroImageZoomProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2.5 px-6 py-4 rounded-full bg-black/40 hover:bg-black/60 border border-white/30 hover:border-[#C9A24B] text-white hover:text-[#C9A24B] font-bold text-base tracking-wide backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
        aria-label="Zoom hero stage photo"
      >
        <ZoomIn size={18} className="text-[#C9A24B]" />
        <span>Zoom Stage Photo</span>
      </button>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={open}
        onClose={() => setOpen(false)}
        imageUrl={imageUrl}
        title={title}
        subtitle={subtitle}
        galleryLink="/gallery"
        galleryLinkText="Browse All Stage Designs"
      />
    </>
  );
}
