import type { MetadataRoute } from "next";
import { CANONICAL_ORIGIN } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const base = CANONICAL_ORIGIN;
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/onboarding/",
          "/chat",
          "/chat/",
          "/listings/new",
          "/listings/*/edit",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
