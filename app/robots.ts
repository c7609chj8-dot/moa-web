import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/apply", "/cancel"],
    },
    sitemap:
      "https://korea-safety-education.c7609chj8.chatgpt.site/sitemap.xml",
    host: "https://korea-safety-education.c7609chj8.chatgpt.site",
  };
}
