import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Gallery — Luxury Stage Decorations | Sri Kubera Decor & Events Puducherry",
  description:
    "Explore our signature stage decoration gallery in Puducherry for weddings, birthdays, baby showers, and celebrations. View featured setups and enquire directly.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Design Gallery | Sri Kubera Decor & Events Puducherry",
    description:
      "Explore our signature stage decoration gallery in Puducherry for weddings, birthdays, baby showers, and celebrations.",
    url: "/gallery",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
