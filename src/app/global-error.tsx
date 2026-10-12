"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Global Error caught:", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Application Error — Sri Kubera Decor &amp; Events</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          backgroundColor: "#0F1E32",
          color: "#FFFFFF",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            margin: "24px",
            padding: "36px 28px",
            borderRadius: "24px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(201, 162, 75, 0.3)",
            textAlign: "center",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 16px auto",
              borderRadius: "16px",
              backgroundColor: "rgba(201, 162, 75, 0.15)",
              border: "1px solid rgba(201, 162, 75, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C9A24B",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            !
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#FFFFFF",
              margin: "0 0 10px 0",
            }}
          >
            Sri Kubera Decor &amp; Events
          </h1>

          <div
            style={{
              width: "60px",
              height: "3px",
              background: "linear-gradient(90deg, #C9A24B, transparent)",
              margin: "0 auto 16px auto",
              borderRadius: "2px",
            }}
          />

          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
              color: "rgba(249, 245, 236, 0.8)",
              margin: "0 0 24px 0",
            }}
          >
            A critical error occurred while loading the application. Please reload the page to continue.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => reset()}
              style={{
                padding: "12px 24px",
                borderRadius: "9999px",
                border: "none",
                background: "linear-gradient(135deg, #C9A227, #e8c24a)",
                color: "#0d1e30",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(201, 162, 39, 0.35)",
              }}
            >
              Reload Page
            </button>
            {/* Hard navigation recommended on fatal root layout failure */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: "12px 24px",
                borderRadius: "9999px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Go to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
