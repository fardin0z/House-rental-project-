import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "বাসাভাড়া",
    short_name: "বাসাভাড়া",
    description:
      "১০০% NID যাচাইকৃত মালিকের কাছ থেকে দালাল ছাড়াই বাসা ভাড়া।",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "bn",
    dir: "ltr",
    background_color: "#F2EDE3",
    theme_color: "#1F1812",
    categories: ["lifestyle", "business"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
