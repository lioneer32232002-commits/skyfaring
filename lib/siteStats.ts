import { getAllPostMetas } from "@/lib/posts";
import { TOPIC_GROUPS, type TopicIconName } from "@/lib/taxonomy";
import { PROJECTS } from "@/lib/projects";

/**
 * 全站數字的單一來源，供版型上的小圖表使用。
 *
 * 全部在 build 時算完（讀 content/posts 的 frontmatter），輸出的是純資料，
 * 沒有任何瀏覽器端計算。頁面拿到的就是最終數字，不需要 client JS。
 */

export interface TopicCount {
  slug: string;
  label: string;
  icon: TopicIconName;
  count: number;
}

export interface MonthlyCount {
  /** "YYYY-MM" */
  key: string;
  /** 給圖表 X 軸用的短標籤，例如 "4 月" */
  label: string;
  count: number;
}

export interface SiteSummary {
  posts: number;
  projects: number;
  topics: number;
  /** 最新一篇文章的發布日期，"YYYY-MM-DD"；沒有文章時為空字串 */
  latestDate: string;
  readingMinutesTotal: number;
}

/** 取每個主題群的文章篇數，順序照 TOPIC_GROUPS，供主題頁的長條清單使用。 */
export function getTopicCounts(): TopicCount[] {
  const byCategory = getCategoryCounts();

  return TOPIC_GROUPS.map((group) => ({
    slug: group.slug,
    label: group.label,
    icon: group.icon,
    count: group.categories.reduce(
      (sum, category) => sum + (byCategory[category] ?? 0),
      0,
    ),
  }));
}

/** 取每個子分類（frontmatter 的 category）的文章篇數，沒標分類的文章不計入。 */
export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const post of getAllPostMetas()) {
    if (!post.category) continue;
    counts[post.category] = (counts[post.category] ?? 0) + 1;
  }

  return counts;
}

/** 取 "YYYY-MM"，日期缺漏或格式不符時回空字串。 */
function monthKeyOf(date: string): string {
  return /^\d{4}-\d{2}/.test(date) ? date.slice(0, 7) : "";
}

/** 把 "YYYY-MM" 往前推 n 個月，仍回 "YYYY-MM"。 */
function shiftMonth(key: string, back: number): string {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(5, 7));
  const zero = year * 12 + (month - 1) - back;
  const y = Math.floor(zero / 12);
  const m = (zero % 12) + 1;
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}`;
}

/**
 * 取最近 N 個月的發文篇數，以「最新一篇文章所在的月份」為終點往前推。
 *
 * 終點用最新文章而不是今天，這樣月初還沒發文時最後一根柱子不會是空的。
 * 中間沒有文章的月份補 0，圖表的時間軸才不會被壓縮。
 */
export function getMonthlyCounts(months = 6): MonthlyCount[] {
  const counts: Record<string, number> = {};
  let latest = "";

  for (const post of getAllPostMetas()) {
    const key = monthKeyOf(post.date || post.updated);
    if (!key) continue;
    counts[key] = (counts[key] ?? 0) + 1;
    if (key > latest) latest = key;
  }

  if (!latest || months < 1) return [];

  const result: MonthlyCount[] = [];
  for (let back = months - 1; back >= 0; back--) {
    const key = shiftMonth(latest, back);
    result.push({
      key,
      label: `${Number(key.slice(5, 7))} 月`,
      count: counts[key] ?? 0,
    });
  }

  return result;
}

/** 取首頁數字卡片要的四個總量與最新發文日期。 */
export function getSiteSummary(): SiteSummary {
  const posts = getAllPostMetas();
  const dates = posts.map((post) => post.date || post.updated).filter(Boolean);

  return {
    posts: posts.length,
    projects: PROJECTS.length,
    topics: TOPIC_GROUPS.length,
    latestDate: dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : "",
    readingMinutesTotal: posts.reduce(
      (sum, post) => sum + (post.readingMinutes || 0),
      0,
    ),
  };
}
