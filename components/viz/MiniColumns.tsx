/**
 * 小柱狀圖，用來看每月發文的量。純 inline SVG，沒有任何 client JS。
 *
 * 只有最高的一根柱子標數值，其餘交給旁邊的 sr-only 表格，
 * 每根柱子都標數字會變成一片雜訊，反而沒人讀。
 */

export interface MiniColumnsDatum {
  label: string;
  value: number;
}

export interface MiniColumnsProps {
  data: MiniColumnsDatum[];
  /** 柱子區的高度（不含 X 軸標籤與數值標籤），預設 64 */
  height?: number;
  /** 整張圖的寬度，省略時由柱數推算 */
  width?: number;
  ariaLabel: string;
}

/** 柱寬與間距由 X 軸標籤決定：「4 月」在 fontSize 10 下約 23px 寬，柱距要留得下才不會兩兩相黏。 */
const BAR_W = 16;
const GAP = 10;
const TOP_PAD = 12;
const AXIS_BAND = 14;
const RADIUS = 2;

/** 柱頂 2px 圓角、底部方角。用 path 畫，rect 的 rx 會把四角都磨圓。 */
function topRoundedBar(x: number, y: number, w: number, h: number): string {
  const r = Math.min(RADIUS, h, w / 2);
  return [
    `M ${x} ${y + r}`,
    `a ${r} ${r} 0 0 1 ${r} ${-r}`,
    `h ${w - 2 * r}`,
    `a ${r} ${r} 0 0 1 ${r} ${r}`,
    `v ${h - r}`,
    `h ${-w}`,
    "z",
  ].join(" ");
}

export default function MiniColumns({
  data,
  height = 64,
  width,
  ariaLabel,
}: MiniColumnsProps) {
  if (data.length === 0) return null;

  const step = BAR_W + GAP;
  const plotW = data.length * step - GAP;
  const chartW = width ?? plotW;
  const totalH = TOP_PAD + height + AXIS_BAND;
  const max = Math.max(1, ...data.map((d) => d.value));
  const peak = data.reduce(
    (best, d, i) => (d.value > data[best].value ? i : best),
    0,
  );
  const baseline = TOP_PAD + height;

  return (
    <div>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${plotW} ${totalH}`}
        width={chartW}
        height={totalH}
        className="max-w-full h-auto"
      >
        {data.map((d, i) => {
          const x = i * step;
          const h = (d.value / max) * height;
          const y = baseline - h;
          const last = i === data.length - 1;

          return (
            <g key={d.label}>
              {h > 0 && (
                <path
                  d={topRoundedBar(x, y, BAR_W, h)}
                  className={
                    last ? "fill-sky-600 dark:fill-sky-400" : "fill-sky-500"
                  }
                />
              )}
              {i === peak && (
                <text
                  x={x + BAR_W / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-slate-500 dark:fill-slate-400"
                >
                  {d.value}
                </text>
              )}
              <text
                x={x + BAR_W / 2}
                y={baseline + 11}
                textAnchor="middle"
                fontSize={10}
                className="fill-slate-500 dark:fill-slate-400"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
