import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Travel with Haru-chan",
    short_name: "Haru-chan",
    description:
      "A gentle travel buddy for solo women and elders, turning Instagram inspiration into simple, safe trips.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f5",
    theme_color: "#111827",
    lang: "en",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

