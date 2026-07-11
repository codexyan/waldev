import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getAllPublishedSlugs } from "@/modules/articles/article.dal";
import { listPublishedPortfolios } from "@/modules/portfolio/portfolio.dal";
import { listActiveServices } from "@/modules/services/service.dal";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");

  const staticPaths = [
    "",
    "/services",
    "/portfolio",
    "/articles",
    "/about",
    "/contact",
    "/collaboration",
    "/privacy-policy",
    "/terms-of-service",
  ];
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
  }));

  const [articleSlugs, portfolios, services] = await Promise.all([
    getAllPublishedSlugs(),
    listPublishedPortfolios(),
    listActiveServices(),
  ]);

  return [
    ...staticRoutes,
    ...articleSlugs.map((slug) => ({ url: `${base}/articles/${slug}` })),
    ...portfolios.map((p) => ({ url: `${base}/portfolio/${p.slug}` })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}` })),
  ];
}
