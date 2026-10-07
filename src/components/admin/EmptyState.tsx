import React from "react";
import Link from "next/link";
import { type LucideIcon, Plus } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E8E2D5] bg-white/70 p-10 sm:p-14 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-[#FAF6EC] text-[#0B4A3A] flex items-center justify-center mb-4 border border-[#E8E2D5]">
        <Icon size={28} />
      </div>
      <h3 className="font-serif font-bold text-lg text-[#17211E] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[#5D6D67] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-sm font-medium transition-all shadow-sm"
        >
          <Plus size={16} />
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-sm font-medium transition-all shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
