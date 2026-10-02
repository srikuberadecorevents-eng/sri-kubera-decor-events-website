import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Toaster } from "react-hot-toast";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sri Kubera Decor & Events — We Decor Your Dreams",
    template: "%s | Sri Kubera Decor & Events",
  },
  description:
    "Sri Kubera Decor & Events — Premium stage decorations for weddings, birthdays, surprise parties, and corporate events in Puducherry. Call 7373876879.",
  keywords: [
    "stage decoration Puducherry",
    "wedding decoration Puducherry",
    "birthday decoration",
    "event decoration Pondicherry",
    "Sri Kubera Decor",
    "Kubera Decoration",
    "Saravanan decoration",
  ],
  openGraph: {
    siteName: "Sri Kubera Decor & Events",
    locale: "en_IN",
    type: "website",
    title: "Sri Kubera Decor & Events — We Decor Your Dreams",
    description:
      "Premium stage decorations for weddings, birthdays, surprise parties, and corporate events in Puducherry.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sri Kubera Decor & Events",
    description: "Premium stage decorations in Puducherry — We Decor Your Dreams.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4500,
            style: {
              background: "#1F3A5F",
              color: "#F9F5EC",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "var(--font-inter, Inter, sans-serif)",
              border: "1px solid rgba(201,162,39,0.3)",
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
        {/* pt-16 = 64px = header height */}
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
