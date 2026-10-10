"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import type { Design } from "@/types";
import ImageLightboxModal from "./ImageLightboxModal";

interface DesignCardProps {
  design: Design;
}

export default function DesignCard({ design }: DesignCardProps) {
  const [open, setOpen] = useState(false);

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
      <ImageLightboxModal
        isOpen={open}
        onClose={() => setOpen(false)}
        imageUrl={design.image_url}
        title={design.title}
        subtitle={design.categories?.name}
      />
    </>
  );
}
