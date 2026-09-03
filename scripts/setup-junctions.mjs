#!/usr/bin/env node
/**
 * 新機器 clone 之後跑一次：建立指向 skyfaring-research repo 的目錄連結（Windows junction）。
 *
 * 為什麼需要：論文、存檔與排程管線（drone-papers、warfare-papers、articles、
 * scripts/review-dashboard、data 等）的實體檔案在 skyfaring-research 這個私有 repo，
 * 不進 skyfaring；但 repo 內的流程（文章小隊查核來源、post-push-archive hook 存檔、
 * 儀表板腳本）都用相對路徑讀它們。junction 讓兩邊對得上，不必在每台機器記兩套路徑。
 * 詳見 CLAUDE.md〈論文與存檔資料夾〉。
 *
 * 用法：
 *   node scripts/setup-junctions.mjs                          # 用 repo 同層的 ../skyfaring-research
 *   node scripts/setup-junctions.mjs "D:\\repos\\skyfaring-research"  # 指定別的位置
 *
 * 已存在的連結不動、不覆寫。建立 junction 與硬連結都不需要系統管理員權限。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO_URL = "https://github.com/lioneer32232002-commits/skyfaring-research.git";

// 目錄用 junction
const LINKS = [
  "drone-papers",
  "basketball-papers",
  "warfare-papers",
  "flight-papers",
  "articles",
  "maritime-reports",
  "scripts/review-dashboard",
  "scripts/drone-index",
  "drafts",
  "reviews",
  "automation",
  "data",
];

// 檔案不能 junction，用硬連結（要求兩個 repo 在同一顆磁碟）
const HARDLINKS = ["shown_papers.md", "drone-index.csv"];

function defaultBase() {
  return path.resolve(ROOT, "..", "skyfaring-research");
}

const base = process.argv[2] || defaultBase();
if (!fs.existsSync(base)) {
  console.error(`找不到 skyfaring-research：${base}`);
  console.error("先把資料 repo clone 到 skyfaring 的同一層母目錄：");
  console.error(`  git clone ${REPO_URL} "${base}"`);
  console.error("clone 在別的位置就用參數指定：");
  console.error('  node scripts/setup-junctions.mjs "D:\\repos\\skyfaring-research"');
  process.exit(1);
}

console.log(`資料來源：${base}`);
console.log(`repo 根目錄：${ROOT}\n`);

let created = 0;
let failed = 0;
let copied = 0;

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
    fs.mkdirSync(path.dirname(link), { recursive: true });
    fs.symlinkSync(target, link, "junction");
    console.log(`  已建立 junction ${name} -> ${target}`);
    created += 1;
  } catch (e) {
    console.log(`  建立失敗      ${name}：${e.message}`);
    failed += 1;
  }
}

for (const name of HARDLINKS) {
  const link = path.join(ROOT, name);
  const target = path.join(base, name);
  if (fs.existsSync(link)) {
    console.log(`  已存在，略過  ${name}`);
    continue;
  }
  if (!fs.existsSync(target)) {
    console.log(`  來源沒有這個檔案，略過  ${name}`);
    continue;
  }
  try {
    fs.linkSync(target, link);
    console.log(`  已建立 硬連結 ${name} -> ${target}`);
    created += 1;
  } catch (e) {
    // 跨磁碟建不了硬連結，退回複製一份；以 skyfaring-research 的版本為準
    try {
      fs.copyFileSync(target, link);
      console.log(`  硬連結失敗，已改複製 ${name}（${e.code}）。`);
      console.log(`     兩邊不會同步，改動請以 ${target} 為準。`);
      copied += 1;
    } catch (e2) {
      console.log(`  建立失敗      ${name}：${e2.message}`);
      failed += 1;
    }
  }
}

console.log(`\n完成：新建 ${created} 個，複製 ${copied} 個，失敗 ${failed} 個。`);
if (failed) process.exit(1);
