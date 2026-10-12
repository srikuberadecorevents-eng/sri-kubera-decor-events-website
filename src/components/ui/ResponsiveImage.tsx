"use client";

import React, { useState, useEffect, useRef } from "react";
import { getImageMetadata } from "@/data/imageManifest";

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export default function ResponsiveImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  loading,
  fetchPriority,
  fill = false,
  className = "",
  style,
  width,
  height,
  onLoad,
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(priority);
  const containerRef = useRef<HTMLElement>(null);
  const meta = getImageMetadata(src);

  useEffect(() => {
    if (priority || inView) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "60px 0px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, inView]);

  const effectiveLoading = priority ? "eager" : loading || "lazy";
  const effectiveFetchPriority = priority ? "high" : fetchPriority || "auto";

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  // If local static image metadata exists
  if (meta) {
    const pictureWrapperStyle: React.CSSProperties = fill
      ? {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          overflow: "hidden",
          ...style,
        }
      : {
          display: "inline-block",
          position: "relative",
          ...style,
        };

    const imgStyle: React.CSSProperties = {
      ...(fill
        ? {
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }
        : {
            maxWidth: "100%",
            height: "auto",
            aspectRatio: width && height ? `${width}/${height}` : `${meta.aspectRatio}`,
          }),
      // Visual placeholder during lazy load (only for lazy non-priority images)
      backgroundImage: !priority && !loaded && meta.blurDataURL ? `url("${meta.blurDataURL}")` : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
      transition: priority ? "none" : "filter 0.3s ease-out",
    };

    if (!inView) {
      return (
        <span
          ref={containerRef as React.RefObject<HTMLSpanElement>}
          style={pictureWrapperStyle}
          className={fill ? "relative block w-full h-full bg-ivory-200/60" : "inline-block bg-ivory-200/60"}
          aria-hidden="true"
        >
          <span
            style={imgStyle}
            className={`block ${className}`}
          />
        </span>
      );
    }

    return (
      <picture style={pictureWrapperStyle} className={fill ? "relative block w-full h-full" : undefined}>
        {meta.avifSrcSet && <source type="image/avif" srcSet={meta.avifSrcSet} sizes={sizes} />}
        {meta.webpSrcSet && <source type="image/webp" srcSet={meta.webpSrcSet} sizes={sizes} />}
        {meta.jpegSrcSet && <source type="image/jpeg" srcSet={meta.jpegSrcSet} sizes={sizes} />}
        <img
          src={meta.fallbackSrc || meta.defaultSrc}
          alt={alt}
          width={width || meta.width}
          height={height || meta.height}
          loading={effectiveLoading}
          decoding="async"
          fetchPriority={effectiveFetchPriority}
          className={className}
          style={imgStyle}
          onLoad={handleLoad}
        />
      </picture>
    );
  }

  // Fallback for external Supabase URLs or dynamic URLs
  const imgFallbackStyle: React.CSSProperties = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style,
      }
    : {
        maxWidth: "100%",
        height: "auto",
        ...style,
      };

  if (!inView) {
    return (
      <span
        ref={containerRef as React.RefObject<HTMLSpanElement>}
        style={imgFallbackStyle}
        className={`block bg-ivory-200/60 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={effectiveLoading}
      decoding="async"
      fetchPriority={effectiveFetchPriority}
      className={className}
      style={imgFallbackStyle}
      onLoad={handleLoad}
    />
  );
}
