"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ZoomIn, ArrowRight } from "lucide-react";
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
      <div
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] rounded-2xl cursor-pointer"
        aria-label={`Zoom ${design.title} stage photo`}
      >
        <article className="card-hover overflow-hidden h-full rounded-2xl bg-white border border-[#C9A24B]/15 shadow-sm hover:shadow-xl transition-all duration-300">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-ivory-200">
            <Image
              src={design.image_url}
              alt={`${design.title} — Sri Kubera Decor & Events`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-[#06261E]/0 group-hover:bg-[#06261E]/30 transition-colors duration-500" />

            {/* Category badge */}
            {design.categories && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#06261E]/85 text-[#FAF6EC] border border-[#C9A24B]/30 backdrop-blur-sm text-[11px] font-semibold tracking-wide">
                {design.categories.name}
              </span>
            )}

            {/* Zoom icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="flex items-center gap-2 bg-white/95 backdrop-blur-sm text-[#06261E] text-xs font-bold px-4 py-2.5 rounded-full shadow-xl">
                <ZoomIn size={15} className="text-[#C9A24B]" /> Zoom Stage Photo
              </span>
            </div>
          </div>

          {/* Card footer */}
          <div className="p-4 sm:p-5">
            <h3
              className="font-bold text-[#06261E] text-base leading-snug group-hover:text-[#C9A24B] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {design.title}
            </h3>

            <div className="mt-3.5 flex items-center justify-between gap-2 pt-3 border-t border-[#FAF6EC]">
              <span className="inline-flex items-center gap-1.5 text-[#5D6D67] text-xs font-medium group-hover:text-[#C9A24B] transition-colors">
                <ZoomIn size={13} className="text-[#C9A24B]" /> Click to zoom
              </span>

              <Link
                href={`/gallery/${design.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0B4A3A]/10 hover:bg-[#C9A24B] text-[#0B4A3A] hover:text-[#06261E] text-xs font-semibold transition-all"
              >
                Details <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </article>
      </div>

      {/* Lightbox */}
      <ImageLightboxModal
        isOpen={open}
        onClose={() => setOpen(false)}
        imageUrl={design.image_url}
        title={design.title}
        subtitle={design.categories ? `${design.categories.name} Stage Decoration` : "Sri Kubera Stage Decoration"}
        galleryLink={`/gallery/${design.id}`}
        galleryLinkText="View Stage Details & Enquire"
      />
    </>
  );
}
