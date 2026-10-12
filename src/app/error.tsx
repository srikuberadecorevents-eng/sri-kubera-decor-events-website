"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, MessageCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring if available in production
    if (process.env.NODE_ENV === "development") {
      console.error("App Error Boundary caught an exception:", error);
    }
  }, [error]);

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-[#0F1E32] via-[#1F3A5F] to-[#0A1624] text-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient background glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 text-center max-w-lg mx-auto p-8 rounded-3xl bg-white/5 border border-gold-400/25 backdrop-blur-md shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-gold-500/15 border border-gold-400/35 flex items-center justify-center mx-auto mb-4 text-gold-400">
          <AlertCircle size={28} />
        </div>

        <h1
          className="text-2xl sm:text-3xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Something Went Wrong
        </h1>

        <div className="w-16 h-1 rounded-full bg-gradient-to-r from-gold-400 to-transparent mx-auto mb-4" />

        <p className="text-ivory-200/80 text-sm leading-relaxed mb-6">
          We encountered an unexpected error while preparing this experience. Please try reloading or return to the main showcase.
        </p>

        {error?.digest && (
          <p className="text-[11px] font-mono text-ivory-300/50 mb-6 bg-black/25 py-1 px-3 rounded-lg inline-block">
            Error Reference: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-navy-950 bg-gradient-to-r from-gold-400 to-gold-300 hover:brightness-105 shadow-lg transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white hover:text-gold-300 border border-white/20 hover:border-gold-400/60 backdrop-blur-sm transition-all"
          >
            <Home size={14} />
            <span>Go Home</span>
          </Link>
          <a
            href="https://wa.me/917373876879"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-400/60 backdrop-blur-sm transition-all"
          >
            <MessageCircle size={14} />
            <span>WhatsApp Us</span>
          </a>
        </div>
      </div>
    </div>
  );
}
