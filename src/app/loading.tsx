export default function Loading() {
  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center px-4 relative overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      {/* Ambient background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 text-center flex flex-col items-center">
        {/* Animated Gold Ring Spinner */}
        <div className="relative w-16 h-16 mb-5">
          <div
            className="absolute inset-0 rounded-full border-2 border-gold-400/20"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold-500 border-r-gold-300 animate-spin"
            style={{ animationDuration: "1s" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center text-gold-500 font-bold text-xs">
            SK
          </div>
        </div>

        <p
          className="text-base font-semibold text-navy-950 tracking-tight"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Sri Kubera Decor &amp; Events
        </p>

        <p className="text-navy-600 text-xs mt-1 tracking-wider uppercase font-medium">
          Loading stage designs...
        </p>
      </div>
    </div>
  );
}
