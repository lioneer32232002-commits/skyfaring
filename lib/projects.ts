const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type ProjectGroupId = "data" | "learning" | "writing";

export type ProjectIconName =
  | "radar" | "drone" | "map" | "basketball"
  | "plane" | "school" | "shield" | "news" | "books";

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
  learning: { id: "learning", label: "航空與歷史學習", accent: "violet" },
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
    url: "https://pla-tracker.pages.dev/",
    icon: "radar",
    external: true,
    introSlug: "pla-tracker",
    group: "data",
  },
  {
    title: "無人機技術情報",
    description: "中國 vs 非中國 vs 台灣的無人機論文觀察，民用與軍用同頁切換，含領域活躍度與發展脈絡。",
    url: `${BASE_PATH}/drone-review/`,
    icon: "drone",
    external: false,
    group: "data",
  },
  {
    title: "烏克蘭無人機戰研究",
    description: "俄烏戰爭至今烏克蘭團隊的無人機研究與戰場技術演化，依能力領域整理，含演進時間線與來源可信度分層。",
    url: `${BASE_PATH}/ukraine-review/`,
    icon: "map",
    external: false,
    group: "data",
  },
  {
    title: "台灣無人機出口追蹤",
    description: "台灣無人機廠商的區域分布、公開財報與出口數據，每季追蹤，含 Blue UAS 認證與輸往烏克蘭的流向。",
    url: `${BASE_PATH}/taiwan-review/`,
    icon: "drone",
    external: false,
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
    title: "飛行線上",
    description: "飛行養成學習系統，飛行訓練與航空教育資源。",
    url: "https://flight-deck-1sr.pages.dev/",
    icon: "plane",
    external: true,
    introSlug: "flight-deck",
    group: "learning",
  },
  {
    title: "歷史學院",
    description: "國中歷史會考線上練習平台，台灣史、中國史、世界史互動題庫與進度追蹤。",
    url: "https://history-academy.pages.dev/",
    icon: "school",
    external: true,
    introSlug: "history-academy",
    group: "learning",
  },
  {
    title: "戰史檔案館",
    description: "用 3D 影像重現歷史戰役，依據權威史料還原關鍵軍事衝突。",
    url: "https://battle-archive.pages.dev/",
    icon: "shield",
    external: true,
    introSlug: "battle-archive",
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
