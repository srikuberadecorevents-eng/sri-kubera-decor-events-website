"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, ZoomIn, ZoomOut, RotateCcw, ExternalLink, MessageCircle } from "lucide-react";
import { handleWhatsAppEnquiry } from "@/lib/whatsappEnquiry";

export interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
  galleryLink?: string;
  galleryLinkText?: string;
  designId?: string;
}

export default function ImageLightboxModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  galleryLink,
  galleryLinkText,
  designId,
}: ImageLightboxModalProps) {
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset zoom & pan when image changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Handle keyboard shortcuts (Escape to close, +/- to zoom, 0 to reset)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") handleZoomIn();
      else if (e.key === "-" || e.key === "_") handleZoomOut();
      else if (e.key === "0") handleResetZoom();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Prevent body scroll when lightbox is open
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

  const toggleZoom = () => {
    if (scale > 1) {
      handleResetZoom();
    } else {
      setScale(1.75);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92 backdrop-blur-md p-3 sm:p-6 select-none"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Top Action Bar */}
      <div
        className="absolute top-4 inset-x-4 sm:inset-x-8 z-30 flex items-center justify-between pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HD Quality indicator */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>HD View</span>
          {scale > 1 && (
            <span className="text-[#C9A24B] font-mono text-[11px] ml-1">
              ({Math.round(scale * 100)}%)
            </span>
          )}
        </div>

        {/* Toolbar: Zoom Out, Zoom In, Reset, Open Original, Close */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/15 rounded-full p-1 text-white">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none"
              title="Zoom out (-)"
              aria-label="Zoom out"
            >
              <ZoomOut size={17} />
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none"
              title="Zoom in (+)"
              aria-label="Zoom in"
            >
              <ZoomIn size={17} />
            </button>
            {scale > 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none text-[#C9A24B]"
                title="Reset zoom (0)"
                aria-label="Reset zoom"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>

          {/* Open full-res original image directly in new tab */}
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            title="Open original high-resolution photo in new tab"
            aria-label="Open original image"
          >
            <ExternalLink size={18} />
          </a>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            aria-label="Close image viewer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        className="relative w-full max-w-6xl max-h-[88vh] flex flex-col items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative max-w-full max-h-[76vh] sm:max-h-[80vh] flex items-center justify-center transition-transform ${
            isDragging ? "cursor-grabbing" : scale > 1 ? "cursor-grab" : "cursor-zoom-in"
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.25s ease-out",
          }}
          onClick={scale === 1 ? toggleZoom : undefined}
          onMouseDown={handleMouseDown}
        >
          <Image
            src={imageUrl}
            alt={`${title} - Sri Kubera Decor & Events`}
            width={1920}
            height={1280}
            unoptimized={true}
            priority
            className="w-auto h-auto max-w-[95vw] md:max-w-5xl max-h-[74vh] sm:max-h-[78vh] object-contain rounded-xl shadow-2xl pointer-events-none"
            style={{
              imageRendering: "auto",
            }}
          />
        </div>

        {/* Bottom Details Bar */}
        <div className="w-full max-w-4xl mt-3 px-4 py-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div>
            <p
              className="text-white font-bold text-sm sm:text-base leading-snug drop-shadow-sm"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </p>
            {subtitle && (
              <p className="text-[#C9A24B] text-xs font-medium mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/50 text-[11px] hidden md:inline">
              {scale === 1 ? "Click photo to zoom • Drag to pan" : "Drag to move • Click reset to exit zoom"}
            </span>

            {designId && (
              <button
                type="button"
                onClick={() => {
                  handleWhatsAppEnquiry({
                    design: {
                      id: designId,
                      title,
                      category: subtitle,
                      imageUrl,
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide transition-all shrink-0 shadow-md hover:shadow-lg cursor-pointer"
                title="Enquire on WhatsApp for this design"
                data-testid="lightbox-enquire-whatsapp-btn"
              >
                <MessageCircle size={14} />
                <span>Enquire</span>
              </button>
            )}

            {galleryLink && (
              <Link
                href={galleryLink}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C9A24B] hover:bg-[#d8b35c] text-[#06261E] font-bold text-xs tracking-wide transition-all shrink-0 shadow-md hover:shadow-lg"
              >
                {galleryLinkText || "Explore Designs"} <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
