import Image from "next/image";
import Link from "next/link";
import { IndianRupee, ArrowRight } from "lucide-react";
import type { Design } from "@/types";

interface DesignCardProps {
  design: Design;
}

export default function DesignCard({ design }: DesignCardProps) {
  return (
    <Link href={`/gallery/${design.id}`} className="group block" tabIndex={0}>
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
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/15 transition-colors duration-500" />
          {/* Category badge */}
          {design.categories && (
            <span className="absolute top-3 left-3 badge bg-navy-900/85 text-ivory-100 backdrop-blur-sm text-[11px]">
              {design.categories.name}
            </span>
          )}
          {/* View overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-navy-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg">
              View Design <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3
            className="font-bold text-navy-900 text-base leading-snug group-hover:text-gold-600 transition-colors mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {design.title}
          </h3>
          {design.description && (
            <p className="text-navy-500 text-sm leading-relaxed line-clamp-2 mb-3">
              {design.description}
            </p>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-ivory-200">
            {design.price ? (
              <div className="flex items-center gap-1 text-gold-600 font-bold text-sm">
                <IndianRupee size={14} aria-hidden="true" />
                <span>{design.price.toLocaleString("en-IN")}</span>
              </div>
            ) : (
              <span className="text-navy-400 text-xs italic">Price on enquiry</span>
            )}
            <span className="text-xs text-gold-500 font-semibold group-hover:text-gold-700 transition-colors flex items-center gap-1">
              Enquire <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
