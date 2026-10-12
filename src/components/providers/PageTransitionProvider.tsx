"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

interface PageTransitionProviderProps {
  children: React.ReactNode;
}

export default function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const isNavigatingRef = useRef(false);

  // ─────────────────── SCROLL REVEAL OBSERVER ───────────────────
  const initScrollReveal = useCallback(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".scroll-reveal").forEach((el) => {
        el.classList.add("scroll-revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-revealed");
            // Section reveal once on scroll (not repeating)
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    // Automatically observe scroll-reveal and zoom-marked elements
    const elementsToObserve = document.querySelectorAll<HTMLElement>(
      ".scroll-reveal, .scroll-zoom, .scroll-zoom-center, [data-reveal]"
    );

    elementsToObserve.forEach((el) => {
      // Check if element is already inside the initial viewport
      const rect = el.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0;

      if (inViewport) {
        // Reveal immediately to eliminate render delay for initial view
        el.classList.add("scroll-revealed");
      } else {
        // Observe elements below the fold for a single entrance reveal
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Run scroll reveal setup and transition timers on mount
  useEffect(() => {
    isNavigatingRef.current = false;

    let enterTimer: NodeJS.Timeout | null = null;
    if (typeof window !== "undefined" && sessionStorage.getItem("kubera_nav") === "1") {
      sessionStorage.removeItem("kubera_nav");
      setIsEntering(true);
      enterTimer = setTimeout(() => {
        setIsEntering(false);
        setShowProgressBar(false);
      }, 350);
    } else {
      setIsEntering(false);
      setShowProgressBar(false);
    }

    // Immediately initialize scroll reveal to ensure in-viewport elements render with zero delay
    initScrollReveal();

    return () => {
      if (enterTimer) clearTimeout(enterTimer);
    };
  }, [initScrollReveal]);

  // Periodic check / MutationObserver for dynamic list changes (e.g. filters)
  useEffect(() => {
    const handleDomChange = () => {
      initScrollReveal();
    };

    window.addEventListener("scroll-reveal-refresh", handleDomChange);
    return () => {
      window.removeEventListener("scroll-reveal-refresh", handleDomChange);
    };
  }, [initScrollReveal]);

  // ─────────────────── GLOBAL LINK CLICK INTERCEPTION (OPEN & CLOSE) ───────────────────
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      // Only handle left clicks without modifier keys
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, downloads, mailto, tel, whatsapp, hash links
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        target.target === "_blank" ||
        target.hasAttribute("download")
      ) {
        return;
      }

      // Extract target pathname
      const targetUrl = new URL(href, window.location.href);
      const targetPath = targetUrl.pathname;

      // Same page anchor navigation (e.g. /#post-requirement)
      if (targetPath === pathname && targetUrl.hash) {
        const hashTarget = document.querySelector(targetUrl.hash);
        if (hashTarget) {
          e.preventDefault();
          hashTarget.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }

      // If already on the same page, do normal behavior
      if (targetPath === pathname) return;

      // Prevent default and play closing exit animation
      e.preventDefault();
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;

      if (typeof window !== "undefined") {
        sessionStorage.setItem("kubera_nav", "1");
      }
      setIsExiting(true);
      setShowProgressBar(true);

      // Smooth 180ms closing transition before Next.js routing
      setTimeout(() => {
        router.push(href);
      }, 180);
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
    };
  }, [pathname, router]);

  return (
    <>
      {/* Top Gold Progress Sweep Bar */}
      {showProgressBar && <div className="page-route-bar" aria-hidden="true" />}

      {/* Main Container with Open / Close Motion Classes */}
      <div
        className={`page-container-motion ${
          isExiting ? "page-motion-exiting" : isEntering ? "page-motion-entering" : ""
        }`}
      >
        {children}
      </div>
    </>
  );
}
