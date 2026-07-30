/**
 * 兩層分類：主題群（第一層） → 子分類（第二層，對應文章 frontmatter 的 category）。
 *
 * 文章本身只標單一 category，主題群由這張對照表推導，不需逐篇改檔。
 * 主題群有 ASCII slug，用來產生可被搜尋索引的落地頁 /topics/<slug>/。
 */
export type TopicIconName = "basketball" | "drone" | "brain" | "plane" | "shield";

export interface TopicGroup {
  slug: string;
  label: string;
  description: string;
  icon: TopicIconName;
  categories: string[];
}

export const TOPIC_GROUPS: TopicGroup[] = [
  {
    slug: "sports",
    label: "籃球與運動數據",
    description:
      "新竹攻城獅賽後分析、TPBL 與 NBA 籃球研究，用數據拆解球場上的勝負邏輯。",
    icon: "basketball",
    categories: ["攻城獅", "籃球研究", "球鞋"],
  },
  {
    slug: "defense",
    label: "無人載具與國防",
    description:
      "無人機蜂群、無人地面載具、攔截與國防科技論文導讀，從技術看現代戰場的樣貌。",
    icon: "drone",
    categories: ["無人機", "無人系統", "國防科技", "多代理人", "軍事"],
  },
  {
    slug: "ai-vision",
    label: "AI 與電腦視覺",
    description:
      "AI 安全、模型保護與電腦視覺追蹤技術，從論文到應用的觀察筆記。",
    icon: "brain",
    categories: ["AI", "電腦視覺"],
  },
  {
    slug: "aviation",
    label: "航空安全",
    description: "全球航空安全數據與飛航事故報告的整理與解讀。",
    icon: "plane",
    categories: ["航空"],
  },
  {
    slug: "resilience",
    label: "災防與韌性",
    description:
      "台灣的災害風險、災防體系與關鍵基礎設施韌性，以美軍印太司令部 CFE-DM 台灣災害管理參考手冊為主的逐章導讀。",
    icon: "shield",
    categories: ["災害防救"],
  },
];

export function getGroupBySlug(slug: string): TopicGroup | undefined {
  return TOPIC_GROUPS.find((g) => g.slug === slug);
}

export function getGroupForCategory(category?: string): TopicGroup | undefined {
  if (!category) return undefined;
  return TOPIC_GROUPS.find((g) => g.categories.includes(category));
}
