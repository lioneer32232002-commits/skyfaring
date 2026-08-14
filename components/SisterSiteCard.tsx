import ProjectIcon from "@/components/ProjectIcon";
import UiIcon from "@/components/UiIcon";
import type { ProjectIconName } from "@/lib/projects";

/*
  文末的姊妹站導流卡：依文章 category 決定掛哪一站，沒對應就不渲染。
  整張卡可點，開新分頁。文案與 lib/projects.ts 的專案描述同步，改的時候兩邊一起改。
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

const PROMO_BY_CATEGORY: Record<string, PromoConfig> = {
  航空: FLIGHT_DECK,
  籃球研究: SHOT_LEDGER,
  攻城獅: SHOT_LEDGER,
  球鞋: SHOT_LEDGER,
};

export default function SisterSiteCard({ category }: { category?: string }) {
  const promo = category ? PROMO_BY_CATEGORY[category] : undefined;
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
