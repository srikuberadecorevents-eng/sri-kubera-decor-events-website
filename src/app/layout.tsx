import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Sri Kubera Decor & Events — We Decor Your Dreams",
    template: "%s | Sri Kubera Decor & Events",
  },
  description:
    "Sri Kubera Decor & Events (Kubera Decoration) — Elegant stage decorations for weddings, birthdays, surprise parties, and corporate events in Puducherry. Call 7373876879.",
  keywords: [
    "stage decoration",
    "wedding decoration",
    "birthday decoration",
    "Puducherry decoration",
    "event decoration",
    "Sri Kubera",
    "Kubera Decoration",
  ],
  openGraph: {
    siteName: "Sri Kubera Decor & Events",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1F3A5F",
              color: "#F9F5EC",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
            },
            success: {
              iconTheme: { primary: "#C9A227", secondary: "#1F3A5F" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
        <Header />
        <main className="min-h-screen pt-16 md:pt-18">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
