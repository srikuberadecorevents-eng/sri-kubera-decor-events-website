import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-[#0F1E32] via-[#1F3A5F] to-[#0A1624] text-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient background glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 text-center max-w-lg mx-auto p-8 rounded-3xl bg-white/5 border border-gold-400/25 backdrop-blur-md shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-400/30 text-gold-300 text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles size={13} className="text-gold-400" />
          <span>404 — Page Not Found</span>
        </div>

        <p
          className="text-7xl sm:text-8xl font-bold bg-gradient-to-r from-gold-400 via-gold-200 to-gold-500 bg-clip-text text-transparent mb-4 tracking-tight leading-none"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          404
        </p>

        <h1
          className="text-2xl sm:text-3xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Cherished Stage Not Found
        </h1>

        <div className="w-16 h-1 rounded-full bg-gradient-to-r from-gold-400 to-transparent mx-auto mb-4" />

        <p className="text-ivory-200/80 text-sm leading-relaxed mb-8">
          The page or stage concept you are looking for does not exist or may have been relocated. Let us guide you back to our curated celebration collections.
        </p>

        <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-navy-950 bg-gradient-to-r from-gold-400 to-gold-300 hover:brightness-105 shadow-lg transition-all"
          >
            <Home size={15} />
            <span>Return Home</span>
          </Link>
          <Link
            href="/gallery"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white hover:text-gold-300 border border-white/20 hover:border-gold-400/60 backdrop-blur-sm transition-all"
          >
            <ArrowLeft size={15} />
            <span>Explore Gallery</span>
          </Link>
        </div>
      </div>
    </div>
  );
}