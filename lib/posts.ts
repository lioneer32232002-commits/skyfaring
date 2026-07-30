import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { resolveHeroThumbs, type HeroThumbs } from "@/lib/heroImage";

/**
 * 在中文與英數字之間自動補半形空格（盤古之白）
 * 不影響 HTML 標籤內容與標點符號
 */
export function addPangu(html: string): string {
  // 只處理標籤之間的文字節點，不動 HTML 屬性
  return html.replace(/>([^<]+)</g, (match, text) => {
    const spaced = text
      // 中文後接英數
      .replace(/([\u4e00-\u9fff\u3400-\u4dbf])([A-Za-z0-9])/g, "$1 $2")
      // 英數後接中文
      .replace(/([A-Za-z0-9])([\u4e00-\u9fff\u3400-\u4dbf])/g, "$1 $2");
    return `>${spaced}<`;
  });
}

export function addPanguText(text: string): string {
  return text
    .replace(/([\u4e00-\u9fff\u3400-\u4dbf])([A-Za-z0-9])/g, "$1 $2")
    .replace(/([A-Za-z0-9])([\u4e00-\u9fff\u3400-\u4dbf])/g, "$1 $2");
}

/**
 * \u628a\u6bcf\u500b <table> \u5305\u9032\u53ef\u6c34\u5e73\u6372\u52d5\u7684\u5713\u89d2\u5361\u7247\u3002
 * \u624b\u6a5f\u4e0a\u7531\u9019\u5c64\u5361\u7247\u6372\u52d5\uff0c\u9801\u9762\u672c\u8eab\u4e0d\u6703\u88ab\u5bec\u8868\u6490\u7834\u3002
 */
export function wrapTables(html: string): string {
  return html
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

export interface TocEntry {
  id: string;
  text: string;
  /** 2 或 3，對應 h2 / h3 */
  level: number;
}

/**
 * 從已產生的 HTML 抓目錄。
 *
 * 直接讀渲染結果而不是另外解析一次 markdown，是為了保證目錄的 id
 * 與頁面上實際的 heading id 一定對得上（id 由 rehype-slug 產生）。
 * 抓在 addPangu 之後，所以目錄文字與標題顯示的文字一致。
 */
export function extractToc(htmlStr: string): TocEntry[] {
  const out: TocEntry[] = [];
  const re = /<h([23])\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(htmlStr)) !== null) {
    const text = m[3].replace(/<[^>]*>/g, "").trim();
    if (text) out.push({ level: Number(m[1]), id: m[2], text });
  }
  return out;
}

/**
 * 估算閱讀時間（分鐘）。
 *
 * 中英文混排要分開算：中文按字數、英文按詞數，兩者的閱讀速率差很多。
 * 取中文每分鐘 350 字、英文每分鐘 200 詞，這是中文長文常用的區間。
 * 至少回 1 分鐘，避免短文顯示 0。
 */
export function estimateReadingMinutes(markdown: string): number {
  // 去掉 frontmatter 以外的雜訊：程式碼區塊、連結網址、圖片語法
  const text = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");

  const cjk = (text.match(/[一-鿿㐀-䶿]/g) ?? []).length;
  const latinWords = (text.match(/[A-Za-z][A-Za-z'-]*/g) ?? []).length;

  return Math.max(1, Math.round(cjk / 350 + latinWords / 200));
}

const postsDirectory = path.join(process.cwd(), "content/posts");

/**
 * 把 frontmatter 的日期一律收斂成 "YYYY-MM-DD" 字串。
 *
 * YAML 對 date-only 的值有兩種解讀：`date: "2026-07-29"` 是字串，
 * 但沒加引號的 `date: 2026-07-29` 會被解析成 Date 物件（目前 72 篇裡有 18 篇是後者）。
 * 兩種混在一起有三個後果：
 *
 * 1. PostMeta 宣告 date 是 string，實際卻可能是 Date，型別對不上實情
 * 2. JSON-LD 的 datePublished 會出現兩種格式（"2026-07-29" 與帶時間的 ISO 字串）
 * 3. 文章頁用 `post.date !== post.updated` 決定要不要顯示「更新：」。
 *    兩個同日但未加引號的值會是兩個不同的 Date 物件，!== 成立，
 *    於是印出「發布：某日，更新：同一日」
 *
 * 在這一層收斂，好處是新文章不必依賴作者記得加引號。
 * 用 UTC 取值：YAML 把 date-only 當成 UTC 午夜，若用本地時間取值，
 * 在負時區會退成前一天。
 */
function toDateString(value: unknown): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") return value.trim();
  return "";
}

export interface PostMeta {
  slug: string;
  title: string;
  author: string;
  date: string;
  updated: string;
  excerpt: string;
  /**
   * 專供搜尋結果用的簡短描述，選填。
   *
   * excerpt 同時被卡片和 meta description 用，但兩邊的合適長度差很多：
   * 卡片被 line-clamp-3 切掉，中文搜尋結果大約 80 個全形字就截斷，
   * 而目前 excerpt 的中位數約 260 字。填了這個欄位就改用它當 meta description，
   * 沒填則沿用 excerpt，所以可以逐篇補、不必一次重寫全部摘要。
   */
  metaDescription?: string;
  tags: string[];
  category?: string;
  /** 多部曲的系列名，同名者視為同一系列；閱讀順序由 getAllPostMetas 的排序決定 */
  series?: string;
  /** 估算閱讀時間（分鐘） */
  readingMinutes: number;
  heroImage?: string;
  heroAlt?: string;
  heroCredit?: string;
  heroCreditUrl?: string;
  heroPosition?: string;
  /** 卡片用的縮圖來源，build 時由 thumbs manifest 算出；無 heroImage 時為 undefined */
  heroThumbs?: HeroThumbs;
  highlight?: string;
  source?: string;
  source_url?: string;
  references?: { title: string; url?: string }[];
}

export interface Post extends PostMeta {
  contentHtml: string;
  /** 文章的 h2 / h3 目錄 */
  toc: TocEntry[];
}

export function getAllPostMetas(): PostMeta[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = fileNames
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      return {
        slug,
        title: data.title ?? "",
        author: data.author ?? "",
        date: toDateString(data.date),
        updated: toDateString(data.updated ?? data.date),
        excerpt: data.excerpt ?? "",
        metaDescription: data.metaDescription,
        tags: data.tags ?? [],
        category: data.category,
        series: data.series,
        readingMinutes: estimateReadingMinutes(content),
        heroImage: data.heroImage,
        heroAlt: data.heroAlt,
        heroCredit: data.heroCredit,
        heroCreditUrl: data.heroCreditUrl,
        heroPosition: data.heroPosition,
        heroThumbs: data.heroImage ? resolveHeroThumbs(data.heroImage) : undefined,
        source: data.source,
        source_url: data.source_url,
        references: data.references ?? [],
      } as PostMeta;
    });

  return allPosts.sort((a, b) => {
    const dateDiff = new Date(b.updated).getTime() - new Date(a.updated).getTime();
    if (dateDiff !== 0) return dateDiff;
    // 同日期：用 slug 升序當穩定的次序鍵。
    // 不用檔案 mtime——OneDrive 同步與 git 操作都會改 mtime，導致同日文章順序飄移。
    // slug 升序對多部曲（如 ifri-miltech-ukraine-autonomous→c4isr→deep-fighting＝上→中→下）正好是閱讀順序。
    return a.slug.localeCompare(b.slug);
  });
}

export async function getPost(slug: string): Promise<Post> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // 從 remark-html 換成 remark-rehype + rehype-slug + rehype-stringify，
  // 目的是讓 h2/h3 帶上 id：原本標題沒有 id，既沒辦法深連結到某一節，也做不出目錄。
  // 沒有文章在 markdown 裡用原生 HTML，所以兩條管線的輸出除了多出的 id 之外一致。
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(content);
  const contentHtml = wrapTables(addPangu(processedContent.toString()));
  const toc = extractToc(contentHtml);

  return {
    slug,
    title: data.title ?? "",
    author: data.author ?? "",
    date: toDateString(data.date),
    updated: toDateString(data.updated ?? data.date),
    excerpt: data.excerpt ?? "",
    metaDescription: data.metaDescription,
    tags: data.tags ?? [],
    category: data.category,
    series: data.series,
    readingMinutes: estimateReadingMinutes(content),
    heroImage: data.heroImage,
    heroAlt: data.heroAlt,
    heroCredit: data.heroCredit,
    heroCreditUrl: data.heroCreditUrl,
    heroPosition: data.heroPosition,
    heroThumbs: data.heroImage ? resolveHeroThumbs(data.heroImage) : undefined,
    highlight: data.highlight,
    source: data.source,
    source_url: data.source_url,
    references: data.references ?? [],
    contentHtml,
    toc,
  };
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
