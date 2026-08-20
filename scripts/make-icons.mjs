// scripts/make-icons.mjs
// 產生全站圖示：瀏覽器分頁的 favicon，以及手機「加入主畫面」用的 app 圖示。
//
// 為什麼需要這支：原本站上只有 favicon.ico 與 favicon.svg，沒有 web app manifest、
// 也沒有 apple-touch-icon。手機安裝成 app 時找不到大尺寸圖，只能拿分頁用的小圖
// 放大，圖示因此糊掉。這支把同一份幾何一次輸出成各平台要的尺寸與格式。
//
// 幾何與配色只寫在這裡一份，favicon.svg 也是這支產生的，避免向量母檔與 PNG 走鐘。
// 可重複執行，覆寫輸出。改完圖示跑：node scripts/make-icons.mjs
//
// 三種底圖不能混用，各平台的裁切方式不同：
//   圓形去背  → 瀏覽器分頁、manifest 的 purpose:any，維持原本的圓形識別
//   方形滿版  → manifest 的 purpose:maskable。Android 會按launcher 形狀裁切，
//               圖案必須縮在中央 80% 的安全區內，四周留給裁切
//   方形不透明 → apple-touch-icon。iOS 不吃透明色（會填成黑底），且自己會切圓角
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const NAVY = "#0f172a"; // slate-900，與站上深色背景同色
const WING_UPPER = "#7dd3fc"; // sky-300
const WING_LOWER = "#38bdf8"; // sky-400

// 紙飛機：右側機頭 (54,32)，左上與左下翼尖，左側中央收出 V 形凹口。
// 上下兩片用不同深淺的藍，做出折線。座標以 64 為基準。
const PLANE = `
  <path d="M54 32 10 13l8 19z" fill="${WING_UPPER}"/>
  <path d="M54 32 18 32l-8 19z" fill="${WING_LOWER}"/>`;

/** 圓形去背版，用於瀏覽器分頁、頁首 logo 與 manifest 的 purpose:any */
const roundSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="32" fill="${NAVY}"/>${PLANE}
</svg>
`;

/** 方形滿版版。scale 把圖案縮進安全區，1 是滿版、0.78 約當四周各留 11%。 */
const squareSvg = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" fill="${NAVY}"/>
  <g transform="translate(32 32) scale(${scale}) translate(-32 -32)">${PLANE}
  </g>
</svg>
`;

/** density 拉高是為了讓 sharp 以高解析度光柵化向量，避免邊緣鋸齒 */
const render = (svg, size) =>
  sharp(Buffer.from(svg), { density: 1200 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/**
 * 最小的 ICO 封裝：現代 .ico 可以直接內嵌 PNG，不必轉 BMP。
 * 結構是 6 bytes 檔頭 ＋ 每張圖 16 bytes 目錄項 ＋ 各張 PNG 原始位元組。
 * sharp 不支援 ico 輸出，所以自己組。
 */
function encodeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // 0 代表 256
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // 調色盤數
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // color planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

await mkdir("public/icons", { recursive: true });

// 向量母檔：瀏覽器分頁與頁首 logo 都吃這份，放大不失真
await writeFile("public/favicon.svg", roundSvg);

const outputs = [
  ["public/icons/icon-192.png", roundSvg, 192],
  ["public/icons/icon-512.png", roundSvg, 512],
  ["public/icons/icon-maskable-512.png", squareSvg(0.78), 512],
  ["public/icons/apple-touch-icon.png", squareSvg(0.8), 180],
];

for (const [path, svg, size] of outputs) {
  await writeFile(path, await render(svg, size));
  console.log(`${path}  ${size}x${size}`);
}

// favicon.ico 一併重產，否則吃 .ico 的環境還是舊圖案，跟 svg 對不起來
const icoSizes = [16, 32, 48, 256];
const icoImages = await Promise.all(
  icoSizes.map(async (size) => ({ size, data: await render(roundSvg, size) }))
);
await writeFile("app/favicon.ico", encodeIco(icoImages));
console.log(`app/favicon.ico  ${icoSizes.join("/")}`);
