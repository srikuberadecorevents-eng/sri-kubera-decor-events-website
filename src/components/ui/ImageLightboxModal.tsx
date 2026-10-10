"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

export interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
  galleryLink?: string;
  galleryLinkText?: string;
}

export default function ImageLightboxModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  galleryLink,
  galleryLinkText,
}: ImageLightboxModalProps) {
  // Close lightbox on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
        aria-label="Close image viewer"
      >
        <X size={24} />
      </button>

      {/* Image container — stop click from bubbling to backdrop */}
      <div
        className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-black/50 flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt={`${title} — Sri Kubera Decor & Events`}
          width={1600}
          height={1200}
          className="w-full h-auto max-h-[85vh] object-contain"
          priority
        />

        {/* Title bar at bottom */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p
              className="text-white font-bold text-base md:text-lg leading-snug drop-shadow-sm"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </p>
            {subtitle && (
              <p className="text-white/75 text-xs sm:text-sm mt-0.5">{subtitle}</p>
            )}
          </div>

          {galleryLink && (
            <Link
              href={galleryLink}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C9A24B] hover:bg-[#d8b35c] text-[#06261E] font-bold text-xs tracking-wide transition-all shrink-0 shadow-lg hover:shadow-xl"
            >
              {galleryLinkText || "Explore Designs"} <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
