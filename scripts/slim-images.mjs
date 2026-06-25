// scripts/slim-images.mjs
// 就地瘦身 public/images/ 的點陣圖：長邊縮到 <= MAX、重新編碼壓縮。
// 保留檔名與副檔名，所有引用（frontmatter heroImage、元件 src）皆不需改。
// 可重複執行：已達標的小圖會被跳過。
import sharp from "sharp";
import { readdir, stat, rename, unlink } from "node:fs/promises";
import { join, extname } from "node:path";

const DIR = "public/images";
const MAX = 1920;            // 長邊上限（px）
const JPEG_Q = 82;
const WEBP_Q = 82;
const SKIP_UNDER = 150 * 1024; // 已 < 150KB 且尺寸達標就跳過

const fmtKB = (n) => `${Math.round(n / 1024)}KB`;

async function processOne(file) {
  const path = join(DIR, file);
  const ext = extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return null;

  const before = (await stat(path)).size;
  const img = sharp(path, { failOn: "none" });
  const meta = await img.metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
  const needsResize = longest > MAX;

  if (!needsResize && before < SKIP_UNDER) {
    return { file, before, after: before, skipped: true };
  }

  let pipeline = img.rotate(); // 依 EXIF 轉正後再丟棄 EXIF
  if (needsResize) {
    pipeline = pipeline.resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true });
  }
  if (ext === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true });
  } else if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: WEBP_Q });
  } else {
    pipeline = pipeline.jpeg({ quality: JPEG_Q, mozjpeg: true });
  }

  const tmp = path + ".tmp";
  await pipeline.toFile(tmp);
  const after = (await stat(tmp)).size;

  // 萬一重新編碼反而變大（已是最佳化的小圖），保留原檔
  if (after >= before && !needsResize) {
    await unlink(tmp);
    return { file, before, after: before, skipped: true };
  }
  await rename(tmp, path);
  return { file, before, after, skipped: false };
}

const files = (await readdir(DIR)).sort();
let tBefore = 0, tAfter = 0, changed = 0;
for (const f of files) {
  const r = await processOne(f);
  if (!r) continue;
  tBefore += r.before;
  tAfter += r.after;
  if (!r.skipped) {
    changed++;
    const pct = Math.round((1 - r.after / r.before) * 100);
    console.log(`✓ ${r.file}  ${fmtKB(r.before)} → ${fmtKB(r.after)}  (-${pct}%)`);
  }
}
console.log("---");
console.log(`processed ${files.length} files, ${changed} re-encoded`);
console.log(`total ${fmtKB(tBefore)} → ${fmtKB(tAfter)}  (-${Math.round((1 - tAfter / tBefore) * 100)}%)`);
