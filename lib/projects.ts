const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export interface Project {
  title: string;
  description: string;
  url: string;
  icon: string;
  external: boolean;
}

/**
 * 全站專案的單一資料來源。
 * 首頁「我的專案」與頁尾「專案」清單都從這裡讀，避免兩處不同步。
 */
export const PROJECTS: Project[] = [
  {
    title: "Skyfaring 文章",
    description: "航空安全、球賽數據、歷史軍事的分析文章",
    url: `${BASE_PATH}/blog/`,
    icon: "📊",
    external: false,
  },
  {
    title: "解放軍擾台動態追蹤",
    description: "中線越線、艦機活動每日數據，含趨勢圖與 SITREP 紀錄",
    url: "https://pla-tracker.pages.dev/",
    icon: "🛩",
    external: true,
  },
  {
    title: "無人機技術情報",
    description: "中國 vs 非中國 vs 台灣的無人機論文觀察，民用與軍用同頁切換，含領域活躍度與發展脈絡",
    url: `${BASE_PATH}/drone-review/`,
    icon: "🛰",
    external: false,
  },
  {
    title: "TPBL Lens",
    description: "台灣職籃 TPBL 數據透鏡，球員與球隊效率分析",
    url: `${BASE_PATH}/tpbl-lens/`,
    icon: "🏀",
    external: false,
  },
  {
    title: "飛行線上",
    description: "飛行養成學習系統，飛行訓練與航空教育資源",
    url: "https://flight-deck-1sr.pages.dev/",
    icon: "✈",
    external: true,
  },
  {
    title: "戰史檔案館",
    description: "用 3D 影像重現歷史戰役，依據權威史料還原關鍵軍事衝突",
    url: "https://battle-archive.pages.dev/",
    icon: "⚔",
    external: true,
  },
  {
    title: "歷史學院",
    description: "國中歷史會考線上練習平台，台灣史、中國史、世界史互動題庫與進度追蹤",
    url: "https://history-academy.pages.dev/",
    icon: "📜",
    external: true,
  },
  {
    title: "舊站文章庫",
    description: "Skyfaring 2007年起的個人部落格，武術、旅遊、語言、時事",
    url: "https://yi-tienpan.blogspot.com/",
    icon: "📚",
    external: true,
  },
];
