const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type ProjectGroupId = "data" | "learning" | "writing";

export type ProjectIconName =
  | "radar" | "drone" | "map" | "basketball"
  | "plane" | "school" | "shield" | "news" | "books" | "karate";

export interface ProjectGroup {
  id: ProjectGroupId;
  label: string;
  accent: "sky" | "violet" | "slate";
}

/**
 * 用 Record 鎖住「每個 group id 都要有定義」：少一個 ProjectGroupId 的對應就編譯失敗，
 * 避免某組專案在 getGroupedProjects() 裡無聲消失。Object.values 保留插入順序（data → learning → writing）。
 */
const GROUP_BY_ID: Record<ProjectGroupId, ProjectGroup> = {
  data: { id: "data", label: "數據追蹤與分析", accent: "sky" },
  learning: { id: "learning", label: "航空、歷史與武術", accent: "violet" },
  writing: { id: "writing", label: "文章與舊站封存", accent: "slate" },
};

export const PROJECT_GROUPS: ProjectGroup[] = Object.values(GROUP_BY_ID);

export interface Project {
  title: string;
  description: string;
  url: string;
  icon: ProjectIconName;
  /** 若有內部導讀頁，首頁與頁尾連到 /projects/<introSlug>/ 而非直接外連。 */
  introSlug?: string;
  external: boolean;
  group: ProjectGroupId;
}

/**
 * 全站專案的單一資料來源。
 * 首頁「我的專案」與頁尾「專案」清單都從這裡讀，避免兩處不同步。
 */
export const PROJECTS: Project[] = [
  {
    title: "解放軍擾台動態追蹤",
    description: "中線越線、艦機活動每日數據，含趨勢圖與 SITREP 紀錄。",
    url: "https://pla-tracker.skyfaring.net/",
    icon: "radar",
    external: true,
    introSlug: "pla-tracker",
    group: "data",
  },
  {
    title: "無人機研究",
    description: "三個儀表板：全球無人機論文月報、烏克蘭無人機戰 2022 年至今的能力演化、台灣無人機出口季報。",
    url: `${BASE_PATH}/drone-review/`,
    icon: "drone",
    external: false,
    introSlug: "drone-research",
    group: "data",
  },
  {
    title: "TPBL Lens",
    description: "台灣職籃 TPBL 數據透鏡，球員與球隊效率分析。",
    url: `${BASE_PATH}/tpbl-lens/`,
    icon: "basketball",
    external: false,
    group: "data",
  },
  {
    title: "Shot Ledger 投籃紀錄",
    description: "單人投籃練習紀錄工具，六關挑戰階梯、命中率趨勢與球場熱區，資料存本機可匯出。",
    url: "https://shot-ledger.skyfaring.net/#/home",
    icon: "basketball",
    external: true,
    introSlug: "shot-ledger",
    group: "data",
  },
  {
    title: "飛行養成",
    description: "依 FAA PHAK 與 AFH 整理的免費飛行知識自學系統，23 個模組 327 張卡片，附機場圖鑑、失事檔案與 METAR 天氣電報課程。",
    url: "https://flightdecktw.net/",
    icon: "plane",
    external: true,
    introSlug: "flight-deck",
    group: "learning",
  },
  {
    title: "歷史學院",
    description: "國中歷史會考線上練習平台，台灣史、中國史、世界史互動題庫與進度追蹤。",
    url: "https://history-academy.skyfaring.net/",
    icon: "school",
    external: true,
    introSlug: "history-academy",
    group: "learning",
  },
  {
    title: "戰史檔案館",
    description: "用 3D 影像重現歷史戰役，依據權威史料還原關鍵軍事衝突。",
    url: "https://battle-archive.skyfaring.net/",
    icon: "shield",
    external: true,
    introSlug: "battle-archive",
    group: "learning",
  },
  {
    title: "鷹捷詠春",
    description: "黃英哲師父親授的詠春拳，師承葉問、黃淳樑、林海龍一脈，重視傳統功力訓練與實戰對練，每週二、五晚間在台北文山區上課。",
    url: "https://eagle-wingchun.pages.dev/",
    icon: "karate",
    external: true,
    group: "learning",
  },
  {
    title: "Skyfaring 文章",
    description: "航空安全、球賽數據、歷史軍事的分析文章",
    url: `${BASE_PATH}/blog/`,
    icon: "news",
    external: false,
    group: "writing",
  },
  {
    title: "舊站文章庫",
    description: "Skyfaring 2007 年起的個人部落格，武術、旅遊、語言、時事。",
    url: "https://yi-tienpan.blogspot.com/",
    icon: "books",
    external: true,
    group: "writing",
  },
];

/** 內部 url 已含 BASE_PATH；有導讀頁時連到內部導讀頁；其餘回傳原 url。 */
export function resolveProjectHref(proj: Project): string {
  if (proj.introSlug) return `${BASE_PATH}/projects/${proj.introSlug}/`;
  return proj.url;
}

/** 真的要在新分頁開外站（有導讀頁的外站不算，會先進內部導讀頁）。 */
export function projectOpensExternal(proj: Project): boolean {
  return proj.external && !proj.introSlug;
}

export interface GroupedProjects {
  group: ProjectGroup;
  projects: Project[];
}

export function getGroupedProjects(): GroupedProjects[] {
  return PROJECT_GROUPS.map((group) => ({
    group,
    projects: PROJECTS.filter((p) => p.group === group.id),
  }));
}
