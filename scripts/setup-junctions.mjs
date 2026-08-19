#!/usr/bin/env node
/**
 * 新機器 clone 之後跑一次：建立指向 OneDrive 的目錄連結（Windows junction）。
 *
 * 為什麼需要：論文與存檔（drone-papers、warfare-papers、articles 等）的實體檔案
 * 在 OneDrive、走檔案同步，不進 git；但 repo 內的流程（文章小隊查核來源、
 * post-push-archive hook 存檔）都用相對路徑讀它們。junction 讓兩邊對得上，
 * 不必在每台機器記兩套路徑。詳見 CLAUDE.md〈論文與存檔資料夾〉。
 *
 * 用法：
 *   node scripts/setup-junctions.mjs                    # 用 %OneDrive% 自動推路徑
 *   node scripts/setup-junctions.mjs "D:\\OneDrive\\..."  # 指定 OneDrive 裡的 skyfaring 資料夾
 *
 * 已存在的連結不動、不覆寫。建立 junction 不需要系統管理員權限。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LINKS = ["drone-papers", "warfare-papers", "basketball-papers", "flight-papers", "articles", "maritime-reports"];

function defaultBase() {
  const od = process.env.OneDrive || process.env.OneDriveConsumer || process.env.OneDriveCommercial;
  return od ? path.join(od, "02_創作", "14_AI TEST", "skyfaring") : null;
}

const base = process.argv[2] || defaultBase();
if (!base) {
  console.error("找不到 OneDrive 路徑。請把 OneDrive 裡的 skyfaring 資料夾當參數傳進來：");
  console.error('  node scripts/setup-junctions.mjs "D:\\OneDrive\\02_創作\\14_AI TEST\\skyfaring"');
  process.exit(1);
}
if (!fs.existsSync(base)) {
  console.error(`OneDrive 目標資料夾不存在：${base}`);
  console.error("確認 OneDrive 已同步完成，或用參數指定正確路徑。");
  process.exit(1);
}

console.log(`OneDrive 來源：${base}`);
console.log(`repo 根目錄：${ROOT}\n`);

let created = 0;
let failed = 0;
for (const name of LINKS) {
  const link = path.join(ROOT, name);
  const target = path.join(base, name);
  if (fs.existsSync(link)) {
    console.log(`  已存在，略過  ${name}`);
    continue;
  }
  if (!fs.existsSync(target)) {
    console.log(`  來源沒有這個資料夾，略過  ${name}`);
    continue;
  }
  try {
    fs.symlinkSync(target, link, "junction");
    console.log(`  已建立        ${name} -> ${target}`);
    created += 1;
  } catch (e) {
    console.log(`  建立失敗      ${name}：${e.message}`);
    failed += 1;
  }
}

console.log(`\n完成：新建 ${created} 個，失敗 ${failed} 個。`);
if (failed) process.exit(1);
