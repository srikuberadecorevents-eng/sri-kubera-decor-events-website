import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sri Kubera Decor & Events",
    short_name: "Kubera Decor",
    description: "Premium stage decorations in Puducherry — We Decor Your Dreams.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B4A3A",
    theme_color: "#0B4A3A",
    icons: [
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
