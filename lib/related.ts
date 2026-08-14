import { getAllPostMetas, type PostMeta } from "@/lib/posts";
import { getGroupForCategory } from "@/lib/taxonomy";

/**
 * 文章之間的關聯查詢。
 *
 * 改版前每篇文章的內文站內連結是 0 條，讀者讀完只有「返回文章列表」可按，
 * 八部曲的第三篇也沒有辦法跳到第一篇。這一層負責把散落的 71 篇接起來。
 *
 * 全部在 build 時算，靜態輸出，沒有執行期成本。
 */

/**
 * 同一系列的所有文章，依閱讀順序排列。
 *
 * getAllPostMetas 是日期新到舊排序，系列內要反過來（第一篇在前），
 * 同日期時再用 slug 升序當次序鍵——兩個現有系列（dmrh 01–08、
 * 烏克蘭三部曲 autonomous→c4isr→deep-fighting）都剛好是這個順序。
 */
export function getSeriesPosts(series: string): PostMeta[] {
  return getAllPostMetas()
    .filter((p) => p.series === series)
    .sort((a, b) => {
      const d = new Date(a.date).getTime() - new Date(b.date).getTime();
      return d !== 0 ? d : a.slug.localeCompare(b.slug);
    });
}

/**
 * 相關文章：先取同分類、日期最近的幾篇，不足時往上一層主題群補齊。
 *
 * 排除自己，也排除同系列的其他篇——那些已經由系列導覽完整列出，不需重複佔位。
 *
 * 補齊那一段是必要的：有三個分類目前只有 1 篇（球鞋、多代理人、國防科技），
 * 只看同分類的話這幾篇會一條站內連結都沒有，變成動線的死路。
 * 往主題群補，等於用「同主題」這個較寬的關聯，仍然比隨機推薦相關。
 */
// limit 4 是配相關文章區的兩欄格線：2+2 排滿，不會有一張卡自己一排
export function getRelatedPosts(post: PostMeta, limit = 4): PostMeta[] {
  if (!post.category) return [];

  const all = getAllPostMetas();
  const eligible = (p: PostMeta) =>
    p.slug !== post.slug && !(post.series && p.series === post.series);

  const sameCategory = all.filter((p) => eligible(p) && p.category === post.category);
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const group = getGroupForCategory(post.category);
  if (!group) return sameCategory.slice(0, limit);

  const picked = new Set(sameCategory.map((p) => p.slug));
  const sameGroup = all.filter(
    (p) =>
      eligible(p) &&
      !picked.has(p.slug) &&
      p.category !== undefined &&
      group.categories.includes(p.category)
  );

  return [...sameCategory, ...sameGroup].slice(0, limit);
}

/**
 * 上一篇／下一篇，語意一律是「閱讀順序」。
 *
 * 分兩種情況，因為兩種的自然順序不同：
 *
 * 系列文章走系列篇次。兩個現有系列的成員都是同一天發布的，
 * 照時序排相鄰會變成第 3 篇的「上一篇」指到第 4 篇，把閱讀順序反過來。
 *
 * 其餘文章走同分類的發布時序，prev 是較舊的、next 是較新的，
 * 沿用中文部落格的慣例。不用全站時序，因為那樣下一篇可能從國防跳到球鞋。
 */
export function getAdjacentPosts(post: PostMeta): {
  prev?: PostMeta;
  next?: PostMeta;
  /** true 表示前後篇來自系列篇次，不是分類時序 */
  bySeries: boolean;
} {
  if (post.series) {
    const inSeries = getSeriesPosts(post.series);
    const i = inSeries.findIndex((p) => p.slug === post.slug);
    if (i !== -1) {
      return { prev: inSeries[i - 1], next: inSeries[i + 1], bySeries: true };
    }
  }

  if (!post.category) return { bySeries: false };
  const inCategory = getAllPostMetas().filter((p) => p.category === post.category);
  const i = inCategory.findIndex((p) => p.slug === post.slug);
  if (i === -1) return { bySeries: false };
  // 陣列是新到舊，所以 index 較大的是較舊的
  return { prev: inCategory[i + 1], next: inCategory[i - 1], bySeries: false };
}
