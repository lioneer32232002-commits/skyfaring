// scripts/make-thumbs.mjs
// 為 public/images/ 底下的點陣圖產生卡片用縮圖，輸出到 public/images/thumbs/。
//
// 為什麼需要這層：文章列表頁一次排 70+ 張卡片，卡片顯示寬度只有 320–384px，
// 但原檔是 1920px 的 hero 圖。直接讓卡片吃原檔，等於一頁拉十幾 MB。
//
// 產出兩種寬度供 srcset 用：
//   400w → 手機單欄（343px 容器）
//   800w → 桌機三欄（約 320px 容器）的 2 倍點密度
// 輸出保持與來源相同的相對路徑，例如 cmr52/foo.jpeg → thumbs/cmr52/foo-800.webp
//
// 可重複執行：來源沒動過就跳過。build 前由 npm 的 prebuild 自動呼叫，
// 所以 thumbs/ 不進版控（見 .gitignore），不會有過期縮圖的問題。
import sharp from "sharp";
import { readdir, stat, mkdir, writeFile } from "node:fs/promises";
import { join, extname, dirname, relative } from "node:path";

const SRC_DIR = "public/images";
const OUT_DIR = "public/images/thumbs";
const MANIFEST = join(OUT_DIR, "manifest.json");
const WIDTHS = [400, 800];
const WEBP_Q = 76;
const EXTS = [".jpg", ".jpeg", ".png", ".webp"];

const fmtKB = (n) => `${Math.round(n / 1024)}KB`;

/** 遞迴列出 SRC_DIR 底下所有圖檔，回傳相對 SRC_DIR 的路徑。跳過 OUT_DIR 自己。 */
async function listImages(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (relative(SRC_DIR, full) === "thumbs") continue;
      out.push(...(await listImages(full)));
    } else if (EXTS.includes(extname(entry.name).toLowerCase())) {
      out.push(relative(SRC_DIR, full));
    }
  }
  return out;
}

/** 來源比既有縮圖新（或縮圖不存在）才需要重做。 */
async function needsRebuild(srcPath, outPath) {
  try {
    const [s, o] = await Promise.all([stat(srcPath), stat(outPath)]);
    return s.mtimeMs > o.mtimeMs;
  } catch {
    return true; // 縮圖不存在
  }
}

export function thumbName(relPath, width) {
  const ext = extname(relPath);
  return `${relPath.slice(0, -ext.length)}-${width}.webp`;
}

const images = (await listImages(SRC_DIR)).sort();
let made = 0;
let skipped = 0;
let totalBytes = 0;
const failed = [];

/**
 * manifest：來源圖相對路徑 → { w, h, thumbs: [產出成功的寬度] }
 * 前端用它判斷「這張有沒有縮圖可用」與「原始長寬比」，
 * 不必在 build 時再解一次圖，也不必把 sharp 拉進 lib/。
 */
const manifest = {};

for (const rel of images) {
  const srcPath = join(SRC_DIR, rel);

  let meta;
  try {
    meta = await sharp(srcPath, { failOn: "none" }).metadata();
  } catch {
    meta = {};
  }
  manifest[rel.split("\\").join("/")] = {
    w: meta.width ?? 0,
    h: meta.height ?? 0,
    thumbs: [],
  };

  for (const width of WIDTHS) {
    const outRel = thumbName(rel, width);
    const outPath = join(OUT_DIR, outRel);

    if (!(await needsRebuild(srcPath, outPath))) {
      skipped++;
      totalBytes += (await stat(outPath)).size;
      manifest[rel.split("\\").join("/")].thumbs.push(width);
      continue;
    }

    await mkdir(dirname(outPath), { recursive: true });
    try {
      await sharp(srcPath, { failOn: "none" })
        .rotate() // 依 EXIF 轉正後丟棄 EXIF
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_Q })
        .toFile(outPath);
      manifest[rel.split("\\").join("/")].thumbs.push(width);
    } catch (err) {
      // 單張來源圖解碼失敗不該讓整個 build 掛掉。
      // 卡片端會偵測縮圖不存在並退回原檔，畫面仍正常，只是這張沒瘦身。
      failed.push(rel);
      console.warn(`✗ ${rel} (${width}w) 產生失敗：${err.message}`);
      continue;
    }

    const size = (await stat(outPath)).size;
    totalBytes += size;
    made++;
    console.log(`✓ ${outRel}  ${fmtKB(size)}`);
  }
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 0) + "\n", "utf8");

console.log("---");
console.log(`${images.length} 張來源圖，產生 ${made} 個縮圖，跳過 ${skipped} 個（已是最新）`);
console.log(`thumbs/ 合計 ${fmtKB(totalBytes)}，manifest 已寫入`);
if (failed.length) {
  const uniq = [...new Set(failed)];
  console.warn(`⚠ ${uniq.length} 張來源圖無法產生縮圖，將退回原檔：${uniq.join(", ")}`);
}
