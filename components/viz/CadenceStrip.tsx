/**
 * 更新節奏條。12 個格子代表一年 12 個月，格子裡的記號表示那個月會拿到什麼。
 *
 * 三種節奏畫成三種形狀，不是三種亮暗，讀者不必比較亮度就分得出來：
 * 週更每格是一條短橫線（那個月從頭更到尾），月更每格是一顆圓點（那個月更一次），
 * 季更只有 1、4、7、10 月亮圓點，其餘月份留淡點當空格，才看得出間隔有多長。
 */

export type Cadence = "週" | "月" | "季";

const MONTHS = 12;

/** 季更亮 1、4、7、10 月；週更與月更每個月都有。 */
function isLit(cadence: Cadence, index: number): boolean {
  return cadence === "季" ? index % 3 === 0 : true;
}

const ARIA: Record<Cadence, string> = {
  週: "更新節奏：每週更新，一年 12 個月每個月都有數次新內容",
  月: "更新節奏：每月更新，一年 12 個月每個月更新一次",
  季: "更新節奏：每季更新，一年 12 個月中有 4 個月有新內容",
};

/**
 * 把資料裡的節奏字串（例如「每月累積更新」）換成節奏條要的三種節奏之一。
 * 判斷只看字串裡有沒有「週」或「季」，其餘一律當每月更新。
 */
export function cadenceFromLabel(text: string): Cadence {
  if (text.includes("週")) return "週";
  if (text.includes("季")) return "季";
  return "月";
}

export interface CadenceStripProps {
  cadence: Cadence;
  /** 右側文字，省略時用「每週更新」這類預設寫法 */
  label?: string;
}

export default function CadenceStrip({ cadence, label }: CadenceStripProps) {
  return (
    <span
      role="img"
      aria-label={ARIA[cadence]}
      className="inline-flex flex-wrap items-center gap-x-2 gap-y-1"
    >
      <span aria-hidden className="flex items-center gap-[3px]">
        {Array.from({ length: MONTHS }, (_, i) => {
          const lit = isLit(cadence, i);

          if (cadence === "週") {
            return (
              <span key={i} className="block h-2 w-3 rounded-sm bg-sky-500" />
            );
          }

          return (
            <span
              key={i}
              className={`block w-2 h-2 rounded-full ${
                lit ? "bg-sky-500" : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          );
        })}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {label ?? `每${cadence}更新`}
      </span>
    </span>
  );
}
