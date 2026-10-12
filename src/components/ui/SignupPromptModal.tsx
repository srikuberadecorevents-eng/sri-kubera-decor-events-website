"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Sparkles, LogIn, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AuthModalDetail } from "@/lib/authModal";

const DEFAULT_TITLE = "Sign in or sign up to view the full gallery";
const DEFAULT_DESC =
  "Create a free account or sign in to browse our complete collection of 35+ royal wedding, birthday, and special celebration stages in high definition.";

export default function SignupPromptModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [modalTitle, setModalTitle] = useState(DEFAULT_TITLE);
  const [modalDesc, setModalDesc] = useState(DEFAULT_DESC);
  const [redirectPath, setRedirectPath] = useState("/gallery");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const pathname = usePathname();
  const supabase = createClient();
  const modalRef = useRef<HTMLDivElement>(null);

  // Check route suppression: Never show on /login, /signup, /admin
  const isSuppressedRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/admin");

  // Check auth session
  useEffect(() => {
    setMounted(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        setIsOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Timed popup after 18 seconds for non-logged-in visitors (15 to 20 seconds)
  useEffect(() => {
    if (!mounted || isLoggedIn === true || isSuppressedRoute) return;

    // Check if dismissed in this session
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("signup_prompt_dismissed_session");
      if (dismissed === "true") return;
    }

    const timer = setTimeout(() => {
      if (!isSuppressedRoute && isLoggedIn === false) {
        setModalTitle("Welcome to Sri Kubera Decor");
        setModalDesc(
          "Sign in or create a free account to explore all 35+ stage decoration designs, save your favorites, and track your celebration bookings."
        );
        setRedirectPath(pathname || "/gallery");
        setIsOpen(true);
      }
    }, 18000); // 18 seconds

    return () => clearTimeout(timer);
  }, [mounted, isLoggedIn, isSuppressedRoute, pathname]);

  // Listen for gated actions triggered anywhere across the app
  useEffect(() => {
    const handleGatedAction = (e: Event) => {
      if (isLoggedIn === true) return;

      const customEvent = e as CustomEvent<AuthModalDetail>;
      if (customEvent.detail) {
        setModalTitle(customEvent.detail.title || DEFAULT_TITLE);
        setModalDesc(customEvent.detail.description || DEFAULT_DESC);
        setRedirectPath(customEvent.detail.redirectUrl || "/gallery");
      }
      setIsOpen(true);
    };

    window.addEventListener("open-signup-prompt", handleGatedAction);
    return () => window.removeEventListener("open-signup-prompt", handleGatedAction);
  }, [isLoggedIn]);

  // Close handler: remembers dismissal for the current session
  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("signup_prompt_dismissed_session", "true");
    }
  }, []);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted || isSuppressedRoute || isLoggedIn === true) {
    return null;
  }

  const loginHref = `/login?redirectTo=${encodeURIComponent(redirectPath)}`;
  const signupHref = `/signup?redirectTo=${encodeURIComponent(redirectPath)}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: "rgba(6, 38, 30, 0.65)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-[#FAF6EC] rounded-3xl shadow-2xl overflow-hidden border border-[#E8E2D5] animate-modal-pop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-prompt-title"
      >
        {/* Decorative Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          id="signup-prompt-close-button"
          className="absolute top-4 right-4 p-2 text-navy-500 hover:text-navy-950 bg-white hover:bg-gold-50 rounded-full transition-colors z-10 border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-gold-500"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="p-7 sm:p-9 text-center relative">
          <div className="w-14 h-14 mx-auto bg-gold-500/15 border border-gold-400/40 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
            <Sparkles className="text-gold-600" size={28} />
          </div>

          <h2
            id="signup-prompt-title"
            className="text-2xl sm:text-3xl font-bold text-navy-950 mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {modalTitle}
          </h2>

          <p className="text-navy-700 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
            {modalDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 w-full">
            <Link
              href={signupHref}
              onClick={handleClose}
              id="signup-prompt-signup-btn"
              className="btn-gold flex-1 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <UserPlus size={16} />
              <span>Create Account</span>
            </Link>

            <Link
              href={loginHref}
              onClick={handleClose}
              id="signup-prompt-login-btn"
              className="btn-outline flex-1 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </Link>
          </div>

          <button
            onClick={handleClose}
            className="mt-6 text-xs text-navy-500 hover:text-navy-800 font-semibold underline underline-offset-4 transition-colors"
          >
            Maybe later, continue browsing
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
