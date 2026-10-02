import Image from "next/image";
import Link from "next/link";
import { IndianRupee, Tag } from "lucide-react";
import type { Design } from "@/types";

interface DesignCardProps {
  design: Design;
}

export default function DesignCard({ design }: DesignCardProps) {
  return (
    <Link href={`/gallery/${design.id}`} className="group block">
      <div className="card-hover overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
          <Image
            src={design.image_url}
            alt={design.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {design.categories && (
            <span className="absolute top-3 left-3 badge bg-navy-900/80 text-cream-100 backdrop-blur-sm">
              {design.categories.name}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-serif font-semibold text-navy-900 text-base leading-snug group-hover:text-gold-600 transition-colors mb-1.5">
            {design.title}
          </h3>
          {design.description && (
            <p className="text-navy-500 text-xs leading-relaxed line-clamp-2 mb-3">
              {design.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            {design.price ? (
              <div className="flex items-center gap-1 text-gold-600 font-semibold text-sm">
                <IndianRupee size={14} />
                <span>{design.price.toLocaleString("en-IN")}</span>
              </div>
            ) : (
              <span className="text-navy-400 text-xs">Price on enquiry</span>
            )}
            <span className="text-xs text-gold-600 font-medium group-hover:underline">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
