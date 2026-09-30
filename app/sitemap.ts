import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/contato`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
