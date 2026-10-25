"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ZoomIn, MessageCircle } from "lucide-react";
import type { Design } from "@/types";
import { handleWhatsAppEnquiry } from "@/lib/whatsappEnquiry";
import ResponsiveImage from "./ResponsiveImage";

const ImageLightboxModal = dynamic(() => import("./ImageLightboxModal"), {
  ssr: false,
});

interface DesignCardProps {
  design: Design;
}

export default function DesignCard({ design }: DesignCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Card */}
      <article className="card-hover overflow-hidden h-full flex flex-col justify-between rounded-xl sm:rounded-2xl bg-white border border-[#E8E2D5] shadow-sm">
        {/* Image trigger button */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group/img relative block w-full aspect-[4/3] overflow-hidden bg-ivory-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 text-left cursor-pointer"
          aria-label={`View ${design.title}`}
        >
          <ResponsiveImage
            src={design.image_url}
            alt={`${design.title} — Sri Kubera Decor & Events`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover/img:scale-[1.04] transition-transform duration-700 ease-out"
            loading="lazy"
          />
          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-navy-900/0 group-hover/img:bg-navy-900/20 transition-colors duration-500" />

          {/* Category badge */}
          {design.categories && (
            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 badge bg-navy-900/85 text-ivory-100 backdrop-blur-sm text-[9px] sm:text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1">
              {design.categories.name}
            </span>
          )}

          {/* Zoom icon on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-sm text-navy-900 text-[11px] sm:text-xs font-bold px-2.5 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg">
              <ZoomIn size={13} /> View
            </span>
          </div>
        </button>

        {/* Details & Actions */}
        <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 gap-2 sm:gap-3">
          <h3
            className="font-bold text-navy-900 text-xs sm:text-sm leading-snug hover:text-gold-600 transition-colors cursor-pointer line-clamp-2"
            style={{ fontFamily: "var(--font-display)" }}
            onClick={() => setOpen(true)}
            title={design.title}
          >
            {design.title}
          </h3>

          <div className="flex items-center justify-between pt-2 border-t border-ivory-300/70 mt-auto gap-1">
            <Link
              href={`/gallery/${design.id}`}
              className="text-[11px] sm:text-[12px] font-semibold text-navy-600 hover:text-navy-950 transition-colors shrink-0"
            >
              Details &rarr;
            </Link>

            <button
              type="button"
              onClick={() => {
                handleWhatsAppEnquiry({
                  design: {
                    id: design.id,
                    title: design.title,
                    category: design.categories?.name,
                    imageUrl: design.image_url,
                  },
                });
              }}
              data-testid={`card-enquire-whatsapp-${design.id}`}
              aria-label={`Enquire about ${design.title} on WhatsApp`}
              className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm hover:shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <MessageCircle size={12} className="shrink-0" />
              <span>Enquire</span>
            </button>
          </div>
        </div>
      </article>

      {/* Lightbox */}
      <ImageLightboxModal
        isOpen={open}
        onClose={() => setOpen(false)}
        imageUrl={design.image_url}
        title={design.title}
        subtitle={design.categories?.name}
        galleryLink={`/gallery/${design.id}`}
        galleryLinkText="View Stage Details"
        designId={design.id}
      />
    </>
  );
}
