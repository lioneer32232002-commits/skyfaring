import { getAllPostMetas } from "@/lib/posts";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyfaring.net";
const SITE_DESC = "運動數據分析、飛航安全數據分析、詠春拳、歷史與軍事閱讀心得分享。";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getAllPostMetas().slice(0, 30);

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}/`;
      const category = post.category
        ? `\n      <category>${escapeXml(post.category)}</category>`
        : "";
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>${category}
    </item>`;
    })
    .join("\n");

  const lastBuildDate = posts[0]
    ? new Date(posts[0].updated).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Skyfaring</title>
    <link>${SITE_URL}/</link>
    <description>${SITE_DESC}</description>
    <language>zh-TW</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
