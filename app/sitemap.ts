import type { MetadataRoute } from "next";
import { getAllPostMetas } from "@/lib/posts";
import { TOPIC_GROUPS } from "@/lib/taxonomy";
import { PROJECT_PAGES } from "@/lib/projectPages";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyfaring.pages.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostMetas();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}/`,
    lastModified: post.updated || post.date,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const topicEntries: MetadataRoute.Sitemap = TOPIC_GROUPS.map((group) => ({
    url: `${SITE_URL}/topics/${group.slug}/`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const projectEntries: MetadataRoute.Sitemap = PROJECT_PAGES.map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}/`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/drone-review/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ukraine-review/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tpbl-lens/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/projects/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...topicEntries,
    ...projectEntries,
    ...postEntries,
  ];
}
