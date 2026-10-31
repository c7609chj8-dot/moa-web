import type { MetadataRoute } from "next";

const origin = "https://korea-safety-education.c7609chj8.chatgpt.site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/schedule`, changeFrequency: "daily", priority: 0.9 },
  ];
}
