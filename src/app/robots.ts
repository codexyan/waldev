import type { MetadataRoute } from "next";
import { ADMIN_BASE, SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [ADMIN_BASE, "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
