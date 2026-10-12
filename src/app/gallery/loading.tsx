export default function GalleryLoading() {
  return (
    <div className="py-12 md:py-16 bg-ivory-100">
      <div className="page-container">
        {/* Header Skeleton */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="h-6 w-32 bg-gold-500/20 rounded-full mx-auto mb-3 animate-pulse" />
          <div className="h-10 w-64 sm:w-80 bg-navy-200/50 rounded-xl mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-navy-100 rounded-md mx-auto animate-pulse" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-24 rounded-full bg-navy-100/70 animate-pulse"
            />
          ))}
        </div>

        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-gold-300/30 bg-white shadow-sm flex flex-col"
            >
              <div className="aspect-[4/3] bg-navy-100/50 animate-pulse relative" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-navy-200/60 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-navy-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
