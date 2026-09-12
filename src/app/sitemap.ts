import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getAllPublishedAppSlugs } from "@/modules/apps/app.dal";
import { getAllPublishedSlugs } from "@/modules/articles/article.dal";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");

  const staticPaths = ["", "/about", "/articles", "/privacy-policy"];
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
  }));

  const [appSlugs, articleSlugs] = await Promise.all([
    getAllPublishedAppSlugs(),
    getAllPublishedSlugs(),
  ]);

  return [
    ...staticRoutes,
    ...appSlugs.map((slug) => ({ url: `${base}/apps/${slug}` })),
    ...articleSlugs.map((slug) => ({ url: `${base}/articles/${slug}` })),
  ];
}
