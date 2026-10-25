import type { MetadataRoute } from "next";
import { getPublicFeaturedDesigns } from "@/lib/designs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://srikuberadecorevents.in";

  // Stable lastModified for static core pages (avoiding build-time timestamp on every URL)
  const siteUpdatedDate = new Date("2026-10-25T00:00:00.000Z");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: siteUpdatedDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: siteUpdatedDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: siteUpdatedDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: siteUpdatedDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: siteUpdatedDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: siteUpdatedDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Fetch only the publicly viewable featured designs from the database with real IDs and real updated_at
  const featuredDesigns = await getPublicFeaturedDesigns();

  const designRoutes: MetadataRoute.Sitemap = featuredDesigns.map((d) => ({
    url: `${baseUrl}/gallery/${d.id}`,
    lastModified: new Date(d.updated_at || d.created_at || "2026-10-25T00:00:00.000Z"),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...designRoutes];
}

