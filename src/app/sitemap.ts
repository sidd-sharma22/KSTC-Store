import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://store-kstco.vercel.app";
  const now = new Date();

  const categories = [
    "pipes-fittings",
    "sanitary-ware",
    "bathroom-ware",
    "water-tanks",
    "all-products",
  ];

  const productIds = ["1", "2", "3", "4", "5", "6"];

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...categories.map((slug) => ({
      url: `${baseUrl}/category/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...productIds.map((id) => ({
      url: `${baseUrl}/product/${id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return routes;
}
