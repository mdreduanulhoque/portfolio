import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://reduanulhoque.web.app";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/updates/`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects/`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/classes/`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/certificates/`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
