"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ZoomIn, ArrowRight } from "lucide-react";
import ImageLightboxModal from "./ImageLightboxModal";

interface OccasionCardProps {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  animationDelay?: string;
}

export default function OccasionCard({
  id,
  title,
  subtitle,
  image,
  animationDelay = "0s",
}: OccasionCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-2xl aspect-[3/4] block animate-fade-up shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer text-left"
        style={{ animationDelay }}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-label={`Zoom ${title} stage decoration photo`}
      >
        <Image
          src={image}
          alt={`${title} stage decoration in Puducherry by Sri Kubera`}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06261E]/95 via-[#06261E]/40 to-transparent" />

        {/* Zoom icon pill on hover - exactly like DesignCard */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="flex items-center gap-2 bg-white/95 backdrop-blur-sm text-[#06261E] text-xs font-bold px-4 py-2.5 rounded-full shadow-xl">
            <ZoomIn size={15} className="text-[#C9A24B]" /> Zoom Stage Photo
          </span>
        </div>

        {/* Content bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <p className="text-[#C9A24B] text-xs font-semibold tracking-widest uppercase mb-1.5">
            {subtitle}
          </p>
          <h3
            className="text-white text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h3>

          <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-white/15">
            <span className="inline-flex items-center gap-1.5 text-white/90 text-xs font-medium group-hover:text-[#C9A24B] transition-colors">
              <ZoomIn size={13} className="text-[#C9A24B]" /> Click to zoom
            </span>

            <Link
              href={`/gallery?category=${id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 hover:bg-[#C9A24B] text-white hover:text-[#06261E] text-xs font-semibold backdrop-blur-sm transition-all"
            >
              View Designs <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={open}
        onClose={() => setOpen(false)}
        imageUrl={image}
        title={`${title} Stage Decoration`}
        subtitle={subtitle}
        galleryLink={`/gallery?category=${id}`}
        galleryLinkText={`Explore All ${title} Designs`}
      />
    </>
  );
}
