"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TIMER_DURATION_MS = 120000; // 2 minutes (120,000 ms)

export default function RequirementPromptModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const isTimerDoneRef = useRef(false);
  const isCheckingRef = useRef(false);

  // Check if current route should suppress the popup
  const isSuppressedRoute =
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/admin/");

  // Persist dismissal both in localStorage and profiles table
  const handleDismiss = useCallback(async () => {
    setIsOpen(false);
    if (!userId) return;

    localStorage.setItem(`req_prompt_dismissed_${userId}`, "true");

    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ requirement_prompt_dismissed_at: new Date().toISOString() })
        .eq("id", userId);
    } catch (err) {
      console.warn("Failed to update requirement_prompt_dismissed_at in profiles:", err);
    }
  }, [userId]);

  const isSuppressedRouteRef = useRef(isSuppressedRoute);
  useEffect(() => {
    isSuppressedRouteRef.current = isSuppressedRoute;
  }, [isSuppressedRoute]);

  // Main evaluation logic
  useEffect(() => {
    setMounted(true);

    let timeoutId: NodeJS.Timeout;
    const supabase = createClient();

    const evaluatePromptEligibility = async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // 1. Must be logged-in
        if (!user) {
          isCheckingRef.current = false;
          return;
        }

        setUserId(user.id);

        // 2. Local check: already dismissed?
        if (localStorage.getItem(`req_prompt_dismissed_${user.id}`) === "true") {
          isCheckingRef.current = false;
          return;
        }

        // 3. Local check: already submitted requirement?
        if (localStorage.getItem(`req_submitted_${user.id}`) === "true") {
          isCheckingRef.current = false;
          return;
        }

        // 4. Query profile: role, requirement_prompt_dismissed_at, phone
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, requirement_prompt_dismissed_at, phone")
          .eq("id", user.id)
          .single();

        // 5. Must be non-admin user
        if (profile?.role === "admin") {
          isCheckingRef.current = false;
          return;
        }

        // 6. DB check: already dismissed?
        if (profile?.requirement_prompt_dismissed_at) {
          localStorage.setItem(`req_prompt_dismissed_${user.id}`, "true");
          isCheckingRef.current = false;
          return;
        }

        // 7. DB check: has the user already submitted a requirement?
        const orConditions = [`email.eq.${user.email}`];
        if (profile?.phone && profile.phone.trim().length > 0) {
          orConditions.push(`phone.eq.${profile.phone.trim()}`);
        }

        const { data: existingRequirements } = await supabase
          .from("requirements")
          .select("id")
          .or(orConditions.join(","))
          .limit(1);

        if (existingRequirements && existingRequirements.length > 0) {
          localStorage.setItem(`req_submitted_${user.id}`, "true");
          localStorage.setItem(`req_prompt_dismissed_${user.id}`, "true");
          isCheckingRef.current = false;
          return;
        }

        // 8. Session-persistent 2-minute timer
        const timerKey = `req_timer_start_${user.id}`;
        let startTime = parseInt(localStorage.getItem(timerKey) || "0", 10);

        if (!startTime || isNaN(startTime)) {
          startTime = Date.now();
          localStorage.setItem(timerKey, startTime.toString());
        }

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, TIMER_DURATION_MS - elapsed);

        if (remaining === 0) {
          isTimerDoneRef.current = true;
          if (!isSuppressedRouteRef.current) {
            setIsOpen(true);
          }
        } else {
          timeoutId = setTimeout(() => {
            isTimerDoneRef.current = true;
            if (!isSuppressedRouteRef.current) {
              setIsOpen(true);
            }
          }, remaining);
        }
      } catch (err) {
        console.warn("Requirement prompt eligibility check encountered an error:", err);
      } finally {
        isCheckingRef.current = false;
      }
    };

    evaluatePromptEligibility();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        evaluatePromptEligibility();
      } else {
        setIsOpen(false);
        setUserId(null);
      }
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []); // Run on mount

  // Handle route change: if timer finished while on a suppressed route, show when leaving it
  useEffect(() => {
    if (isTimerDoneRef.current && !isSuppressedRoute && !isOpen && userId) {
      const isDismissed = localStorage.getItem(`req_prompt_dismissed_${userId}`) === "true";
      const isSubmitted = localStorage.getItem(`req_submitted_${userId}`) === "true";
      if (!isDismissed && !isSubmitted) {
        setIsOpen(true);
      }
    }
  }, [pathname, isSuppressedRoute, isOpen, userId]);

  // Lock body scroll when open
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

  // Keyboard navigation & Focus trapping
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore on close
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Trap focus inside modal
    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const modalEl = modalRef.current;
    if (modalEl) {
      const focusables = modalEl.querySelectorAll<HTMLElement>(focusableSelectors);
      if (focusables.length > 0) {
        // Focus the primary CTA button first for positive user experience
        triggerButtonRef.current?.focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close
      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
        return;
      }

      // Tab trap
      if (e.key === "Tab" && modalEl) {
        const focusableElements = Array.from(
          modalEl.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [isOpen, handleDismiss]);

  // CTA Action: navigate / scroll to Post Requirement
  const handleOpenForm = () => {
    handleDismiss();
    if (pathname === "/") {
      const element = document.getElementById("post-requirement");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/#post-requirement");
    }
  };

  if (!isOpen || !mounted || isSuppressedRoute) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-req-overlay"
      style={{
        backgroundColor: "rgba(10, 16, 14, 0.52)",
      }}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="req-prompt-title"
        aria-describedby="req-prompt-desc"
        className="relative w-full max-w-[820px] bg-[#FAF7F0] rounded-[16px] border border-[rgba(201,162,75,0.35)] shadow-xl overflow-hidden animate-req-dialog flex flex-col md:flex-row"
      >
        {/* Close X in top-right corner, small and subtle */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 p-1.5 text-[#5D6D67] hover:text-[#17211E] rounded-full hover:bg-black/5 transition-colors z-20 cursor-pointer focus:outline-none"
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>

        {/* Left Column (Desktop ~40% full height) / Top Banner (Mobile 140px) */}
        <div className="relative w-full h-[140px] md:h-auto md:w-[40%] shrink-0">
          <Image
            src="/assets/marriage-01.jpeg"
            alt="Wedding and celebration stage decoration"
            fill
            sizes="(max-width: 768px) 100vw, 328px"
            className="object-cover"
            priority
          />
        </div>

        {/* Right Column Content with 40px padding */}
        <div className="w-full md:w-[60%] p-6 sm:p-8 md:p-[40px] flex flex-col justify-center text-left">
          {/* 1. Small uppercase label "FREE QUOTATION" in bronze (#9A7519) */}
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7519] mb-2 sm:mb-2.5">
            FREE QUOTATION
          </p>

          {/* 2. Heading in Playfair Display "Planning a wedding or event in Puducherry?" */}
          <h2
            id="req-prompt-title"
            className="text-2xl sm:text-[26px] md:text-[28px] font-serif font-bold text-[#17211E] leading-snug tracking-tight mb-3"
            style={{ fontFamily: "var(--font-display, 'Playfair Display', serif)" }}
          >
            Planning a wedding or event in Puducherry?
          </h2>

          {/* 3. One 2-line sentence */}
          <p
            id="req-prompt-desc"
            className="text-[#3E4A44] text-sm sm:text-[15px] leading-relaxed mb-6"
          >
            Tell us your date, venue and theme. We&apos;ll reply on WhatsApp with design ideas and a quote within 24 hours.
          </p>

          {/* 4. One primary button "Get my quote" (solid deep green, ivory text, 48px high, no outline ring) */}
          <button
            ref={triggerButtonRef}
            type="button"
            onClick={handleOpenForm}
            className="w-full h-[48px] bg-[#0B4A3A] hover:bg-[#08382C] active:bg-[#062920] text-[#FAF6EC] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center cursor-pointer focus:outline-none"
          >
            Get my quote
          </button>

          {/* 5. Plain text link "Not now" beneath it */}
          <button
            type="button"
            onClick={handleDismiss}
            className="mt-3 text-xs sm:text-sm text-[#4E5D57] hover:text-[#17211E] underline-offset-4 hover:underline transition-colors cursor-pointer text-center block w-full py-1 focus:outline-none"
          >
            Not now
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
