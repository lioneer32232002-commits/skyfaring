import ProjectIcon from "@/components/ProjectIcon";
import UiIcon from "@/components/UiIcon";

/*
  航空類文章（category: 航空）文末的 FLIGHT DECK 導流卡。
  整張卡可點，開新分頁到姊妹站 flightdecktw.net。
  文案與 lib/projects.ts 的專案描述同步，改的時候兩邊一起改。
*/
export default function FlightDeckCard() {
  return (
    <a
      href="https://flightdecktw.net/"
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-10 flex items-start gap-4 p-5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950 hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-md transition-all"
    >
      <div className="shrink-0 w-11 h-11 rounded-lg bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400">
        <ProjectIcon name="plane" className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mb-0.5">站內延伸</p>
        <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
          FLIGHT DECK 飛行養成
          <UiIcon name="arrow-up-right" className="w-4 h-4 shrink-0 opacity-60" />
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          依 FAA 教材 PHAK 與 AFH 整理的免費飛行知識自學系統，23 個模組、327 張記憶卡，附機場圖鑑、失事檔案與 METAR 天氣電報課程。
        </p>
      </div>
    </a>
  );
}
