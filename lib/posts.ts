import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

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

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  author: string;
  date: string;
  updated: string;
  excerpt: string;
  tags: string[];
  heroImage?: string;
  heroAlt?: string;
  heroCredit?: string;
  heroCreditUrl?: string;
  highlight?: string;
  source?: string;
  source_url?: string;
  references?: { title: string; url?: string }[];
}

export interface Post extends PostMeta {
  contentHtml: string;
}

export function getAllPostMetas(): PostMeta[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = fileNames
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);
      return {
        slug,
        title: data.title ?? "",
        author: data.author ?? "",
        date: data.date ?? "",
        updated: data.updated ?? data.date ?? "",
        excerpt: data.excerpt ?? "",
        tags: data.tags ?? [],
        heroImage: data.heroImage,
        heroAlt: data.heroAlt,
        heroCredit: data.heroCredit,
        heroCreditUrl: data.heroCreditUrl,
        source: data.source,
        source_url: data.source_url,
        references: data.references ?? [],
      } as PostMeta;
    });

  return allPosts.sort((a, b) => {
    const dateDiff = new Date(b.updated).getTime() - new Date(a.updated).getTime();
    if (dateDiff !== 0) return dateDiff;
    // same date: use file mtime as tiebreaker (newer file first)
    const mtimeA = fs.statSync(path.join(postsDirectory, `${a.slug}.md`)).mtimeMs;
    const mtimeB = fs.statSync(path.join(postsDirectory, `${b.slug}.md`)).mtimeMs;
    return mtimeB - mtimeA;
  });
}

export async function getPost(slug: string): Promise<Post> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(remarkGfm).use(html).process(content);
  const contentHtml = addPangu(processedContent.toString());

  return {
    slug,
    title: data.title ?? "",
    author: data.author ?? "",
    date: data.date ?? "",
    updated: data.updated ?? data.date ?? "",
    excerpt: data.excerpt ?? "",
    tags: data.tags ?? [],
    heroImage: data.heroImage,
    heroAlt: data.heroAlt,
    heroCredit: data.heroCredit,
    heroCreditUrl: data.heroCreditUrl,
    highlight: data.highlight,
    source: data.source,
    source_url: data.source_url,
    references: data.references ?? [],
    contentHtml,
  };
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
