import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#E8E2D5]/60 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden p-4 space-y-3">
      <div className="h-10 bg-[#FAF6EC] rounded-xl animate-pulse" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-14 bg-[#FAF6EC]/60 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden p-4 space-y-3"
        >
          <div className="aspect-[4/3] bg-[#FAF6EC] rounded-xl animate-pulse" />
          <div className="h-5 bg-[#FAF6EC] rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-[#FAF6EC]/60 rounded w-1/2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
