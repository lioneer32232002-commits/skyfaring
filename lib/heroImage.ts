import fs from "fs";
import path from "path";

/**
 * 卡片縮圖的解析層。
 *
 * scripts/make-thumbs.mjs 會在 build 前產生 public/images/thumbs/ 與一份 manifest，
 * 這裡只負責讀 manifest、把「該用哪個檔、srcset 怎麼寫」算好，
 * 交給用戶端元件直接用。用戶端拿不到 fs，所以這件事必須在這層做完。
 *
 * manifest 不存在（有人跳過 prebuild 直接 next build）或某張圖沒縮圖時，
 * 一律退回原檔，畫面不會壞，只是那張沒瘦身。
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const MANIFEST_PATH = path.join(process.cwd(), "public/images/thumbs/manifest.json");

interface ManifestEntry {
  w: number;
  h: number;
  thumbs: number[];
}

export interface HeroThumbs {
  /** 已含 BASE_PATH，直接放進 img src，不要再自己加前綴 */
  src: string;
  /** 已含 BASE_PATH 的 srcset 字串；沒有縮圖可用時為空字串 */
  srcSet: string;
  /** 原圖尺寸，給 width/height 屬性用來預留版位，讀不到時為 0 */
  width: number;
  height: number;
}

let cache: Record<string, ManifestEntry> | null = null;

function loadManifest(): Record<string, ManifestEntry> {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    cache = {};
  }
  return cache!;
}

/** 把 /images/foo/bar.jpg 這種 heroImage 值換成 manifest 的鍵（相對 public/images 的路徑）。 */
function manifestKey(heroImage: string): string {
  return heroImage.replace(/^\/?images\//, "");
}

function thumbUrl(key: string, width: number): string {
  const ext = path.extname(key);
  return `${BASE_PATH}/images/thumbs/${key.slice(0, -ext.length)}-${width}.webp`;
}

/**
 * 算出卡片用的圖片來源。
 * 有縮圖就用 400w/800w 的 webp 組 srcset，沒有就退回原檔。
 */
export function resolveHeroThumbs(heroImage: string): HeroThumbs {
  const original = `${BASE_PATH}${heroImage}`;
  const entry = loadManifest()[manifestKey(heroImage)];

  if (!entry || entry.thumbs.length === 0) {
    return { src: original, srcSet: "", width: entry?.w ?? 0, height: entry?.h ?? 0 };
  }

  const widths = [...entry.thumbs].sort((a, b) => a - b);
  const key = manifestKey(heroImage);

  return {
    // src 用最大的縮圖當不支援 srcset 時的保底
    src: thumbUrl(key, widths[widths.length - 1]),
    srcSet: widths.map((w) => `${thumbUrl(key, w)} ${w}w`).join(", "),
    width: entry.w,
    height: entry.h,
  };
}
