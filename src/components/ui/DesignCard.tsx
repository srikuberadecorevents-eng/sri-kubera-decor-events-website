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
      <article className="card-hover overflow-hidden h-full flex flex-col justify-between rounded-2xl">
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover/img:scale-[1.04] transition-transform duration-700 ease-out"
            loading="lazy"
          />
          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-navy-900/0 group-hover/img:bg-navy-900/20 transition-colors duration-500" />

          {/* Category badge */}
          {design.categories && (
            <span className="absolute top-3 left-3 badge bg-navy-900/85 text-ivory-100 backdrop-blur-sm text-[11px]">
              {design.categories.name}
            </span>
          )}

          {/* Zoom icon on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-navy-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg">
              <ZoomIn size={14} /> View
            </span>
          </div>
        </button>

        {/* Details & Actions */}
        <div className="p-4 flex flex-col justify-between flex-1 gap-3">
          <h3
            className="font-bold text-navy-900 text-sm leading-snug hover:text-gold-600 transition-colors cursor-pointer"
            style={{ fontFamily: "var(--font-display)" }}
            onClick={() => setOpen(true)}
          >
            {design.title}
          </h3>

          <div className="flex items-center justify-between pt-2 border-t border-ivory-300/70 mt-auto">
            <Link
              href={`/gallery/${design.id}`}
              className="text-[12px] font-semibold text-navy-600 hover:text-navy-950 transition-colors"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm hover:shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle size={13} />
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
