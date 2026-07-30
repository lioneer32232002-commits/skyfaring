import { getAllPostMetas, type PostMeta } from "@/lib/posts";

/**
 * tag 落地頁。
 *
 * 全站有 103 個不重複 tag，其中 61 個只出現在 1 篇文章。
 * 如果每個 tag 都生成頁面，會多出 61 個只有一張卡片的薄內容頁，
 * 對搜尋沒有幫助，還讓文章頁的 tag 列變成一排長得一樣的連結。
 *
 * 所以設一個門檻：只有累積到 MIN_POSTS 篇的 tag 才有自己的頁面，
 * 未達門檻的 tag 在文章頁上維持純標籤、不做成連結。
 * 這個門檻是內容量的函數，文章變多時可以往上調。
 */
export const MIN_POSTS_FOR_TAG_PAGE = 3;

/** tag 的網址用 encodeURIComponent 後的值當 route 參數，中文 tag 才能進 URL。 */
export function tagHref(tag: string, basePath = ""): string {
  return `${basePath}/tags/${encodeURIComponent(tag)}/`;
}

/** tag → 文章數，由多到少。 */
export function getTagCounts(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPostMetas()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** 有自己落地頁的 tag。 */
export function getIndexableTags(): string[] {
  return getTagCounts()
    .filter((t) => t.count >= MIN_POSTS_FOR_TAG_PAGE)
    .map((t) => t.tag);
}

export function hasTagPage(tag: string): boolean {
  return getIndexableTags().includes(tag);
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPostMetas().filter((p) => p.tags.includes(tag));
}
