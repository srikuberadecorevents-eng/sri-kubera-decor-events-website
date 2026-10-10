"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import type { Design } from "@/types";

interface DesignCardProps {
  design: Design;
}

export default function DesignCard({ design }: DesignCardProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Card */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-2xl"
        aria-label={`View ${design.title}`}
      >
        <article className="card-hover overflow-hidden h-full">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-ivory-200">
            <Image
              src={design.image_url}
              alt={`${design.title} — Sri Kubera Decor & Events`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              loading="lazy"
            />
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/20 transition-colors duration-500" />

            {/* Category badge */}
            {design.categories && (
              <span className="absolute top-3 left-3 badge bg-navy-900/85 text-ivory-100 backdrop-blur-sm text-[11px]">
                {design.categories.name}
              </span>
            )}

            {/* Zoom icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-navy-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                <ZoomIn size={14} /> View
              </span>
            </div>
          </div>

          {/* Title only */}
          <div className="p-4">
            <h3
              className="font-bold text-navy-900 text-sm leading-snug group-hover:text-gold-600 transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {design.title}
            </h3>
          </div>
        </article>
      </button>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={design.title}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="Close image viewer"
          >
            <X size={24} />
          </button>

          {/* Image container — stop click from bubbling to backdrop */}
          <div
            className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={design.image_url}
              alt={`${design.title} — Sri Kubera Decor & Events`}
              width={1600}
              height={1200}
              className="w-full h-auto max-h-[90vh] object-contain"
              priority
            />
            {/* Title bar at bottom */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-4">
              <p
                className="text-white font-bold text-base md:text-lg leading-snug"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {design.title}
              </p>
              {design.categories && (
                <p className="text-white/70 text-xs mt-0.5">{design.categories.name}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
