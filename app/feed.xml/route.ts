import { getAllPostMetas, getPost } from "@/lib/posts";

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

  /*
    除了摘要之外一併給全文。
    原本只有 <description>，RSS 讀者只看到一段摘要就得再點進網站；
    content:encoded 讓文章在閱讀器裡就讀得完。
    圖片的 src 是站內相對路徑，在閱讀器裡會壞掉，所以改成絕對網址。
  */
  const items = (
    await Promise.all(
      posts.map(async (meta) => {
        const url = `${SITE_URL}/blog/${meta.slug}/`;
        const post = await getPost(meta.slug);
        const absoluteHtml = post.contentHtml
          .replace(/(<img[^>]+src=")\//g, `$1${SITE_URL}/`)
          .replace(/(<a[^>]+href=")\//g, `$1${SITE_URL}/`);
        const category = meta.category
          ? `\n      <category>${escapeXml(meta.category)}</category>`
          : "";
        return `    <item>
      <title>${escapeXml(meta.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(meta.date).toUTCString()}</pubDate>
      <description>${escapeXml(meta.excerpt)}</description>${category}
      <content:encoded><![CDATA[${absoluteHtml.replace(/]]>/g, "]]&gt;")}]]></content:encoded>
    </item>`;
      })
    )
  ).join("\n");

  const lastBuildDate = posts[0]
    ? new Date(posts[0].updated).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
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
