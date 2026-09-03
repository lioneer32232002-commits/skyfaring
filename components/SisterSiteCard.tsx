import ProjectIcon from "@/components/ProjectIcon";
import UiIcon from "@/components/UiIcon";
import type { ProjectIconName } from "@/lib/projects";

/*
  文末的姊妹站導流卡：依文章 category 決定掛哪一站，沒對應就不渲染。
  整張卡可點，開新分頁。文案與 lib/projects.ts 的專案描述同步，改的時候兩邊一起改。
  無人機兩張卡刻意連到個別儀表板而非 /projects/drone-research/ 入口頁：文章脈絡已經決定讀者要看哪一頁，直接深連比再經過入口頁少一跳。
*/
type PromoConfig = {
  title: string;
  description: string;
  url: string;
  icon: ProjectIconName;
};

const FLIGHT_DECK: PromoConfig = {
  title: "FLIGHT DECK 飛行養成",
  description:
    "依 FAA 教材 PHAK 與 AFH 整理的免費飛行知識自學系統，23 個模組、327 張記憶卡，附機場圖鑑、失事檔案與 METAR 天氣電報課程。",
  url: "https://flightdecktw.net/",
  icon: "plane",
};

const SHOT_LEDGER: PromoConfig = {
  title: "Shot Ledger 投籃紀錄",
  description:
    "單人投籃練習紀錄工具，六關挑戰階梯、命中率趨勢與球場熱區，資料存本機可匯出。",
  url: "https://shot-ledger.skyfaring.net/",
  icon: "basketball",
};

const PLA_TRACKER: PromoConfig = {
  title: "解放軍擾台動態追蹤",
  description: "中線越線、艦機活動每日數據，含趨勢圖與 SITREP 紀錄。",
  url: "https://pla-tracker.skyfaring.net/",
  icon: "radar",
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const DRONE_REVIEW: PromoConfig = {
  title: "無人機研究：技術情報月報",
  description: "民用與軍用論文同頁切換，依中國、非中國、台灣分組，看各子主題的活躍度與走向，每月更新。",
  url: `${BASE_PATH}/drone-review/`,
  icon: "drone",
};

const UKRAINE_REVIEW: PromoConfig = {
  title: "無人機研究：烏克蘭戰場",
  description: "2022 年開戰至今的戰場能力演化，依能力領域與四個階段整理，含來源可信度分層，每月累積更新。",
  url: `${BASE_PATH}/ukraine-review/`,
  icon: "map",
};

const PROMO_BY_CATEGORY: Record<string, PromoConfig> = {
  航空: FLIGHT_DECK,
  籃球研究: SHOT_LEDGER,
  攻城獅: SHOT_LEDGER,
  球鞋: SHOT_LEDGER,
  無人機: DRONE_REVIEW,
};

/*
  分類對不上時看 tags：
  台海相關（軍事類分不出台海與二戰史、烏克蘭戰史）→ PLA Tracker，
  再來烏克蘭 tag → 無人機研究的烏克蘭戰場儀表板，
  最後無人機 tag（掛在多代理人、電腦視覺分類下的無人機論文）→ 無人機研究的技術情報月報。
  台灣無人機政策文多邊 tag 都有，PLA Tracker 優先；
  台灣無人機出口烏克蘭那篇也帶烏克蘭 tag，同樣走 PLA Tracker。
*/
const PLA_TAGS = new Set(["解放軍", "兩岸", "台海", "中國海軍", "國防政策", "國防產業"]);

export default function SisterSiteCard({
  category,
  tags = [],
}: {
  category?: string;
  tags?: string[];
}) {
  const promo =
    (category ? PROMO_BY_CATEGORY[category] : undefined) ??
    (tags.some((t) => PLA_TAGS.has(t)) ? PLA_TRACKER : undefined) ??
    (tags.includes("烏克蘭") ? UKRAINE_REVIEW : undefined) ??
    (tags.includes("無人機") ? DRONE_REVIEW : undefined);
  if (!promo) return null;

  return (
    <a
      href={promo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-10 flex items-start gap-4 p-5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950 hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-md transition-all"
    >
      <div className="shrink-0 w-11 h-11 rounded-lg bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400">
        <ProjectIcon name={promo.icon} className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mb-0.5">站內延伸</p>
        <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
          {promo.title}
          <UiIcon name="arrow-up-right" className="w-4 h-4 shrink-0 opacity-60" />
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          {promo.description}
        </p>
      </div>
    </a>
  );
}
