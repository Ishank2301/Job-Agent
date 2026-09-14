import type { MetadataRoute } from "next";

import { POSTS } from "@/lib/blog";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/plans`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${site.url}/docs`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/docs/api`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const staticRoutes: MetadataRoute.Sitemap = entries.map((entry) => ({
    ...entry,
    lastModified: now,
  }));

  const blogRoutes: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${site.url}/blog/${p.slug}`,
    lastModified: new Date(`${p.date}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
