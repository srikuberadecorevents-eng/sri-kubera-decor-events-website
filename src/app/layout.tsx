import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
  adjustFontFallback: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-playfair",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-tamil",
  fallback: ["sans-serif"],
  adjustFontFallback: true,
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://srikuberadecorevents.in"
  ),
  alternates: {
    canonical: "./",
  },
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
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sri Kubera Decor & Events Puducherry — Luxury Stage Decoration",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sri Kubera Decor & Events",
    description: "Premium stage decorations in Puducherry — We Decor Your Dreams.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Sri Kubera Decor & Events",
  image: "https://srikuberadecorevents.in/og-image.jpg",
  telephone: "+917373876879",
  url: "https://srikuberadecorevents.in",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "No. 80, Manjini Nagar",
    addressLocality: "Puducherry",
    postalCode: "605003",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 11.9416,
    longitude: 79.8083,
  },
  areaServed: ["Puducherry", "Cuddalore", "Villupuram", "Tamil Nadu"],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "08:00",
    closes: "21:00",
  },
  sameAs: [
    "https://www.facebook.com/share/1DwDL6AmHE/",
    "https://www.instagram.com/sri_kubera_decor/",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${notoTamil.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="icon" href="/icon.png" sizes="512x512" type="image/png" />
        <link rel="icon" href="/favicon-48x48.png" sizes="48x48" type="image/png" />
        <link rel="icon" href="/favicon.png" sizes="48x48" type="image/png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" type="image/png" />
        <link rel="preconnect" href="https://deuwslifdqwrijiahltm.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://deuwslifdqwrijiahltm.supabase.co" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
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
        {children}
      </body>
    </html>
  );
}
